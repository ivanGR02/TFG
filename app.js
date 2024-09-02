var express = require('express');
var path = require('path');
const mysql = require('mysql');// usar sql
var app = express();



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const pools= mysql.createPool({
  host:"localhost",
  user:"root",
  password:"",
  database:"TFG",
  port: 3306
});// crear el pool de conexiones
const session = require("express-session");
const mysqlSession = require("express-mysql-session");
const MySQLStore = mysqlSession(session);
const sessionStore = new MySQLStore({
  host:"localhost",
  user:"root",
  password:"",
  database:"TFG",
  port: 3306
});// para guardar las 
app.use(session({// inicializar sesiones
  secret: 'TFG',
  resave: false,
  saveUninitialized: false,
  store: sessionStore
}));//Middleware para sesiones
const DAO =require('./DAO');
const dao = new DAO(pools);

app.use((request,response,next)=>{
  request.dao=dao;
  next();
})

app.use((request, response, next) => {
  response.locals.user = request.session.user || false;
  response.locals.session = {};
  if(request.session.correo){
    response.locals.session.id_user=request.session.id_user;
    response.locals.session.correo=request.session.correo;
    response.locals.session.nombre=request.session.nombre;
    response.locals.session.trabajador=request.session.trabajador;
    dao.getMensajesNoVistoyFoto(request.session.id_user,function(err,numMensajes){
      if(err){
        next();
      }else{
        response.locals.session.mensaje=numMensajes[0].mensaje_no_visto;
        request.session.mensaje=numMensajes[0].mensaje_no_visto;
        response.locals.session.foto=numMensajes[0].foto_perfil;
        request.session.foto=numMensajes[0].foto_perfil;;
        next();
      }  
    })
  }
  else{
    next();
  }
})


var inicio = require('./routes/index')
var usuario = require('./routes/users')
app.use('/', inicio);
app.use('/usuarios', usuario)


var server = require('http').Server(app);
const socketIO = require('socket.io');
const io = socketIO(server);


var usuariosConectados= {};

io.use((socket, next) => {
  if (socket.handshake.auth && socket.handshake.auth.id_user) {
      usuariosConectados[socket.handshake.auth.id_user]=socket;
      next();
  } else {
      // El usuario no está autenticado, desconectar el socket
      socket.disconnect(true);
  }
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    dao.addMensaje(msg.id_chat, msg.emisor, msg.message, function(err) {
      if (err) {
        socket.emit('mensajeError', { error: 'Error al enviar el mensaje. Inténtalo de nuevo más tarde.' });
      } else {
        dao.updateMensajePerfil(msg.receptor,1,function(err){
          if(err){
            socket.emit('mensajeError', { error:'Error al enviar el mensaje. Inténtalo de nuevo más tarde.'})
          }
          else{
            if (usuariosConectados[msg.receptor]) {
              usuariosConectados[msg.receptor].emit('chat message', msg);
            }
          }
        })
      }
    });
  });

  // Manejo de eventos de desconexión
  socket.on('disconnect', () => {
    console.log('Usuario desconectado');
  });
});

app.use(function(request,response,next){//es el middleware del 404 
  response.status(404);
  response.render("error",{codigo:"404",mensaje:"Página no encontrada"});
});

server.listen(3000,function(err){
  if(err){
      console.error("No se pudo inicializar el server");
  }else{
      console.log("Server escuchando");
  }
});

module.exports = app;


