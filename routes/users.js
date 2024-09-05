var express = require('express');
var router = express.Router();
const multer = require("multer");
const multerFactory = multer({storage: multer.memoryStorage()});
const moment =require("moment");


router.get('/miPerfil',function(request,response){
  const DAO =request.dao;
  DAO.getMiPerfilTrabajador(request.session.id_user,function(err,datos){
    if(err){
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    }
    else{
      response.render('miPerfil',{miPerfil:datos});
    }
  })
});

router.post('/cambiarFoto',multerFactory.single('cambioFotoPerfil'), function(request, response) {//cambiar multer
  const dao= request.dao;
  const file =request.file;
  dao.cambiarFoto(request.session.id_user,file.buffer, function(err){
    if(err){
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    }else{
      const base64Image = Buffer.from(file.buffer).toString('base64');
      request.session.foto = {
        type: 'Buffer',
        data: Array.from(file.buffer)
      };
      response.status(200);
      response.json({ newImage: base64Image });
    }
  });
});
router.get('/logout', function(request, response) {
  request.session.destroy(function(err) {
      if (err) {
        response.render("error",{codigo:"500",mensaje:"Error del servidor"});
      } else {
        response.redirect('/');
      }
  });
});

router.delete('/borrarFoto',function(request,response){//PETICION AJAX
  const DAO =request.dao;
  DAO.borrarFoto(request.body.id_foto,function(err){
    if(err){
      response.status(500);
    }
    else{
      response.status(200);
      response.json(true);
    }
  })
});
router.post('/addFoto',multerFactory.single('fotoTrabajo'),function(request,response){
  const dao= request.dao;
  const file =request.file;
  dao.addFoto(request.session.id_user,file.buffer, function(err){
    if(err){
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    }else{
      response.redirect("/usuarios/miPerfil");
    }
  });
})
router.post('/inicioSesion',function(request,response){//AJAX
  const dao =request.dao;
  dao.inicioSesion(request.body.correo,request.body.password, function(err,datos){
    if(err){
      response.status(500);
    }
    else{
      if(datos!==null){
        request.session.user=true;
        request.session.id_user=datos.id;
        request.session.correo=datos.correo;
        request.session.nombre=datos.nombre;
        request.session.foto=datos.foto_perfil;
        request.session.trabajador=datos.trabajador;
        request.session.mensaje=datos.mensaje_no_visto;
        response.status(200);
        response.json(datos);
      }else{
        response.status(200);
        response.json(null);
      }
    }
  })
})
router.post('/registroUsuario',function(request,response){//AJAX
  const dao =request.dao;
  dao.getUsuario(request.body.correo, function(err,datos){
    if(err){
      response.status(500);
    }else{
      if(datos.length !== 0){
        response.status(200);
        response.json({add:false});// ya se usa ese correo
      }
      else{
        dao.addUsuario(request.body.correo,request.body.nombre,request.body.password, function(err,datos){
          if(err){
            response.status(500);
          }
          else{
            request.session.user=true;
            request.session.id_user=datos;
            request.session.correo=request.body.correo;
            request.session.nombre=request.body.nombre;
            request.session.trabajador=false;
            request.session.foto=null;
            request.session.mensaje=false;
            response.status(200);
            response.json({add:true,nombre:request.body.nombre, id:request.session.id_user});
          }
        })
      }
    }
  })
})
router.post('/registroTrabajador',function(request,response){//AJAX
  const dao =request.dao;
  dao.getUsuario(request.body.correo,function(err,datos){
    if(err){
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    }else{
      if(datos.length !== 0){
        response.status(200);
        response.json({add:false});// ya se usa ese correo
      }
      else{
        dao.addUsuario(request.body.correo,request.body.nombre,request.body.password, function(err,datos){
          if(err){
            response.status(500);
          }
          else{
            request.session.id_user=datos;
            dao.addTrabajador(datos,request.body.profesion,request.body.ubicacion,request.body.telefono, function(err){
              if(err){
                response.status(500);
              }
              else{
                request.session.user=true;
                request.session.correo=request.body.correo;
                request.session.nombre=datos.nombre;
                request.session.trabajador=true;
                request.session.foto=null;
                request.session.mensaje=false;
                response.status(200);
                response.json({add:true,nombre:request.body.nombre,id:request.session.id_user});
              }
            })
          }
        })
      }
    }
  })
})
router.get('/misMensajes',function(request,response){
  const dao=request.dao;
  dao.misChats(request.session.id_user,function(err,datos){
    if(err){
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    }else{
      var chats=[]
      datos.forEach(function(row) {
        var chat={}
        chat.id= row.id
        chat.id_usuario_ultimo_mensaje=row.id_usuario_ultimo_mensaje
        chat.ultimo_mensaje=row.ultimo_mensaje;
        chat.mensajes_no_vistos=row.mensajes_no_vistos;
        let horaMensaje = moment(row.fecha_ultimo_mensaje);
        if (moment().isSame(horaMensaje, 'day')) {
          chat.fecha_ultimo_mensaje = horaMensaje.format('HH:mm'); // formato: hora:minuto (ejemplo: 17:37)
        } else {
            chat.fecha_ultimo_mensaje = horaMensaje.format('D/M'); // formato: día/mes (ejemplo: 8/5)
        }

        if (request.session.id_user === row.id_usuario) {
          chat.id_receptor=row.id_trabajador
          chat.nombre=row.nombre_trabajador
          chat.foto=row.foto_perfil_trabajador
          
        } else {
          chat.id_receptor=row.id_usuario
          chat.nombre=row.nombre_usuario
          chat.foto=row.foto_perfil_usuario
        }
        chats.push(chat);
    });
      response.render('misChats',{datos:chats});
    }
  })
})
router.post('/crearChat',function(request,response){
  const dao = request.dao;
  dao.crearChat(request.session.id_user,request.body.id, function(err, data) {
    if (err) {
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    } else {
      var chat={};
      chat.id_chat=data.idChat;
      chat.nombre=data.nombre;
      chat.id_user=request.session.id_user;
      chat.id_receptor=request.body.id;
      response.render('chat', { data: chat });
    }
  });
})

