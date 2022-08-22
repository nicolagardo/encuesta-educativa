const express = require('express');
const passport = require('passport');
const router = express.Router();
const { check, validationResult, body } = require('express-validator');
const {isNotLoggedIn} = require('../lib/auth');

// NOTE: Crear usuario

router.get('/signup',isNotLoggedIn,(req, res) =>{
    res.render('auth/signup');
});
router.post('/signup', [
    check('first_name').not().isEmpty().withMessage('Nombre es requerido').isLength({min:3}).withMessage('Largo mínimo del nombre 3 caracteres'),
    check('last_name').not().isEmpty().withMessage('Apellido es requerido').isLength({min:3}).withMessage('Largo mínimo del apellido 3 caracteres'),
    check('user_name').not().isEmpty().withMessage('Username es requerido').isLength({min:4}).withMessage('Largo mínimo del usuario 4 caracteres'),
    check('email').not().isEmpty().withMessage('Email es requerido').isLength({min:9})
    .isEmail().withMessage('Email inválido'),
    check('password').not().isEmpty().withMessage('Password es requerido').isLength({ min: 6, max: 16 } ).withMessage('Largo de contraseña: mínimo 6 caracteres, máximo 16'),
    // check('repeat_password').not().isEmpty().withMessage('Los passwords no son iguales'),
    // body('password').isLength({ min: 5 }),
    check('repeat_password').custom((value, { req }) => {
        console.log(req.body.password)
        console.log('value: ',value)
      if (value !== req.body.password) {
        throw new Error('La confiramción del password no coinicide');
      }else
      return true;}),
],(req, res,next) =>{
   
    const errors = validationResult(req);
    console.log('====================================');
    console.log(errors);
    console.log('====================================');
    if (!errors.isEmpty()) {
        res.render('auth/signup', {data:req.body, errors:  errors.array() });
    }else{
       next(); 
    }
}
,
passport.authenticate('local.signup', {
    successRedirect: '/listPoll', /*cuando incia sesion direcciona a lista de encuestas del usuario*/
    failureRedirect: '/signup',
    
})
);

// NOTE: Loguearse

router.get('/signin',isNotLoggedIn,(req, res) =>{
    res.render('auth/signin');
});
router.post('/signin', [
    check('email').not().isEmpty().withMessage('Email es requeido')
    .isEmail().withMessage('Email no encontrado'),
    check('password').not().isEmpty().withMessage('Contraseña es requerido')
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
// router.get('/resetemail', (req, res) => {
//     res.render('auth/reset-email');
// });

// NOTE: Cambiar contraseña

router.get('/reset-email', (req, res) => {
    res.render('auth/reset-email');
});

router.patch('/reset-email', [
    check('password').not().isEmpty().withMessage('Password es requerido')
    .isArray({ min: 6, max: 10 } )   
],(req, res,next) =>{
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       
        res.render('/signin', {data:req.body, errors:  errors.array() });
    }else{
        res.render(errors.array())
    //    next(); 
    }
},passport.authenticate('local.signin', {
    successRedirect: '/signin',
    failureRedirect: '/signin',
    
}));




// NOTE: Recuperar contreseña

router.get('/forgot', (req, res) => {
    res.render('auth/forgot');
});

router.patch('/forgot', [
    check('email').not().isEmpty().withMessage('Email es requeido')
    .isEmail().withMessage('Email no encontrado')
],(req, res,next) =>{
   
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       
        res.render('/signin', {data:req.body, errors:  errors.array() });
    }else{
        res.render(errors.array())
    //    next(); 
    }
},passport.authenticate('local.signin', {
    successRedirect: '/signin',
    failureRedirect: '/signin',
    
}));


// NOTE: Cerrar Sesió
router.get('/logout', (req, res) => {
    req.logOut();
    res.redirect('/');
});

module.exports = router;