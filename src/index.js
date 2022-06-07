const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const passport = require('passport');
const MySQLStore = require('express-mysql-session');
const session = require('express-session');
const { database } = require('./config');




//ENV



// Intializations
const app = express();
// const port = require('')
const http = require('http');
const res = require('express/lib/response');
const server = http.createServer(app)

//TODO:  socket
const {Server} = require('socket.io')
const io = new Server(server)

io.on('connection', socket => {
    console.log('Un usuario se ha conectado');
    //console.log("socket: ",socket.id);
    socket.on('votook', msg => {
         console.log(`Mensaje: ${msg}`);
         io.emit('votook',msg )

      })
  //  socket.on('votook', msg => {
  //       console.log('Mensaje: '+msg);
  //       io.emit('votook', msg)
  //   }) 
  })



require('./lib/passport');
// Settings
//app.set('port', process.env.PORT || 8081);
app.set('views', path.join(__dirname, 'views'));
//console.log(app.set('views', path.join(__dirname, 'views')));

console.log('__dirname',__dirname);
app.engine('.hbs', exphbs({
  defaultLayout: 'main',
  layoutsDir: path.join(app.get('views'), 'layouts'),
  partialsDir: path.join(app.get('views'), 'partials'),
  extname: '.hbs',
}));
// app.get('/', (req, res) => {
//   res.sendFile(`${__dirname}/main`)
// })
app.set('view engine', '.hbs');

// Middlewares
app.use(session({
  secret: 'miniencuestas',
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
const port = process.env.PORT ||8080
// const port = 8080
// app.listen(port, () => {
//     console.log('Server is in port', app.get('port'));

//     console.log(`http://localhost:${port}`);
//   });

server.listen(port, (req, res)=> {
  console.log('Servidor corriendo');
  console.log(`http://localhost:${port}`);

})
