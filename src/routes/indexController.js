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
        listPoll = await pool.query('SELECT * FROM polls', [0]);
    }else{
        listPoll = await pool.query('SELECT * FROM polls WHERE poll LIKE ?', ['%' +query.filtrar+ '%']);
    }
    if (0 < listPoll.length){
        data = paginator(listPoll, req.query.pagina, 3, "/", "http://localhost:8080");
    }else{
        data = {
            pagi_info: "No hay datos que mostrar",
          };
    }
    res.render('index/index', { data });
});
module.exports = router;

