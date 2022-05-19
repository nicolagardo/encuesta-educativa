const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const MySQLStore = require('express-mysql-session');
const session = require('express-session');
const { database } = require('./config');

// Intializations
const app = express();
require('./lib/passport');
// Settings
app.set('port', process.env.PORT || 8080);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
}));
app.set('view engine', '.hbs');

// Middlewares
app.use(session({
  secret: 'pdhnencuestas',
  resave: false,
  saveUninitialized: false,
  store: new MySQLStore(database)
}));

app.use(express.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  app.locals.user = req.user;
  app.locals.res = res;
  next();
});

app.use(require('./routes/indexController'));
app.use(require('./routes/authController'));
app.use(require('./routes/pollController'));
app.use(require('./routes/inscriptionsController'));

app.use(express.static(path.join(__dirname, 'public')));
// Starting
app.listen(app.get('port'), () => {
    console.log('Server is in port', app.get('port'));
  });