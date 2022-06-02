const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
const { check, validationResult } = require('express-validator');
var url = require('url');

router.get('/listPoll', async (req, res) => {
  let listPoll;
  let data = {};
  var query = url.parse(req.url, true).query;
  if (undefined == query.filtrar){
     listPoll = await pool.query('SELECT * FROM polls WHERE user_id = ?', [req.user.id]);
  }else{
    listPoll = await pool.query('SELECT * FROM polls WHERE user_id = ? AND poll LIKE ?', [req.user.id,'%' +query.filtrar+ '%']);
  }
  if (0 < listPoll.length){
    data = paginator(listPoll, req.query.pagina, 1, "/listPoll", "http://localhost:8080");
  }else{
    data = {
      pagi_info: "No hay datos que mostrar",
    };
  }
 
  res.render('poll/listPoll', { data });
});

router.get('/createPoll', isLoggedIn, async (req, res) => {

  res.render('poll/creaatePoll');
});

router.post('/createPoll', isLoggedIn, async (req, res) => {
  console.log(" QUE JORACA ES ESTO: ",req.body);
  const { poll, response } = req.body;
  let responses = response.length;
  let polls = {
    poll,
    responses,
    user_id: req.user.id,
    date: new Date()
  };
  console.log("POLLS: ",polls);
  await pool.beginTransaction((err) => {
    if (err) { throw err; }
    pool.query('INSERT INTO polls SET ?', polls, (err, result) => {
      if (err) {
        pool.rollback(() => {
          throw err;
        });
      }
      console.log("result ",result);

      var polls_id = result.insertId;
      console.log("polls_id ",polls_id);
      console.log("response ",response);
      response.forEach(element => {
        let res = {
          response: element,
          votes: 0,
          polls_id: polls_id
        };
        console.log("RES: ",res);
        pool.query('INSERT INTO responses SET ?', res, (err, result) => {
          if (err) {
            pool.rollback(() => {
              throw err;
            });
          }
        });
      });
      pool.commit((err) => {
        if (err) {
          pool.rollback(() => {
            throw err;
          });
        }
        console.log('Transaction Complete.');
        res.redirect('/listPoll');
      });
    });

  });
});

router.get('/details', async (req, res) => {
  var query = url.parse(req.url, true).query;
  var condicion = "polls.id=responses.polls_id";
  var campos = "polls.id,polls.poll,polls.responses,polls.user_id,polls.date"
    + ",responses.response,responses.votes";
  const listPoll = await pool.query("SELECT " + campos + " FROM polls Inner Join responses ON " + condicion + " WHERE polls.id =?", [query.id]);
  console.log("[query.id]: ",[query.id]);
  console.log("listPoll: ",listPoll);
  
  let responses2 = new Array();
  let votes = 0;
  for (let i = 0; i < listPoll.length; i++) {
    let responses1 = new Array();
    responses1[0] = listPoll[i].response;
    responses1[1] = listPoll[i].votes;
    votes += listPoll[i].votes;
    responses2[i] = responses1;
  }
  let responses = JSON.stringify(responses2);
  responses = JSON.parse(responses);
  console.log(responses);
  var data = listPoll[0];
  res.render('poll/details',{data,responses,votes});
});
//const responses = pool.query("SELECT * FROM responses WHERE polls_id =?", [query.id]);

var poll;
var poll_id;
router.get('/votes', async (req, res) =>{
  console.log("req: ",req);
  const query = url.parse(req.url, true).query;
  poll_id = query.id;
  const responses = await pool.query("SELECT * FROM responses WHERE polls_id =?", [query.id]);
  let inscription = await pool.query("SELECT * FROM inscriptions WHERE poll_id =?", [query.id]);
  // console.log("query: ",query);
  console.log("us id: ",req.user.id);
  const listPollUserId = req.user.id;
  console.log("RESPONSESSS: ", responses);
  let value  = true;
  if (0 < inscription.length){
    value  = false;
  }
  
  poll = query.poll;
  res.render('poll/votes',{responses,poll,value});  
});
router.post('/votes',[
  check('response').not().isEmpty().withMessage('Select one of the options')
], async (req, res) =>{
  const errors = validationResult(req);
  const query = url.parse(req.url, true).query;

  const responses = await pool.query("SELECT * FROM responses WHERE polls_id =?", [query.id]);

  if (!errors.isEmpty()) {
    res.render('poll/votes', {responses,poll,errors:  errors.array() });
  }else{
    const { response } = req.body;
    console.log("ESTE response que tiene: ", response);
    let responses = await pool.query("SELECT * FROM responses WHERE id =?", [response]);
    console.log("responses!! ", responses);
    let vote = responses[0].votes;
    var respon = responses[0].response;
    vote++;
    let response_id = parseInt(response, 10);
    let data = [vote, response_id];
    await pool.beginTransaction((err) =>{
      pool.query('UPDATE responses SET votes = ? WHERE id =?', data, (err, result)=> {
        if (err) { 
          pool.rollback(() => {
            throw err;
          });
        }
        //TODO:id
        let id = 8;
        console.log("***************DATA+++++++++++++: ");
        console.log("***************DATA+++++++++++++: ",data);
        console.log("RESPON: ", respon);
        let res = {
          poll_id: poll_id,
          user_id: id,
          response: respon,
          response_id: response_id,
          date: new Date()
        }; 
        console.log("+++++++++Que user_id intenta insertar:", res.user_id);
        pool.query('INSERT INTO inscriptions SET ?', res, (err, result) => {
          if (err) {
            pool.rollback(() => {
              throw err;
            });
          }
        }); 
      });
      pool.commit((err) => {
        if (err) {
          pool.rollback(() => {
            throw err;
          });
        }
        res.redirect('/details?id=' + responses[0].polls_id);
      });
    });
  }
  console.log("QUE ES ESTOooo",req.body);

});
router.get('/delete/:id', async (req, res) =>{
  const { id } = req.params;
  await pool.beginTransaction((err) =>{
    if (err) { throw err; }
    pool.query('DELETE FROM responses WHERE polls_id = ?', [id], (err, result) => {
      if (err){
        pool.rollback(() => {
          throw err;
        });
      }
      pool.query('DELETE FROM polls WHERE id = ?', [id], (err, result) =>{
        if (err){
          pool.rollback(() => {
            throw err;
          });
        }
      });
      pool.commit((err) =>{
        if (err){
          pool.rollback(() => {
            throw err;
          });
        }
        res.redirect('/listPoll');
      });
    });
  });
  console.log(id);

});
module.exports = router;
