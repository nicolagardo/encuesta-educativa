const express = require('express');
const router = express.Router();
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
var url = require('url');

router.get('/',async(req,res)=>{
    
    var listPoll;
    let data = {};
    var query = url.parse(req.url, true).query;
    

    if (query.filtrar){
        listPoll = await pool.query('SELECT * FROM polls WHERE poll LIKE ?', ['%' +query.filtrar+ '%']);
        console.log("LiP:",listPoll);
        if (listPoll.length<=0) {
            console.log("funciona");
            listPoll = await pool.query('SELECT * from polls where concat_ws(\'\', id,WEEKDAY(date)+1, extract(month from date),extract(day from date)) like ?', ['%' +query.filtrar+ '%']);
            console.log("LiP numero:",listPoll);
            
        }
        if (0 < listPoll.length){
            data = paginator(listPoll, req.query.pagina, 3, "", "");
           
        }else{
            data = {
                pagi_info: "No hay datos que mostrar",
              };
        }
      
    }else{
        listPoll = 0;
        data = {
            pagi_info: "No se encontraron coinicidencias",
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
router.get('/slider3',async(req,res)=>{
    res.render('partials/slider3');


});
router.get('/slider4',async(req,res)=>{
    res.render('partials/slider4');


});
router.get('/slider5',async(req,res)=>{
    res.render('partials/slider5');



});
router.get('/slider6',async(req,res)=>{
    res.render('partials/slider6');



});
router.get('/slider7',async(req,res)=>{
    res.render('partials/slider7');



});
router.get('/slider8',async(req,res)=>{
    res.render('partials/slider8');


});
router.get('/slider9',async(req,res)=>{
    res.render('partials/slider9');


});
router.get('/slider10',async(req,res)=>{
    res.render('partials/slider10');


});
router.get('/slider11',async(req,res)=>{
    res.render('partials/slider11');


});
router.get('/slider12',async(req,res)=>{
    res.render('partials/slider12');


});
router.get('/sliderSugerencia',async(req,res)=>{
    res.render('partials/sliderSugerencia');



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

