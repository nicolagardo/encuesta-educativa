const express = require('express');
const passport = require('passport');
const router = express.Router();
const { check, validationResult } = require('express-validator');

router.get('/signup',(req, res) =>{
    res.render('auth/signup');
});


router.post('/signup', [
    check('email').isEmail().withMessage('Email es requerido')
],(req, res,next) =>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('auth/signup', { errors:  errors.array() });
    }else{
       next(); 
    }

},passport.authenticate('local.signup', {
    successRedirect: '/polls',
    failureRedirect: '/signup',
   
}));
module.exports = router;