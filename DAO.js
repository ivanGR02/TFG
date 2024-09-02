"use strict";
const mysql = require('mysql');
class DAO {
    constructor(pools) {
        this.pool = pools;
    }
    getInit(callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err,null);
            }
            else{
                const sqlPerfiles = `SELECT trabajadores.*, usuarios.nombre, usuarios.foto_perfil
                FROM trabajadores INNER JOIN usuarios ON usuarios.id = trabajadores.id_usuario
                ORDER BY trabajadores.puntuacion DESC`;
                connection.query(sqlPerfiles, [], function (err, perfiles) {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    }else{
                        callback(null, perfiles);
                    }
                });
            }
        });
    }
    cogerDatosTrabajador(id_usuario, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err, null);
            } else {
                var datos={};
                const sqlFotos = `SELECT foto FROM fotos
                WHERE fotos.id_trabajador=?`;
                connection.query(sqlFotos, [id_usuario], function (err, fotos) {
                    if (err) {
                        connection.release();
                        callback(err, null);
                        return;
                    }
                    else{
                        const sqlDatos=`SELECT * FROM trabajadores
                        WHERE id_usuario=?`
                        connection.query(sqlDatos, [id_usuario], function (err, info) {
                            connection.release();
                            if (err) {
                                callback(err, null);
                                return;
                            }
                            else{
                                datos = info[0];
                                datos.fotos = fotos;
                                callback(null, datos);
                            }
                        });
                    }
                });
            }
        });
    }
    todoslosPerfiles(profesion,callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err,null);
            }
            else{
                const sqlPerfiles = `SELECT trabajadores.*, usuarios.nombre, usuarios.foto_perfil
                FROM trabajadores INNER JOIN usuarios ON usuarios.id = trabajadores.id_usuario WHERE trabajadores.profesion=?`;
                connection.query(sqlPerfiles, [profesion], function (err, perfiles) {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    }else{
                        callback(null, perfiles);
                    }
                });
            }
        });
    }
    todoslosPerfilesUbi(profesion,ubicacion,callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err,null);
            }
            else{
                const sqlPerfiles = `SELECT trabajadores.*, usuarios.nombre, usuarios.foto_perfil
                FROM trabajadores INNER JOIN usuarios ON usuarios.id = trabajadores.id_usuario WHERE trabajadores.profesion=? AND trabajadores.ubicacion=?`;
                connection.query(sqlPerfiles, [profesion,ubicacion], function (err, perfiles) {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    }else{
                        callback(null, perfiles);
                    }
                });
            }
        });
    }
    comentariosTrabajador(id_trabajador,callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err,null);
            }
            else{
                const sqlComentarios = `SELECT comentarios.id_comentarios, usuarios.nombre, comentarios.texto,usuarios.foto_perfil
                FROM comentarios
                INNER JOIN usuarios ON comentarios.id_usuario = usuarios.id
                WHERE comentarios.id_trabajador = ? 
                ORDER BY comentarios.id_comentarios DESC`;
                connection.query(sqlComentarios, [id_trabajador], function (err, comentarios) {
                    connection.release();
                    if (err) {
                        callback(err, null);
                    }else{
                        callback(null, comentarios);
                    }
                });
            }
        });
    }
    borrarFoto(id_foto,callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err);
            }
            else{
                const sqlPerfil = `DELETE 
                FROM fotos 
                WHERE id_foto = ? `;
                connection.query(sqlPerfil, [id_foto], function (err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    }else{
                        callback(null);
                    }
                });
            }
        });
    }

    getMiPerfilTrabajador(id_trabajador,callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err,null);
            }
            else{
                let datos = {};
                const sqlPerfil = `SELECT u.*, t.*
                FROM usuarios u
                LEFT JOIN trabajadores t ON u.id = t.id_usuario
                WHERE u.id = ?;
                `;
                connection.query(sqlPerfil, [id_trabajador], function (err, perfil) {
                    if (err) {
                        connection.release();
                        callback(err, null);
                    }else{
                        datos.perfil=perfil;
                        const sqlFotos =`SELECT foto, id_foto FROM fotos WHERE id_trabajador=?`;
                        connection.query(sqlFotos, [id_trabajador], function (err,fotos){
                            connection.release();
                            if(err){
                                callback(err,null);
                            }
                            else{
                                datos.fotos=fotos;
                                callback(null,datos);
                            }
                       })
                    }
                });
            }
        });
    }
    cambiarFoto(usuario, foto, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `
                    UPDATE usuarios
                    SET foto_perfil = ?
                    WHERE id = ?`;
                    
                connection.query(sql, [foto, usuario], function (err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    addFoto(usuario, foto, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `INSERT INTO fotos (id_trabajador, foto) VALUES (?, ?);`; 
                connection.query(sql, [usuario, foto], function (err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    inicioSesion(correo, password,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                let datos={};
                const sql = `SELECT * FROM usuarios WHERE correo=? AND contrasena=?;`; 
                connection.query(sql, [correo,password], function (err,user) {
                    if (err) {
                        connection.release();
                        callback(err,null);
                    } 
                    else if(user[0]!==undefined){
                        datos=user[0];
                        const sql2 = `SELECT * FROM trabajadores WHERE id_usuario=? ;`;
                        connection.query(sql2, [datos.id], function (err,trabajador) {
                            connection.release();
                            if(err){
                                callback(err,null);
                            }else{
                                datos.trabajador = trabajador[0] === undefined ? false : true;
                                callback(null,datos);
                            }
                        })
                    }else{
                        connection.release();
                        callback(null,null);
                    }
                });
            }
        });
    }
    getUsuario(correo,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `SELECT * FROM usuarios WHERE correo=?`; 
                connection.query(sql, [correo], function (err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        });
    }
    getUsuarioId(id,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `SELECT * FROM usuarios WHERE id=?`; 
                connection.query(sql, [id], function (err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        });
    }
    addUsuario(correo, nombre, contrasena, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `INSERT INTO usuarios(correo, nombre, contrasena) VALUES (?,?,?)`;
                connection.query(sql, [correo, nombre, contrasena], function (err, result) {
                    if (err) {
                        connection.release();
                        callback(err,null);
                    } else {
                        const nuevoId = result.insertId;
                        connection.release();
                        callback(null, nuevoId);
                    }
                });
            }
        });
    }
    
    addTrabajador(id_usuario,profesion,ubicacion,telefono,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `INSERT INTO trabajadores(id_usuario,profesion, ubicacion,telefono,puntuacion) VALUES (?,?,?,?,0)`; 
                connection.query(sql, [id_usuario,profesion,ubicacion,telefono], function (err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    getMensajes(id_chat,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `SELECT mensajes.*
                FROM mensajes
                INNER JOIN chats ON mensajes.chat_id = chats.id
                 WHERE chats.id = ?
                ORDER BY mensajes.fecha ASC;`; 
                connection.query(sql, [id_chat], function (err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        });
    }
    crearChat(id_usuario,id_trabajador,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `INSERT INTO chats(id_usuario,id_trabajador) VALUES(?,?)`; 
                connection.query(sql, [id_usuario,id_trabajador], function (err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        const nuevoId = datos.insertId;
                        callback(null,nuevoId);
                    }
                });
            }
        });
    }
    addMensaje(id_chat,id_usuario,texto,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `INSERT INTO mensajes(chat_id,usuario_id,texto) VALUES(?,?,?)`; 
                connection.query(sql, [id_chat,id_usuario,texto], function (err) {
                    if (err) {
                        connection.release();
                        callback(err);
                    } else {
                        const sql2 =`UPDATE chats
                        SET ultimo_mensaje=?, id_usuario_ultimo_mensaje=?, mensajes_no_vistos= mensajes_no_vistos+1, fecha_ultimo_mensaje= NOW()
                         WHERE id = ?`;
                         connection.query(sql2,[texto,id_usuario,id_chat],function(err){
                            connection.release();
                            if(err) {
                                callback(err);
                            }else{
                                callback(null);
                            }
                         })  
                    }
                });
            }
        });
    }

    misChats(id_usuario,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `SELECT c.*, 
                u_usuario.nombre AS nombre_usuario, 
                u_trabajador.nombre AS nombre_trabajador, 
                u_usuario.foto_perfil AS foto_perfil_usuario, 
                u_trabajador.foto_perfil AS foto_perfil_trabajador,
                u_usuario.id AS id_usuario, 
                u_trabajador.id AS id_trabajador
                FROM chats c 
                JOIN usuarios u_usuario ON c.id_usuario = u_usuario.id 
                LEFT JOIN usuarios u_trabajador ON c.id_trabajador = u_trabajador.id 
                WHERE c.id_usuario = ? OR c.id_trabajador = ?
                ORDER BY c.fecha_ultimo_mensaje DESC;` 
                connection.query(sql, [id_usuario,id_usuario], function (err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        });
    }
    getReservasMes(id_usuario,dia_ini,dia_fin,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `SELECT * FROM reservas WHERE id_trabajador=? AND (fecha_reserva_ini >= ? AND fecha_reserva_fin <= ? ) ORDER BY fecha_reserva_ini;` 
                connection.query(sql, [id_usuario,dia_ini,dia_fin], function (err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                       callback(null,datos);
                    }
                });
            }
        });
    }
    getReservasid(idReserva,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `SELECT * FROM reservas WHERE id_reserva=?;` 
                connection.query(sql, [idReserva], function (err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                       callback(null,datos);
                    }
                });
            }
        });
    }
    deleteReservasid(idReserva,callback){
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `DELETE FROM reservas WHERE id_reserva=?;` 
                connection.query(sql, [idReserva], function (err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                       callback(null);
                    }
                });
            }
        });
    }
    updateReservasLargasid(idReserva, nombre, ubicacion, fecha_reserva_ini, fecha_reserva_fin, color, descripcion, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `UPDATE reservas SET 
                                nombre = ?, 
                                ubicacion = ?, 
                                fecha_reserva_ini = ?, 
                                fecha_reserva_fin = ?, 
                                color = ?, 
                                descripcion = ? 
                             WHERE id_reserva = ?`;
    
                connection.query(sql, [nombre, ubicacion, fecha_reserva_ini, fecha_reserva_fin, color, descripcion, idReserva], function (err) {
                    connection.release();
    
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    UpdateReservaCortaid(idReserva,dia, hora_ini,hora_fin,color,nombre,descripcion, ubicacion, callback) {
        this.pool.getConnection(function (err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `UPDATE reservas 
                SET 
                    fecha_reserva_ini = ?,
                    fecha_reserva_fin = ?,
                    hora_inicio = ?,
                    hora_fin = ?,
                    color = ?,
                    nombre = ?,
                    descripcion = ?,
                    ubicacion = ?
                WHERE id_reserva = ?`;
    
                connection.query(sql, [dia, dia,hora_ini,hora_fin, color, nombre, descripcion,ubicacion, idReserva], function (err) {
                    connection.release();
    
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    

    getReservasLargas(id_usuario,dia_ini,dia_fin,callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err,null);
            }else{
                const sql = `SELECT * FROM reservas WHERE id_trabajador=? AND (
                    (fecha_reserva_ini<=? AND fecha_reserva_ini>=?) OR
                    (fecha_reserva_fin>=? AND fecha_reserva_ini<=?) OR
                    (fecha_reserva_fin<=? AND fecha_reserva_fin>=?)
                );` 
                connection.query(sql, [id_usuario,dia_fin,dia_ini,dia_ini,dia_fin,dia_ini,dia_fin], function (err,datos) {
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        })
    }

    addReservaLarga(id_user, dia_ini, dia_fin, color, nombre, descripcion, ubicacion, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `
                    INSERT INTO reservas (id_trabajador, fecha_reserva_ini, fecha_reserva_fin, nombre, descripcion, color, ubicacion, tipo)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?);
                   `;
                connection.query(sql, [id_user, dia_ini, dia_fin, nombre, descripcion, color, ubicacion, 1], function(err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    getReservasCortas(id_usuario,dia,hora_ini,hora_fin,callback){
        this.pool.getConnection(function(err,connection){
            if(err){
                callback(err,null);
            }else{
                const sql = `SELECT * FROM reservas WHERE id_trabajador=? AND (
                    (fecha_reserva_ini<=? AND fecha_reserva_fin>=? AND tipo=1) OR
                    (hora_inicio<=? AND hora_inicio>=? AND tipo=0 AND fecha_reserva_ini=?) OR
                    (hora_fin>=? AND hora_inicio<=? AND tipo=0 AND fecha_reserva_ini=?) OR
                    (hora_fin<=? AND hora_fin>=? AND tipo=0 AND fecha_reserva_ini=?) 
                );` 
                connection.query(sql, [id_usuario,dia,dia,
                    hora_fin,hora_ini,dia,
                    hora_ini,hora_fin,dia,
                    hora_ini,hora_fin,dia], function (err,datos) {
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        })
    }
    addReservaCorta(id_user, dia, hora_ini,hora_fin, color, nombre, descripcion, ubicacion, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `
                    INSERT INTO reservas (id_trabajador, fecha_reserva_ini,fecha_reserva_fin, hora_inicio,hora_fin, nombre, descripcion, color, ubicacion, tipo)
                    VALUES (?, ?, ?, ?,?,?, ?, ?, ?, ?);
                   `;
                connection.query(sql, [id_user, dia, dia, hora_ini,hora_fin,nombre, descripcion, color, ubicacion, 0], function(err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    addComentario(id_user, id_trabajador, comentario, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `
                    INSERT INTO comentarios (id_usuario, id_trabajador,texto)
                    VALUES (?, ?, ?);
                   `;
                connection.query(sql, [id_user, id_trabajador, comentario], function(err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    addPuntuacion(id_user, id_trabajador, puntuacion, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `
                INSERT INTO puntuaciones (id_usuario, id_trabajador, puntuacion)
                VALUES (?, ?, ?)
                ON DUPLICATE KEY UPDATE puntuacion = VALUES(puntuacion);
                `;
                connection.query(sql, [id_user, id_trabajador, puntuacion], function(err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    getPuntuacion(id_user, id_trabajador,callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `
                SELECT puntuacion FROM puntuaciones
                WHERE id_usuario= ? AND id_trabajador= ?
                `;
                connection.query(sql, [id_user, id_trabajador], function(err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        });
    }
    updatePerfil(id_trabajador,descripcion,telefono,ubicacion, callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `
                UPDATE trabajadores 
                SET telefono = ?, descripcion = ?, ubicacion = ?
                WHERE id_usuario = ?;
                `;
                connection.query(sql, [telefono, descripcion,ubicacion,id_trabajador], function(err,datos) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    mensajeVisto(id_chat, callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const selectSql = `
                SELECT mensajes_no_vistos
                FROM chats
                WHERE id = ?;
                `;
                connection.query(selectSql, [id_chat], function(err, results) {
                    if (err) {
                        connection.release();
                        callback(err,null);
                    } else {
                        const previousValue = results[0].mensajes_no_vistos;
    
                        const updateSql = `
                        UPDATE chats
                        SET mensajes_no_vistos = 0
                        WHERE id = ?;
                        `;
                        connection.query(updateSql, [id_chat], function(err) {
                            connection.release();
                            if (err) {
                                callback(err,null);
                            } else {
                                callback(null, previousValue);
                            }
                        });
                    }
                });
            }
        });
    }
    
    updateMensajePerfil(id_receptor,mensajes,callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err);
            } else {
                const sql = `
                UPDATE usuarios
                SET mensaje_no_visto = mensaje_no_visto+?
                WHERE id = ?;
                `;
                connection.query(sql, [mensajes,id_receptor], function(err) {
                    connection.release();
                    if (err) {
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            }
        });
    }
    getMensajesNoVistoyFoto(id_user,callback){
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `
                SELECT mensaje_no_visto, foto_perfil
                FROM usuarios
                WHERE id = ?;
                `;
                connection.query(sql, [id_user], function(err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        });  
    }
    getCitasDia(id_trabajador,dia,callback) {
        this.pool.getConnection(function(err, connection) {
            if (err) {
                callback(err,null);
            } else {
                const sql = `
                SELECT * FROM reservas 
                WHERE id_trabajador=? AND fecha_reserva_ini=? AND tipo=0 
                ORDER BY fecha_reserva_ini ASC;
                `;// tipo 0 es que la reserva es de un solo dia
                connection.query(sql, [id_trabajador,dia], function(err,datos) {
                    connection.release();
                    if (err) {
                        callback(err,null);
                    } else {
                        callback(null,datos);
                    }
                });
            }
        });
    }
}
module.exports = DAO;