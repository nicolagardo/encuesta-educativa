const express = require('express');
const router = express.Router();
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
var url = require('url');

router.get('/',async(req,res)=>{
    var listPoll;
    let data = {};
    var query = url.parse(req.url, true).query;
    if (undefined == query.filtrar){
        listPoll = "No hay datos que mostrar"
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
module.exports = router;

