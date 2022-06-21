const express = require('express');
const router = express.Router();
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
var url = require('url');

router.get('/',async(req,res)=>{
    console.log('en el home');
    var listPoll;
    let data = {};
    var query = url.parse(req.url, true).query;
    if (undefined == query.filtrar){
        console.log('primer if');
        listPoll = await pool.query('SELECT * FROM polls', [0]);
        console.log('listPOll',listPoll);
    }else{
        listPoll = await pool.query('SELECT * FROM polls WHERE poll LIKE ?', ['%' +query.filtrar+ '%']);
        console.log("LiP:",listPoll);
        if (listPoll.length<=0) {
            console.log("funciona");
            listPoll = await pool.query('SELECT * from polls where concat_ws(\'\', id,WEEKDAY(date)+1, extract(month from date),extract(day from date)) like ?', ['%' +query.filtrar+ '%']);
            console.log("LiP numero:",listPoll);
            
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
router.get('/slider',async(req,res)=>{
    res.render('partials/slider1');


});
router.get('/slider2',async(req,res)=>{
    res.render('partials/slider2');


});
router.get('/slider',async(req,res)=>{
    res.render('partials/slider3');


});
router.get('/slider',async(req,res)=>{
    res.render('partials/slider4');


});
router.get('/slider',async(req,res)=>{
    res.render('partials/slider5');


});
router.get('/confir', async (req, res) => {
    //codificar.codificar(polls);
    const polls={
        date: new Date()
    };
    
    const esperandoACofificar = await codificar(polls)
    
     const ob = {
         anda: esperandoACofificar
    }

    res.render('poll/confir',{ob});
  

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
router.get('/about',async(req,res)=>{
    res.render('partials/about');


});
module.exports = router;

