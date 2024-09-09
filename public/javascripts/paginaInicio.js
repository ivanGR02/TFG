
$(function(){
    $(document).on('click', '#contenedor .row .link', function() {
        var formId = $(this).data('id');
         $('#form' + formId).submit();
    });
    var trabajadores ={}// los perfiles vistos

    $("#busqueda").on('click', function(){
        var trabajo = $("#profesion").val();
        var ubi = $("#Ubicacion").val();
        $.ajax({
            url: '/busqueda',
            method: 'GET',
            data: { profesion: trabajo, ubicacion:ubi },
            success: function(response) {
                trabajadores =response;
                PerfilesTotales =trabajadores.length;
                MostrarPerfiles();
                },
            error: function(xhr, status, error) {
                mostrarAlertaCross('Error al buscar');
            }
        });
    })

    function MostrarPerfiles() {
        // Mostrar los perfiles correspondientes en la página actual
        $('#contenedor').empty();//elimino los perfiles 
        var contenedor= ``
        for (var i =0;i<trabajadores.length; i++) {
            if (i % 3 === 0) {
                contenedor += '<div class="row">';
            }
            var foto = trabajadores[i].foto_perfil ? 
            `data:image/png;base64,${arrayBufferToBase64(trabajadores[i].foto_perfil.data)} ` : 
            '/images/noUsuario.png';
            var altText = trabajadores[i].foto_perfil ? 
            `Foto de perfil de ${trabajadores[i].nombre}` : 
            `El trabajador ${trabajadores[i].nombre} no tiene foto perfil`;
            var estrellasHTML = '';
            for (var j = 0; j < Math.round(trabajadores[i].puntuacion); j++) {
                estrellasHTML += `<img class="img-fluid" src="/images/estrella.png" style="width: 25px; height: auto;" alt="Estrella valoración">`;
            }
            var trabajador = `
            <div class="col-lg-4 col-12 mb-4">
                <div class="card border-dark mx-auto link h-100" data-id="${trabajadores[i].id_usuario}">
                    <div class="row g-0">
                        <img class="img-fluid card-img-top" src="${foto}" alt="${altText}">
                        <div class="col-12">
                            <div class="card-header text-center">
                                <h5 class="card-title">${trabajadores[i].nombre}</h5>
                            </div>
                            <div class="card-body">
                                <p class="card-text">Profesión: ${trabajadores[i].profesion}</p>
                                <p class="card-text">Ubicación: ${trabajadores[i].ubicacion}</p>
                                <p class="card-text">Puntuación: ${trabajadores[i].puntuacion}
                                    ${estrellasHTML}
                                </p>
                            </div>
                            <form id="form${trabajadores[i].id_usuario}" action="/trabajador" method="GET">
                                <input type="hidden" name="id" value="${trabajadores[i].id_usuario}">
                                <input type="hidden" name="nombre" value="${trabajadores[i].nombre}">
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            `;
            contenedor+=trabajador;
            if ((i + 1) % 3 === 0 || i === trabajadores.length - 1) {
                contenedor+= '</div>';
            }
            }
            $('#contenedor').append(contenedor);
    }

    $("#PaginaSiguiente").on('click', function(){
        if (currentPage < Math.ceil(totalProfiles / profilesPerPage)) {
            currentPage++;
            MostrarPerfiles();
        }
    })
    $("#PaginaAnterior").on('click', function(){
        if (currentPage > 1) {
            currentPage--;
            MostrarPerfiles();
        }
    })
    $('#Ubicacion').select2({
        placeholder: "Selecciona una provincia",
        allowClear: true,
    });
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