const express = require('express');
const passport = require('passport');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const {isNotLoggedIn} = require('../lib/auth');

router.get('/signup',isNotLoggedIn,(req, res) =>{
    res.render('auth/signup');
});
router.post('/signup', [
    check('first_name').not().isEmpty().withMessage('Nombre es requerido'),
    check('last_name').not().isEmpty().withMessage('Apellido es requerido'),
    check('user_name').not().isEmpty().withMessage('Username es requerido'),
    check('email').not().isEmpty().withMessage('Email es requerido')
    .isEmail().withMessage('Email invalido'),
    check('password').not().isEmpty().withMessage('Password es requerido')
],(req, res,next) =>{
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('auth/signup', {data:req.body, errors:  errors.array() });
    }else{
       next(); 
    }
},passport.authenticate('local.signup', {
    successRedirect: '/listPoll', /*cuando incia sesion direcciona a lista de encuestas del usuario*/
    failureRedirect: '/signup',
    
}));
router.get('/signin',isNotLoggedIn,(req, res) =>{
    res.render('auth/signin');
});
router.post('/signin', [
    check('email').not().isEmpty().withMessage('Email es requeido')
    .isEmail().withMessage('Email no encontrado'),
    check('password').not().isEmpty().withMessage('Password es requerido')
],(req, res,next) =>{
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.render('auth/signin', {data:req.body, errors:  errors.array() });
    }else{
       next(); 
    }
},passport.authenticate('local.signin', {
    successRedirect: '/listPoll',
    failureRedirect: '/signin',
    
}));
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});
module.exports = router;