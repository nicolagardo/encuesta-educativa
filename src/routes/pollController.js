const express = require('express');
const router = express.Router();
const { isLoggedIn } = require('../lib/auth');
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
const { check, validationResult } = require('express-validator');
var url = require('url');
//const io = require("socket.io-client");

router.get('/listPoll', async (req, res) => {
  let listPoll;
  let data = {};
  var query = url.parse(req.url, true).query;
  if (undefined == query.filtrar) {
    console.log("req.user.id: ",req.user.id );
    listPoll = await pool.query('SELECT * FROM polls WHERE user_id = ?', [req.user.id]);
  } else {
    console.log("aca entonces");
    listPoll = await pool.query('SELECT * FROM polls WHERE user_id = ? AND poll LIKE ?', [req.user.id, '%' + query.filtrar + '%']);
  }
  const usuarioId = req.user.id;
  data = await pool.query(`SELECT * FROM polls WHERE user_id =${usuarioId}`)
  if (0 < listPoll.length) {
    data = paginator(listPoll, req.query.pagina, 1, "/listPoll", "");
  } else {
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
  //console.log(" QUE JORACA ES ESTO: ",req.body);
  const { poll, response } = req.body;
  let responses = response.length;
  let multipleC = req.body.multiplechoice;
  let polls = {
    poll,
    responses,
    user_id: req.user.id,
    date: new Date(),
    multiplechoice: multipleC

  };
  console.log("dia:", polls.date.getDay(), polls.date.getMonth(), polls.date.getDate());
  await pool.beginTransaction((err) => {

    if (err) { throw err; }
    pool.query('INSERT INTO polls SET ?', polls, (err, result) => {
      if (err) {
        console.log("ERRRRRRRRRRRROR",err);
        pool.rollback(() => {
          throw err
          console.log("ESTE ES EL ERROR: ",err);;
        });
      }
      //console.log("result ",result);

      var polls_id = result.insertId;
      console.log("polls_id ",polls_id);
      //console.log("response ",response);
      response.forEach(element => {
        let res = {
          response: element,
          votes: 0,
          polls_id: polls_id
        };
        //console.log("RES: ",res);
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
        codificar(polls);
        const codiguito = codificar(polls);
        console.log("Test de codigo: ", codiguito.promise());
        console.log('Transaction Complete.');
        

        res.redirect('/listPoll');
        //res.redirect('/confir');
      });
      
    });


    //alert("Codigo: "+obtenerId()+polls.date.getDay()+polls.date.getMonth()+polls.date.getDate());


  });

});

async function codificar(polls) {

  const idPoll = await pool.query("SELECT id from polls order by id desc limit 1");
  console.log("iP:", idPoll[0].id);
  const date = new Date();
  console.log(date);
  console.log("Codigo: " + idPoll[0].id + polls.date.getDay() + (polls.date.getMonth()+1) + polls.date.getDate());
  const codigoJuego = "Codigo: " + idPoll[0].id + polls.date.getDay() + (polls.date.getMonth()+1) + polls.date.getDate();
  let alert=require('alert')
  alert("Codigo de Encuesta: "+ idPoll[0].id + polls.date.getDay() + (polls.date.getMonth()+1) + polls.date.getDate());
  return codigoJuego;






}


//let socket = io()
//socket.emit('votook', 'alguien esta por votar');
router.get('/details', async (req, res) => {
  var query = url.parse(req.url, true).query;
  var condicion = "polls.id=responses.polls_id";
  var campos = "polls.id,polls.poll,polls.responses,polls.user_id,polls.date,polls.multiplechoice"
    + ",responses.response,responses.votes";
    
  const listPoll = await pool.query("SELECT " + campos + " FROM polls Inner Join responses ON " + condicion + " WHERE polls.id =?", [query.id]);
  //let multiple= await pool.query("SELECT multiplechoice FROM polls WHERE polls.id =?", [query.id]);
  //console.log("query.id",query);

  let responses2 = new Array();
  let votes = 0;
  for (let i = 0; i < listPoll.length; i++) {
    let responses1 = new Array();
    //console.log("ValP:",listPoll[i]);
    responses1[0] = listPoll[i].response;
    responses1[1] = listPoll[i].votes;
    votes += listPoll[i].votes;
    responses2[i] = responses1;
  }
  let responses = JSON.stringify(responses2);
  responses = JSON.parse(responses);
  //console.log("valor: ",responses);
  var data = listPoll[0];
  console.log(`data que va a details: ${data}`);
  var multiple = listPoll[0].multiplechoice;

  res.render('poll/details', { data, responses, votes, multiple });



});
var responses;
var poll;
var poll_id;
router.get('/votes', async (req, res) => {
  var query = url.parse(req.url, true).query;
  poll_id = query.id;
  let multiple = query.multiple;

  //console.log("valor:",multiple);
  responses = await pool.query("SELECT * FROM responses WHERE polls_id =?", [query.id]);
  let inscription = await pool.query("SELECT * FROM inscriptions WHERE poll_id =?", [poll_id]);
  let value = true;
  if (0 < inscription.length) {
    value = true;
  }
  //console.log(responses);
  poll = query.poll;
  if (multiple == 1) {
    res.render('poll/multiplechoice', { responses, poll, value, multiple });
  } else {
    res.render('poll/votes', { responses, poll, value, multiple });
  }


});
router.post('/votes', [
  check('response').not().isEmpty().withMessage('Seleccionar una opción')
], async (req, res) => {
  const errors = validationResult(req);
  //console.log("en el router. post /votes");
  if (!errors.isEmpty()) {
    res.render('poll/votes', { responses, poll, errors: errors.array() });
    console.log("ENTRA AL RENDER");
  } else {
    
    const { response } = req.body;
    //console.log("response: ", response);
    let responses = await pool.query("SELECT * FROM responses WHERE id =?", [response]);
    //console.log("ACA PODRIA EMITIR EL EVENTO Socket");
    let vote = responses[0].votes;
    var respon = responses[0].response;
    vote++;
    let response_id = parseInt(response, 10);
    let data = [vote, response_id];
    await pool.beginTransaction((err) => {
      //console.log("DATAAAAAAAA: ", data);
      pool.query('UPDATE responses SET votes = ? WHERE id =?', data, (err, result) => {
        if (err) {
          pool.rollback(() => {
            throw err;
          });
        }
        let res = {
          poll_id: poll_id,
          // user_id: req.user.id,
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
  //console.log(req.body);

});
router.post('/multiplechoice', [
  check('response').not().isEmpty().withMessage('Seleccionar al menos una opción')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.render('poll/multiplechoice', { responses, poll, errors: errors.array() });
  } else {
    //editar aca
    const { response } = req.body;
    console.log("response en multiplechoice ", response);
    response.forEach(respuesta => {
      cargarMultiple(respuesta);
    })
    pool.commit((err) => {
      if (err) {
        pool.rollback(() => {
          throw err;
        });
      }
      res.redirect('/details?id=' + response);
    });
  }
  //console.log(req.body);

});
 async function cargarMultiple(respuesta, userid) {
  //console.log("usuario", userid);

  let responses = await pool.query("SELECT * FROM responses WHERE id =?", respuesta);
  //console.log("Res:", responses[0]);
  let vote = responses[0].votes;
  var respon = responses[0].response;
  vote++;
  let response_id = parseInt(respuesta, 10);
  let data = [vote, response_id];
  await pool.beginTransaction((err) => {
    pool.query('UPDATE responses SET votes = ? WHERE id =?', data, (err, result) => {
      if (err) {
        pool.rollback(() => {
          throw err;
        });
      }
      let res = {
        poll_id: poll_id,
        //user_id: userid,
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

  });

}
router.get('/delete/:id', async (req, res) => {
  const { id } = req.params;
  await pool.beginTransaction((err) => {
    if (err) { throw err; }
    pool.query('DELETE FROM responses WHERE polls_id = ?', [id], (err, result) => {
      if (err) {
        pool.rollback(() => {
          throw err;
        });
      }
      pool.query('DELETE FROM polls WHERE id = ?', [id], (err, result) => {
        if (err) {
          pool.rollback(() => {
            throw err;
          });
        }
      });
      pool.commit((err) => {
        if (err) {
          pool.rollback(() => {
            throw err;
          });
        }
        res.redirect('/listPoll');
      });
    });
  });
  //console.log("id ",id);

});
module.exports = router;
