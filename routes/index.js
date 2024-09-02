var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(request, response) {
  const DAO =request.dao;
  DAO.getInit(function(err,datos){
    if(err){
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    }else{
      response.render('paginaInicio',{trabajadores:datos});
    }
  }) 
});

router.get('/trabajador',function(request, response) {// RENDER PAGINA
   const DAO =request.dao;
   DAO.cogerDatosTrabajador(request.query.id,function(err,datos){
    if(err){
      response.status(500);
      response.render("error",{codigo:"500",mensaje:"Error del servidor"});
    }
    else{
      datos.nombre = request.query.nombre;
      datos.id= request.query.id;
      if(request.session.id_user){
        DAO.getPuntuacion(request.session.id_user,request.query.id,function(err,punt){
          if(err){
            response.status(500);
            response.render("error",{codigo:"500",mensaje:"Error del servidor"});
          }else{
            if(punt.length=== 0){ datos.puntuacion=-1}
            else{datos.puntuacion=punt[0].puntuacion}
            response.render('perfilTrabajador',{trabajador:datos});
          }
        })
      }else{
        datos.puntuacion=-1;
        response.render('perfilTrabajador',{trabajador:datos});
      }
    }
   });
});

router.get('/busqueda',function(request,response){// PETICION AJAX 
    const DAO = request.dao;
    if(request.query.ubicacion){
      DAO.todoslosPerfilesUbi(request.query.profesion,request.query.ubicacion, function(err,datos){
        if(err){
          response.status(500);
          response.render("error",{codigo:"500",mensaje:"Error del servidor"});
        }
        else{
          response.json(datos);
        }
    });
    }else{
      DAO.todoslosPerfiles(request.query.profesion,function(err,datos){
        if(err){
          response.status(500);
          response.render("error",{codigo:"500",mensaje:"Error del servidor"});
        }
        else{
          response.json(datos);
        }
    });
    }
  
});

router.get('/comentarios',function(request,response){// PETICION AJAX 
  const DAO = request.dao;
  DAO.comentariosTrabajador(request.query.id_trabajador,function(err,datos){
      if(err){
        response.status(500);
      }
      else{
        response.json(datos);
      }
  });
});




module.exports = router;