router.get('/chat', function(request, response) {
  const dao = request.dao;
  const idusu_ultimoMensaje = parseInt(request.query.id_usuario_ultimo_mensaje)
  if(idusu_ultimoMensaje!==request.session.id_user
    && request.query.mensajes_no_vistos!==0){
      dao.mensajeVisto(request.query.id_chat, function(err,data){
        if(err){
          response.status(500);
          response.render("error",{codigo:"500",mensaje:"Error del servidor"});
        }else{
          dao.updateMensajePerfil(request.session.id_user,-data,function(err){
              if(err){
                response.status(500);
                response.render("error",{codigo:"500",mensaje:"Error del servidor"});
              }
              else{
                request.session.mensaje= request.session.mensaje-data;
                response.locals.session.mensaje=request.session.mensaje;
                dao.getMensajes(request.query.id_chat, function(err, data) {
                  if (err) {
                    response.status(500);
                    response.render("error",{codigo:"500",mensaje:"Error del servidor"});
                  } else {
                    data.id_chat=request.query.id_chat;
                    data.id_receptor=request.query.id_receptor;
                    data.nombre=request.query.nombre_receptor;
                    response.render('chat', { data: data });
                  }
                });
              }
            })
          } 
      }
  )}
  else{
    dao.getMensajes(request.query.id_chat, function(err, data) {
      if (err) {
        response.status(500);
        response.render("error",{codigo:"500",mensaje:"Error del servidor"});
      } else {
        data.id_chat=request.query.id_chat;
        data.id_receptor=request.query.id_receptor;
        data.nombre=request.query.nombre_receptor;
        response.render('chat', { data: data });
      }
    });
  }
});
router.post('/subirTrabajador', function(request, response) {
  const dao =request.dao;
  dao.addTrabajador(request.session.id_user,request.body.profesion,request.body.ubicacion,request.body.telefono, function(err){
    if(err){
      response.status(500);
    }
    else{
      request.session.trabajador=true;
      response.status(200);
      response.json({add:true,nombre:request.session.nombre,id:request.session.id_user,mensajes:request.session.mensaje});
    }
  })
});
router.get('/getReservas',function(request,response){
  const dao =request.dao;

  const firstDayOfMonth = new Date(request.query.year, request.query.mes-1, 1);
  const startDayOfWeek = firstDayOfMonth.getDay();
  const lastDayOfMonth = new Date(request.query.year, request.query.mes, 0);
  const endDayOfWeek = lastDayOfMonth.getDay();
  var inicioCalendario = new Date(request.query.year, request.query.mes-1, 3-startDayOfWeek);
  var finCalendario = new Date(request.query.year, request.query.mes, 8-endDayOfWeek);
  //es para coger todos los dias que se muestra en el calendario en vez de solo los del mes
  dao.getReservasMes(request.session.id_user,inicioCalendario,finCalendario, function(err,datos){
    if(err){
      response.status(500);
    }
    else{
      for (let i = 0; i < datos.length; i++) {//poner las fechas en el mismo formato que el js del cliente
        datos[i].fecha_reserva_ini = moment(datos[i].fecha_reserva_ini).format('YYYY-MM-DD');
        datos[i].fecha_reserva_fin = moment(datos[i].fecha_reserva_fin).format('YYYY-MM-DD');
    }
      response.status(200);
      response.json(datos)
    }
  })
})
router.get('/getReservaId',function(request,response){
  const dao= request.dao;
  dao.getReservasid(request.query.id_reserva, function(err,datos){
    if(err){
      response.status(500);
    }else{
      const Ini = new Date(datos[0].fecha_reserva_ini);
      var correcionFechaIni = new Date(Ini);
      correcionFechaIni.setDate(Ini.getDate() + 1);
      datos[0].fecha_reserva_ini=correcionFechaIni;

      const Fin = new Date(datos[0].fecha_reserva_fin);
      var correcionFechaFin = new Date(Fin);
      correcionFechaFin.setDate(Fin.getDate() + 1);
      datos[0].fecha_reserva_fin=correcionFechaFin;

      response.status(200);
      response.json(datos)
    }
  });
})
router.post('/deleteReservaId',function(request,response){
  const dao= request.dao;
  dao.deleteReservasid(request.body.id_reserva, function(err){
    if(err){
      response.status(500);
    }else{
      response.status(200);
      response.json(true);
    }
  });
})
router.post('/UpdatereservaLarga',function(request,response){
  const dao =request.dao;
  dao.getReservasLargas(request.session.id_user,request.body.dia_inicio,request.body.dia_final, function(err,datos){
    if(err){
      response.status(500);
    }else{
      const idReservaDatos = String(datos[0]?.id_reserva);
      const idReservaRequest = String(request.body.id_reserva);
      if((datos.length===1 && idReservaDatos === idReservaRequest)|| datos.length===0){
        dao.updateReservasLargasid(request.body.id_reserva,request.body.nombre,request.body.ubicacion,
          request.body.dia_inicio,request.body.dia_final,
          request.body.color,request.body.descripcion,function(err){
            if(err){
              response.status(500);
            }else{
              response.status(200);
              response.json(true);
            }
          })
      }
      else{
        response.status(200);
        response.json(false);
      }
    }
  })
})
router.post('/UpdatereservaCorta',function(request,response){
  const dao =request.dao;
  dao.getReservasCortas(request.session.id_user,request.body.dia,
    request.body.horaInicio,request.body.horaFin, function(err,datos){
    if(err){
      response.status(500);
    }
    else{
      const idReservaDatos = String(datos[0]?.id_reserva);
      const idReservaRequest = String(request.body.id_reserva);
      if((datos.length===1 && idReservaDatos === idReservaRequest)|| datos.length===0){
        dao.UpdateReservaCortaid(request.body.id_reserva,request.body.dia,request.body.horaInicio,request.body.horaFin,
          request.body.color,request.body.nombre,request.body.descripcion,request.body.ubicacion,function(err){
            if(err){
              response.status(500);
            }else{
              response.status(200);
              response.json(true);
            }
          })
      }
      else{
        response.status(200);
        response.json(false);
      }
    }
  })
})
router.get('/calendario', function(request, response) {
  response.render('calendario');
});

