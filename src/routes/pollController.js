const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
const { check, validationResult } = require('express-validator');
var url = require('url');

router.get('/listPoll', isLoggedIn, async (req, res) => {
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
  //console.log(req.body);
  const { poll, response } = req.body;
  let responses = response.length;
  let polls = {
    poll,
    responses,
    user_id: req.user.id,
    date: new Date()
  };
  console.log(polls);
  await pool.beginTransaction((err) => {
    if (err) { throw err; }
    pool.query('INSERT INTO polls SET ?', polls, (err, result) => {
      if (err) {
        pool.rollback(() => {
          throw err;
        });
      }
      console.log(result);
      var polls_id = result.insertId;
      response.forEach(element => {
        let res = {
          response: element,
          votes: 0,
          polls_id: polls_id
        };
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
var responses;
var poll;
var poll_id;
router.get('/votes', isLoggedIn, async (req, res) =>{
  var query = url.parse(req.url, true).query;
  poll_id = query.id;
  responses = await pool.query("SELECT * FROM responses WHERE polls_id =?", [query.id]);
  let inscription = await pool.query("SELECT * FROM inscriptions WHERE poll_id =? AND user_id =?", [poll_id,req.user.id]);
  let value  = true;
  if (0 < inscription.length){
    value  = false;
  }
  console.log(responses);
  poll = query.poll;
  res.render('poll/votes',{responses,poll,value});  
});
router.post('/votes',[
  check('response').not().isEmpty().withMessage('Select one of the options')
], isLoggedIn, async (req, res) =>{
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('poll/votes', {responses,poll,errors:  errors.array() });
  }else{
    const { response } = req.body;
    let responses = await pool.query("SELECT * FROM responses WHERE id =?", [response]);
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
        let res = {
          poll_id: poll_id,
          user_id: req.user.id,
          response: respon,
          response_id: response_id,
          date: new Date()
        }; 
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
  console.log(req.body);

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
