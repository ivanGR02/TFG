
$(function(){
    $("#inicioSesion").on('click', function () {
        $("#login").modal('show');
    });
    $("#registroUsuario").on('click', function () {
        $("#registrarseUsu").modal('show');
    });
    $("#registroTrabajador").on('click', function () { 
        $("#registrarseTra").modal('show');
    });
    $(document).on('click', '#PasarTrabajador', function() {
        $("#subirTrabajador").modal('show');
    });
    $("#visibilidadlog").on('click',function(){
        var mostrar = $("#visibilidadlog").data("mostrar");
        mostrar = !mostrar; 
        $(this).text(mostrar ? "Ocultar" : "Mostrar");
        $(this).data("mostrar", mostrar);
        var passwordField = $("#passwordlog");
        passwordField.attr("type", passwordField.attr("type") === "password" ? "text" : "password");
    })
    $("#visibilidadReUsu").on('click',function(){
        var mostrar = $("#visibilidadReUsu").data("mostrar");
        mostrar = !mostrar;
        $(this).text(mostrar ? "Ocultar" : "Mostrar");
        $(this).data("mostrar", mostrar);
        var passwordField = $("#passwordReUsu");
        passwordField.attr("type", passwordField.attr("type") === "password" ? "text" : "password");
    })
    $("#visibilidadReTra").on('click',function(){
        var mostrar = $("#visibilidadReTra").data("mostrar");
        mostrar = !mostrar;
        $(this).text(mostrar ? "Ocultar" : "Mostrar");
        $(this).data("mostrar", mostrar);

        var passwordField = $("#passwordReTra");
        passwordField.attr("type", passwordField.attr("type") === "password" ? "text" : "password");
    })
    $("#Iniciar").on('click',function(){
        var correos = $("#correolog").val();
        var passwords = $("#passwordlog").val();
        const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
        $("#ErrorCorreoLog").text("");
        if(!expresionCorreo.test(correos)){
            $("#ErrorCorreoLog").text("El texto intoducido no corresponde a una dirección de correo");
        }else{
            $.ajax({
                url: "/usuarios/inicioSesion",
                method: "POST",
                data:{correo:correos,password:passwords},
                success:function(data){
                    if(data === null ){
                        $("#ErrorCorreoLog").text("Correo o contraseña equivocados");
                    } else{
                        $("#login").modal('hide');
                        nuevoNavBar(data.trabajador,data.mensaje_no_visto,data.id);
                        fotoUsuario(data.foto_perfil);
                        $("#session").attr('data-session', true);
                        mostrarAlertaCheck("Bienvenido "+data.nombre);
                    }
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo comprobar si el correo ya esta en uso");
                }
            })
        }
    })
    $(document).on('click',"#RegistrarUsu", function(){
        var correos = $("#correoReUsu").val();
        var passwords = $("#passwordReUsu").val();
        var nombres = $("#nombreUsu").val();
        const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ 
        const expresionNombre = /^[a-zA-Z]+$/;
        var check=true;
        $("#ErrorCorreoReUsu").text(""); 
        $("#ErrorNombreReUsu").text("");
        if(!expresionCorreo.test(correos)){
            check=false;
            $("#ErrorCorreoReUsu").text("El texto intoducido no corresponde a una dirección de correo");
        }
        if(!expresionNombre.test(nombres)){
            check= false;
            $("#ErrorNombreReUsu").text("El nombre solo puede contener letras");
        }
        if(check){
            $.ajax({
                url: "/usuarios/registroUsuario",
                method: "POST",
                data:{correo:correos,password:passwords,nombre:nombres},
                success:function(data){
                    if(data.add !== true ){
                        $("#ErrorCorreoReUsu").text("Correo en uso");
                    } else{
                        $("#registrarseUsu").modal('hide');
                        nuevoNavBar(false,0,data.id);
                        fotoUsuario(null);
                        $("#session").attr('data-session', true);
                        mostrarAlertaCheck("Bienvenido "+data.nombre);
                
                    }
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo añadir tu usuario al sistema");
                }
            })
        }
    })
    $(document).on('click',"#RegistrarTra", function(){
        var correos = $("#correoReTra").val();
        var passwords = $("#passwordReTra").val();
        var nombres = $("#NombreTra").val();
        var profesiones= $("#profesion").val();
        var ubicaciones =$("#UbicacionTra").val();
        var telefonos =$("#TelefonoTra").val();
        const expresionCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // solo sea el correo sin espacios en blanco
        const expresionNombre = /^[a-zA-Z]+$/;// Solo letras
        const expresiontelefono = /^\d{9}$/;;// 9 numeros
        var check=true;
        $("#ErrorCorreoReTra").text(""); 
        $("#ErrorNombreReTra").text("");
        if(!expresionCorreo.test(correos)){
            check=false;
            $("#ErrorCorreoReTra").text("El texto intoducido no corresponde a una dirección de correo");
        }
        if(!expresionNombre.test(nombres)){
            check= false;
            $("#ErrorNombreReTra").text("El nombre solo puede contener letras");
        }
        if(!expresiontelefono.test(telefonos)){
            check= false;
            $("#ErrorTelefonoReTra").text("Introduce un numero de teléfono");
        }
        if(check){
            $.ajax({
                url: "/usuarios/registroTrabajador",
                method: "POST",
                data:{correo:correos,password:passwords,nombre:nombres,ubicacion:ubicaciones,profesion:profesiones,telefono:telefonos},
                success:function(data){
                    if(data.add !== true ){
                        $("#ErrorCorreoReTra").text("Correo en uso");
                    } else{
                        $("#registrarseTra").modal('hide');
                        nuevoNavBar(true,0,data.id);
                        fotoUsuario(null);
                        $("#session").attr('data-session', true);
                        mostrarAlertaCheck("Bienvenido "+data.nombre);
                       
                    }
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo añadir tu usuario al sistema");
                }
            })
        }
    })

    $(document).on('click', '#divFotoPerfil', function() {
        $("#modalCambioFotoPerfil").modal('show');
    });

    $(document).on('click', '#CambioFotoPerfil', function() {
        var fileInput = $('#cambioFotoPerfil')[0];
        var formData = new FormData($('#cambiarFotoPerfil')[0]);
        $("#errorFotoPerfil").text("");
        
        if (fileInput.files.length > 0) {
            var file = fileInput.files[0];

            if (file.type !== 'image/png') {
                $("#errorFotoPerfil").text("El archivo no es del tipo PNG");
                return;
            }

            if (file.size <= 500 * 1024 * 1024) {//5 megas
                $.ajax({
                    url: '/usuarios/cambiarFoto',
                    type: 'POST',
                    data: formData,
                    contentType: false,
                    processData: false,
                    success: function(response) {
                        $("#fotoPerfil").attr("src", "data:image/png;base64," + response.newImage);
                        mostrarAlertaCheck("Se ha cambiadp la foto con exito");
                        $("#modalCambioFotoPerfil").modal('hide');  
                    },
                    error: function(err) {
                        mostrarAlertaCross("No se pudo cambiar tu foto de perfil");
                    }
                });
            } else {
                $("#errorFotoPerfil").text("La imagen es muy pesada, Tamaño máximo 5 MB");
            }
        } else {
            $("#errorFotoPerfil").text("No has subido un archivo");
        }
    });

    $(document).on('click', '#subirTrabajadorBtn', function() {
        var profesiones= $("#profesionsubirTrabajador").val();
        var ubicaciones =$("#UbicacionsubirTrabajador").val();
        var telefonos =$("#TelefonosubirTra").val();
        const expresiontelefono = /^\d{9}$/;;// 9 numeros
        $("#ErrorTelefonosubirReTra").text("");
        if(!expresiontelefono.test(telefonos)){
            $("#ErrorTelefonosubirReTra").text("No es un numero de telefonos");
        }else{
            $.ajax({
                url: "/usuarios/subirTrabajador",
                method: "POST",
                data:{ubicacion:ubicaciones,profesion:profesiones,telefono:telefonos},
                success:function(data){
                    nuevoNavBar(true,data.mensajes,data.id);
                    mostrarAlertaCheck("Ya eres un trabajador "+data.nombre);    
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo ascender tu usuario a trabajador");
                }
            })
        }
    });
    function fotoUsuario(foto){
        if(foto===null){
            var div=` 
            <div id="divFotoPerfil" class="w-25 d-flex justify-content-center d-none d-md-flex">
                <img class="img-fluid  border border-dark border-3" src="/images/noUsuario.png" id="fotoPerfil" alt="fotoPerfil"></img>
            </div>`
        }else{
            var base64String = arrayBufferToBase64(foto.data);
            var div=` 
            <div id="divFotoPerfil" class="w-25 d-flex justify-content-center d-none d-md-flex"> 
                <img src="data:image/png; base64, ${base64String}" id="fotoPerfil" class="img-fluid border border-dark border-3" alt="fotoPerfil">
            </div>  `
        }
        $("#NAV").after(div) 
    }
    function arrayBufferToBase64(buffer) {
        var binary = '';
        var bytes = new Uint8Array(buffer);
        var len = bytes.byteLength;
        for (var i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    }
    function nuevoNavBar(esTrabajador,numMensajes,idUsu){
        $("#NAV").empty();
        var nuevoNavBar=``;
        if(esTrabajador){
            nuevoNavBar=`
            <div class="navbar-brand" id="logoMarca">
                <img class="image-fluid w-100 border border-warning border-3" alt="Logo Manitas" src="/images/logo.png">
            </div>
            <button class="navbar-toggler mx-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav w-100">
                    <li class="nav-item w-100">
                        <form action="/" method="GET" class="d-flex">
                            <button type="submit" class="btn btn-dark w-100">Inicio</button>
                        </form>
                    </li>
                    <li class="nav-item w-100">
                        <form action="/usuarios/logout" method="GET" class="d-flex" role="search">
                            <button type="submit" id="CerrarSesion" class="btn btn-danger w-100">Cerrar sesion</button>
                        </form>
                    </li>
                    <li class="nav-item w-100" id="perfil">
                        <form action="/usuarios/miPerfil" method="GET" class="d-flex " role="search"> 
                            <button type="submit" class="btn btn-light w-100">Mi perfil</button>
                        </form>   
                    </li>
                    <li class="nav-item w-100" id="calendario">
                    <form action="/usuarios/calendario" method="GET" class="d-flex" role="search"> 
                        <button type="submit" class="btn btn-light w-100">Mi agenda</button>
                    </form>  
                    </li>
                    <li class="nav-item w-100">
                        <form action="/usuarios/misMensajes" method="GET" class="d-flex" role="search"> 
                            <button type="submit" class="btn btn-light w-100" id="mensajes"  data-mensajes="${numMensajes}">
                            Mis chats
                             ${numMensajes > 0 ? `<span class="p-1 bg-danger border border-light rounded-circle">${numMensajes}</span>` : ''}
                            </button>
                        </form>   
                    </li>
                </ul>
            </div>
        </div>
          <script type="module">
                import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
                const socket = io({
                    auth: {
                        id_user: "${idUsu}",
                    }
                });

                socket.on('chat message', function(datos) {
                    var mensajes = $("#mensajes").attr("data-mensajes");
                    mensajes++;
                    $("#mensajes").attr("data-mensajes",mensajes);
                    $("#mensajes").empty();
                    var mens = \`Mis chats
                    <span class="p-1 bg-danger border border-light rounded-circle">\${mensajes}</span>\`;
                    $("#mensajes").append(mens);
                });

                socket.on('mensajeError', (data) => {
                    alert('Error al enviar el mensaje: ' + data);
                });
            </script>`
        }else{
            nuevoNavBar=`
            <div class="navbar-brand" id="logoMarca">
                <img class="image-fluid w-100 border border-warning border-3" alt="Logo Manitas" src="/images/logo.png">
            </div>
            <button class="navbar-toggler mx-auto" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNav">
                <ul class="navbar-nav w-100">
                    <li class="nav-item w-100">
                        <form action="/" method="GET" class="d-flex">
                            <button type="submit" class="btn btn-dark w-100">Inicio</button>
                        </form>
                    </li>
                    <li class="nav-item w-100">
                        <form action="/usuarios/logout" method="GET" class="d-flex" role="search">
                            <button type="submit" id="CerrarSesion" class="btn btn-danger w-100">Cerrar sesion</button>
                        </form>
                    </li>
                    <li class="nav-item w-100" id="premium" >
                        <button type="button" class="btn btn-outline-light w-100" id="PasarTrabajador">Hacerse Trabajador</button> 
                    </li>
                    <li class="nav-item w-100">
                        <form action="/usuarios/misMensajes" method="GET" class="d-flex" role="search"> 
                            <button type="submit" class="btn btn-light w-100" id="mensajes" data-mensajes="${numMensajes}">Mis chats
                            ${numMensajes > 0 ? `<span class="p-1 bg-danger border border-light rounded-circle">${numMensajes}</span>` : ''}
                            </button>
                        </form>   
                    </li>
                </ul>
            </div>
        </div>
          <script type="module">
                import { io } from "https://cdn.socket.io/4.3.2/socket.io.esm.min.js";
                const socket = io({
                    auth: {
                        id_user: "${idUsu}",
                    }
                });

                socket.on('chat message', function(datos) {
                    var mensajes = $("#mensajes").attr("data-mensajes");
                    mensajes++;
                    $("#mensajes").attr("data-mensajes",mensajes);
                    $("#mensajes").empty();
                    var mens = \`Mis chats
                    <span class="p-1 bg-danger border border-light rounded-circle">\${mensajes}</span>\`;
                    $("#mensajes").append(mens);
                });

                socket.on('mensajeError', (data) => {
                    alert('Error al enviar el mensaje: ' + data);
                });
            </script>`
        }
        $("#NAV").append(nuevoNavBar);
    }
    $("#botonCerrar").on("click", function(){
        $("#modalPerfil").modal("hide");
    })
    $('#UbicacionTra').select2({
        placeholder: "Selecciona una provincia",
        allowClear: true,
        dropdownParent: $('#registrarseTra')
    });
    $('#UbicacionsubirTrabajador').select2({
        placeholder: "Selecciona una provincia",
        allowClear: true,
        dropdownParent: $('#subirTrabajador')
    });
})

function mostrarAlertaCheck(mensaje) {
    Swal.fire({
      title: 'Éxito',
      text: mensaje,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }
  
  function mostrarAlertaCross(mensaje) {
    Swal.fire({
      title: 'Error',
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }