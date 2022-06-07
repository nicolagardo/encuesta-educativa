const pool = require('./../../connection')
async function codificar() {
    // const date=new Date();
    // const idPoll = await pool.query("SELECT id from polls order by id desc limit 1");
    // console.log("iP:", idPoll[0].id);
    // console.log("Codigo: " + idPoll[0].id + date.getDay() + (date.getMonth()+1) + date.getDate());
    
    var codigo= `soy codificar`//idPoll[0].id + date.getDay() + (date.getMonth()+1) + date.getDate();
    /*let alert=require("alert");
    alert("Codigo de Encuesta: "+ idPoll[0].id + date.getDay() + (date.getMonth()+1) + date.getDate());*/
    return codigo.promise();
  
  }