router.post('/reservaCorta',function(request,response){
  const dao =request.dao;
  dao.getReservasCortas(request.session.id_user,request.body.dia,
    request.body.horaInicio,request.body.horaFin, function(err,datos){
    if(err){
      response.status(500);
    }
    else{
      if(datos.length===0){
        dao.addReservaCorta(request.session.id_user,request.body.dia,request.body.horaInicio,request.body.horaFin,
          request.body.color,request.body.nombre,request.body.descripcion,request.body.ubicacion,function(err){
            if(err){
              response.status(500);
            }else{
              response.status(200);
              response.json(true);
            }
          })
      }
      else{
        response.status(200);
        response.json(false);
      }
    }
  })
})
router.post('/reservaLarga',function(request,response){
  const dao =request.dao;
  dao.getReservasLargas(request.session.id_user,request.body.dia_inicio,request.body.dia_final, function(err,datos){
    if(err){
      response.status(500);
    }else{
      if(datos.length===0){
        dao.addReservaLarga(request.session.id_user,request.body.dia_inicio,request.body.dia_final,
          request.body.color,request.body.nombre,request.body.descripcion,request.body.ubicacion,function(err){
            if(err){
              response.status(500);
            }else{
              response.status(200);
              response.json(true);
            }
          })
      }
      else{
        response.status(200);
        response.json(false);
      }
    }
  })
})
router.post('/nuevoComentario',function(request,response){
  const dao =request.dao;
  dao.addComentario(request.session.id_user,request.body.id_trabajador,request.body.comentario, function(err){
    if(err){
      response.status(500);
    }else{
      response.status(200);
      response.json(request.session.nombre);
    }
  })
})
router.post('/puntuar',function(request,response){
  const dao =request.dao;
  dao.addPuntuacion(request.session.id_user,request.body.id_trabajador,request.body.puntuacion, function(err){
    if(err){
      response.status(500);
    }else{
      response.status(200);
      response.json(request.session.nombre);
    }
  })
})
router.post('/cambiarPerfil',function(request,response){
  const dao =request.dao;
  dao.updatePerfil(request.session.id_user,request.body.descripcion,request.body.telefono,request.body.ubicacion, function(err){
    if(err){
      response.status(500);
    }else{
      response.status(200);
      response.json(true);
    }
  })
})
router.post('/mensajeVisto',function(request,response){
  const dao=request.dao;
  dao.mensajeVisto(request.body.id_chat, function(err,datos){
    if(err){
      response.status(500);
    }else{
        dao.updateMensajePerfil(request.session.id_user,-datos,function(err){
        if(err){
          response.status(500);
        }else{
          response.status(200);
          response.json(true);
        }
      })
    }
  })
})
router.get('/datosChat',function(request,response){
  const dao=request.dao;
  dao.getUsuarioId(request.query.id_emisor, function(err,datos){
    if(err){
      response.status(500);
    }else{
      response.status(200);
      response.json(datos[0]);
    }
  })
})
router.get('/getCitasDia',function(request,response){
  const dao=request.dao;
  dao.getCitasDia(request.session.id_user,request.query.dia,function(err,datos){
    if(err){
      response.status(500);
    }else{
      response.status(200);
      if(datos.length>0){
        response.json(datos);
      }
      else{
        response.json(false);
      }
    }
  })
})
module.exports = router;
