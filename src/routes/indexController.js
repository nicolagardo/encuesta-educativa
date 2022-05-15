const express = require('express');
const router = express.Router();

router.get('/',(req,res)=>{
    //res.send("Proyecto encuestasss");
    res.render('index/index');
});
module.exports = router;