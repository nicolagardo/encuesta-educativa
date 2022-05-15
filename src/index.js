/*const express = require('express');

const exphbs = require('express-handlebars');
const path = require('path');
// Intializations
const app = express();

// Settings

app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
}));
app.set('view engine', '.hbs');
app.use(require('./routes/indexController'));



// Starting
app.listen(app.get('port'), () => {
    console.log('Server is in port', app.get('port'));
  });*/
const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const passport = require('passport');
// Intializations
const app = express();
require('./lib/passport');

// Settings
app.set('port', process.env.PORT || 80);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
}));
app.set('view engine', '.hbs');
// Middlewares
app.use(express.urlencoded({extended: false}));
app.use(passport.initialize());
app.use(passport.session());

app.use(require('./routes/indexController'));
app.use(require('./routes/authController'));
app.use(express.static(path.join(__dirname, 'public')));

// Starting
app.listen(app.get('port'), () => {
    console.log('Server is in port', app.get('port'));
  });
