const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

passport.use('local.signup',new LocalStrategy({
    usernameField:'username',
    passwordField: 'password',
    passReqToCallback: true
},async (req,done)=>{
    console.log(req.body);
}));