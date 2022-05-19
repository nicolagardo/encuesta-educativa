const express = require('express');
const router = express.Router();
const pool = require('../connection');
const { paginator } = require('../lib/paginator');
var url = require('url');

router.get('/inscriptions', async (req, res) => {
    var condicion = "polls.id=inscriptions.poll_id";
    var campos = "polls.id,polls.poll,polls.responses,polls.user_id,polls.date,inscriptions.response,inscriptions.response_id,inscriptions.id_in";
    var listPoll;
    let data = {};
    var query = url.parse(req.url, true).query;
    if (undefined == query.filtrar){
        listPoll = await pool.query("SELECT " + campos + " FROM polls Inner Join inscriptions ON " + condicion+' WHERE inscriptions.user_id =?', [req.user.id]);
    }else{
        listPoll = await pool.query("SELECT " + campos + " FROM polls Inner Join inscriptions ON " + condicion +' WHERE inscriptions.user_id =? AND poll LIKE ?', [req.user.id,'%' +query.filtrar+ '%']);
    }
    if (0 < listPoll.length){
        data = paginator(listPoll, req.query.pagina, 3, "/inscriptions", "http://localhost:8080");
    }else{
        data = {
            pagi_info: "No hay datos que mostrar",
          };
    }
    res.render('inscriptions/inscriptions', { data });
});
router.get('/deleteVote/:id', async (req, res) => {
    const { id } = req.params;
    await pool.beginTransaction(async (err) => {
        let inscription = await pool.query("SELECT * FROM inscriptions WHERE id_in =?", [id]);
        let responses = await pool.query("SELECT * FROM responses WHERE id =?", [inscription[0].response_id]);
        let votes = responses[0].votes;
        votes--;
        let data = [votes, responses[0].id];
        pool.query('UPDATE responses SET votes = ? WHERE id =?', data, (err, result) =>{
            if (err) {
                pool.rollback(() => {
                    throw err;
                });
            }
            pool.query('DELETE FROM inscriptions WHERE id_in = ?', [id], (err, result) =>{
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
            res.redirect('/inscriptions');
        });
    });
    console.log(id);
});
module.exports = router;