const express = require('express');
const router = express.Router();
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
var url = require('url');



router.get('/', async (req, res) => {
    var listPoll;
    let data = {};
    var query = url.parse(req.url, true).query;
    if (undefined == query.filtrar) {
        listPoll = await pool.query('SELECT * FROM polls', [0]);
    } else {
        listPoll = await pool.query('SELECT * FROM polls WHERE poll LIKE ?', ['%' + query.filtrar + '%']);
        console.log("LiP:", listPoll);
        if (listPoll.length <= 0) {
            console.log("funciona");
            listPoll = await pool.query('SELECT * from polls where concat_ws(\'\', id,WEEKDAY(date)+1, extract(month from date),extract(day from date)) like ?', ['%' + query.filtrar + '%']);
            console.log("LiP numero:", listPoll);

        }
    }
    if (0 < listPoll.length){
        data = paginator(listPoll, req.query.pagina, 3, "/", "");
    }else{
        data = {
            pagi_info: "No hay datos que mostrar",
        };
    }
    res.render('index/index', { data });
});
router.get('/slider', async (req, res) => {
    res.render('partials/slider1');


});
router.get('/slider', async (req, res) => {
    res.render('partials/slider2');


});
router.get('/slider', async (req, res) => {
    res.render('partials/slider3');


});
router.get('/slider', async (req, res) => {
    res.render('partials/slider4');


});
router.get('/slider', async (req, res) => {
    res.render('partials/slider5');


});

router.get('/confir', async (req, res) => {
    //codificar.codificar(polls);
    const polls={
        date: new Date()
    };
    //codificar(polls);
    const kode=Promise.resolve(codificar(polls));
    kode.then((a)=>{
        return a;
    });

   // res.render('poll/confir',{a});
   // res.sendFile('poll/confir',{kode})
    //res.sendDate('poll/confir',{kode});
    res.set('poll/confir',{kode});

});
async function codificar(polls) {

    const idPoll = await pool.query("SELECT id from polls order by id desc limit 1");
    console.log("iP:", idPoll[0].id);
    console.log("Codigo_kode: " + idPoll[0].id + polls.date.getDay() + (polls.date.getMonth() + 1) + polls.date.getDate());
    //let alert = require("alert");
   // alert("Codigo de Encuesta: " + idPoll[0].id + polls.date.getDay() + (polls.date.getMonth() + 1) + polls.date.getDate());
   // return "koodigo" + idPoll[0].id + polls.date.getDay() + (polls.date.getMonth() + 1) + polls.date.getDate();
     var kde=`${idPoll[0].id }${ polls.date.getDay()}${ (polls.date.getMonth() + 1) }${ polls.date.getDate()}`;
     return kde;

}

module.exports = router;

