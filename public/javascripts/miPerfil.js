
$(function(){

    $('#boton-borrar').on('click', function(){
        $("#modalConfirmar").modal('show');
    });
    $(".CerrarConfirmar").on('click',function(){
        $("#modalConfirmar").modal('hide');
     })
     $("#cruzcerrar").on('click',function(){
        $("#modalAddFoto").modal('hide');
     })
     $("#ConfirmarBorrar").on('click',function(){
        var index = $(".active").eq(1).data("id_foto"); // Obtener el índice del botón que se ha hecho clic
        $.ajax({
            url: '/usuarios/borrarFoto',
            method: 'DELETE',
            data: { id_foto: index,},
            success: function(response) {
                $('#caruselFotos').find('.active').remove(); // Eliminar el elemento activo del carrusel
            
                // Obtener el siguiente elemento después del eliminado y activarlo
                var siguienteElemento = $('#caruselFotos').find('.carousel-item').eq(0);
                if (siguienteElemento.length > 0) {
                    siguienteElemento.addClass('active');
                } else {
                    // Si no hay siguiente elemento, ocultar el carrusel
                    $('#caruselFotos').hide();
                    $("#boton-borrar").hide();
                }
                $("#modalConfirmar").modal('hide');
                $('.carousel-indicators').find('button').eq(0).addClass('active'); // Marcar el nuevo indicador como activo
          
            },
            error: function(xhr, status, error) {
                mostrarAlertaCross('Error al obtener el horario de trabajo del trabajador:', error);
            }
        });
     })
     $("#addFoto").on('click',function(){
        $("#modalAddFoto").modal('show');
     })
     $("#cruzcerrar").on('click',function(){
        $("#modalAddFoto").modal('hide');
     })
     $("#subirFoto").on('click',function(){//añadir foto de trabajos previos
        var fileInput = $('#imageInput')[0];
        if(fileInput.files.length>0){
            var file = fileInput.files[0];
            if (file.type !== 'image/png') {
                $("#errorInput").text("El archivo no es del tipo PNG");
                return;
            }
            if(file.size<=5000*1024){
                $('#uploadForm').submit();
            }
            else{
                $("#errorInput").text("La imagen es muy pesada");
            }
        }
        else{
            $("#errorInput").text("No has subido una imagen");
        }
    })
    $("#textoDescripcion").on('input', function() {
        if ($("#textoDescripcion").val().length > 500) {
            $("#textoDescripcion").val($("#textoDescripcion").val().slice(0, 500));
        }
        actualizarContador();
    });
    function actualizarContador() {
        var caracteresRestantes = 500 - $("#textoDescripcion").val().length;
        $("#contador-caracteres").text(caracteresRestantes + " caracteres restantes");
    }
    $("#confirmarCambios").on("click",function(){
        var telefono= $("#telefono").val();
        var ubicacion = $("#ubicacion").val();
        var descripcion = $("#textoDescripcion").val();
        var expresionRegular = /^\d{9}$/;
        if(expresionRegular.test(telefono)){
            $.ajax({
                url: '/usuarios/cambiarPerfil',
                method: 'POST',
                data: { telefono,ubicacion,descripcion},
                success: function(response) { 
                    mostrarAlertaCheck("Se guardaron los cambios correctamente")
                },
                error: function(xhr, status, error) {
                    mostrarAlertaCross('Error al guardar los cambios');
                }
            })
        }else{
            mostrarAlertaTelefono();  
        }
    })
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
    function mostrarAlertaTelefono() {
        Swal.fire({
        title: 'Numero de Telefono',
        text: 'Los numeros de telefono estan compuesto por 9 cifras',
        icon: 'info'
        })
    }