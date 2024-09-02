
$(function(){
    // gestion de comentarios

    var paginaActual = 1; // Página actual
    var comentariosPorPagina = 5; // Perfiles por página
    var comentariosTotales = 0; // Total de perfiles recuperados en la búsqueda (por ejemplo)
    var comentarios ={}// los perfiles vistos
    //funciones de los botones
    $("#Chat").on('click', function(event){
        event.preventDefault();
        var inicioSesion =$("#session").attr("data-session");
        if(inicioSesion){
            $("#abrirChat").submit();
        }else{
            mostrarAlertaInicioSesion("Tienes que iniciar sesion para poder abrir un chat");
        }
    })
    $("#Comentario").on('click', function(){
        var inicioSesion =$("#session").attr("data-session");
        var id =$("#session").data("trabajador");
        var texto =$("#textoComentario").val();
        if(inicioSesion!=="false"){
            $.ajax({
                url: '/usuarios/nuevoComentario',
                method: 'POST',
                data: { id_trabajador: id, comentario:texto},
                success: function(response) {
                    mostrarAlertaCheck("se ha guardado tu comentario");
                    },
                error: function(xhr, status, error) {
                    mostrarAlertaCross('Error al guardar el comentario');
                } 
            })
        }else{
            mostrarAlertaInicioSesion("Tienes que iniciar sesion para poder abrir un chat");
        }
    })
    $(document).on('click', '.rating .puntuacion', function() {
        var inicioSesion =$("#session").attr("data-session");
        var id =$("#session").data("trabajador");
        var puntuacion =$(this).val();
        var click =$(this);
        if(inicioSesion!=="false"){
            $.ajax({
                url: '/usuarios/puntuar',
                method: 'POST',
                data: { id_trabajador: id, puntuacion:puntuacion},
                success: function(response) {
                    $(".miPuntuacion").addClass("puntuacion");
                    $(".miPuntuacion").addClass("btn-outline-secondary");
                    $(".miPuntuacion").removeClass("btn-warning")
                    $(".miPuntuacion").removeClass("miPuntuacion")
                    click.removeClass("puntuacion")
                    click.removeClass("btn-outline-secondary")
                    click.addClass("miPuntuacion");
                    click.addClass("btn-warning")
                    mostrarAlertaCheck("se ha guardado tu puntuacion");
                   
                    },
                error: function(xhr, status, error) {
                    mostrarAlertaCross('Error al guardar tu puntuacion');
                } 
            })
        }else{
            mostrarAlertaInicioSesion("Tienes que iniciar sesion para poder abrir un chat");
        }
    })
    $("#botonComentarios").on('click',function(){
        var id = $("#session").data('trabajador');
        $.ajax({
            url: '/comentarios',
            method: 'GET',
            data: { id_trabajador: id },
            success: function(response) {
                comentarios =response;
                comentariosTotales =comentarios.length;
                $("#prevPageButton").hide();
                if(comentariosTotales<=comentariosPorPagina)
                $("#nextPageButton").hide();
                MostrarComentarios();
                },
            error: function(xhr, status, error) {
                mostrarAlertaCross('Error al obtener los comentarios');
            }
        });
    });
    $("#cerrarComentarios").on('click',function(){
        $("#gestionComentarios").addClass("d-none");
        $("#botonComentarios").show();
        $("#comentarios").empty();
    })
    
    
    function MostrarComentarios(){
        // Calcular el índice inicial y final de los perfiles que se mostrarán en la página actual
        var indiceInicial = (paginaActual - 1) * comentariosPorPagina;
        var indiceFinal = Math.min(indiceInicial + comentariosPorPagina - 1, comentariosTotales - 1); // no pasar el último perfil
        // Mostrar los perfiles correspondientes en la página actual
        $("#gestionComentarios").removeClass("d-none");
        $("#botonComentarios").hide();
        $('#comentarios').empty();//elimino los comentarios anteriores 
        for (var i = indiceInicial; i <= indiceFinal; i++) {
            var com = `
            <div class="row">
                <div class="col-10 mx-auto">
                    <div class="card"> 
                        <div class="card-body"> 
                            <div class="row">
                                <div class="col-2">
                               ${imagen(comentarios[i].foto_perfil)}
                                </div>
                                <div class="col-10">
                                    <h5 class="card-title ">${comentarios[i].nombre}</h5> 
                                    <p class="card-text ">${comentarios[i].texto}</p> 
                                </div>
                            </div>
                        </div> 
                    </div>
                </div>
            </div>
           `;
            $('#comentarios').append(com);// añadir los comentarios nuevos
            }
    }
    $("#prevPageButton").on('click',function(){
        paginaActual--;
        MostrarComentarios();
        if(paginaActual===1) $(this).hide();
        $("#nextPageButton").show();
    })
    $("#nextPageButton").on('click',function(){
        paginaActual++;
        MostrarComentarios();
        if(paginaActual*comentariosPorPagina>comentariosTotales) $(this).hide();
        $("#prevPageButton").show()
    })
    function imagen(foto_perfil){
        if(foto_perfil===null) return ` <img class="img-fluid" src="/images/noUsuario.png" id="fotoPerfil" ></img>`;
        var base64String = arrayBufferToBase64(foto_perfil.data);
        return  ` <img src="data:image/png; base64, ${base64String}"class="img-fluid">`
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
});
  
  function mostrarAlertaCross(mensaje) {
    Swal.fire({
      title: 'Error',
      text: mensaje,
      icon: 'error',
      confirmButtonText: 'OK'
    });
  }
  function mostrarAlertaInicioSesion() {
    Swal.fire({
      title: 'Inicio de sesión requerido',
      text: 'Debes iniciar sesión para acceder a esta función.',
      icon: 'info',
      confirmButtonText: 'Iniciar sesión'
    }).then((result) => {
        if(result.isConfirmed){
            setTimeout(function() {
                $("#login").modal('show');
              }, 350);
        }
    })
    }
    function mostrarAlertaCheck(mensaje) {
    Swal.fire({
      title: 'Éxito',
      text: mensaje,
      icon: 'success',
      confirmButtonText: 'OK'
    });
  }