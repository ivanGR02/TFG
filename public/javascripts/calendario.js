$(function(){
    let monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre','Octubre', 'Noviembre', 'Diciembre'];

    let currentDate = new Date();
    let currentDay = currentDate.getDate();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    // los que se muestran en el calendario
    let monthNumber = currentDate.getMonth();
    let yearNumber = currentDate.getFullYear();
    
    
    $("#reservaCorta").on('click',function(){
        $("#reservaCortaModal").modal('show');
        $("#reservaLargaModal").modal('hide');
    })
    $("#reservaLarga").on('click',function(){
        $("#reservaLargaModal").modal('show');
        $("#reservaCortaModal").modal('hide');
    })

    $("#hacerReservaLarga").on('click',function(){
        var diaIni =$("#DiaInicioReserva").val();
        var diaIniParse=Date.parse(diaIni);
        var diaFin=$("#DiaFinReserva").val();
        var diaFinParse=Date.parse(diaFin);

        var nombre=$("#NombreReservaLarga").val();
        var ubicacion=$("#UbicacionReservaLarga").val();
        var dia_inicio=$("#DiaInicioReserva").val();
        var dia_final=$("#DiaFinReserva").val();
        var color=$("#colorReservaLarga").val();
        var descripcion=$("#DescripcionLarga").val();
        var fechaRellenada = diaIni !== ''; 
        var fechaRellenada2 = diaFin!== '';
        if (!fechaRellenada && !fechaRellenada2){
            mostrarAlertaCross("Se tiene que poner un día y unas horas de inicio y fin")
        }
        else if(diaFinParse<diaIniParse){
            mostrarAlertaCross("Dias mal puestos")
        }else{
            $.ajax({
                url: "/usuarios/reservaLarga",
                method: "POST",
                data:{nombre,ubicacion,dia_inicio,dia_final,descripcion,color},
                success:function(data){
                    if(!data){
                        mostrarAlertaCross("Ya hay una reserva para ese dia")
                    } else{
                        nuevaFecha()
                        mostrarAlertaCheck("Se guardo la reserva");
                        $("#reservaLargaModal").modal('hide');
                    }
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo guardar la reserva");
                }
            })
        }
    })
    $("#hacerReservaCorta").on('click',function(){
        var horaInicio =$("#HoraInicio").val();
        var horaFin =$("#HoraFin").val();

        var nombre=$("#NombreReservaCorta").val();
        var ubicacion=$("#UbicacionReservaCorta").val();
        var dia=$("#DiaReserva").val();
        var color=$("#colorReservaCorta").val();
        var descripcion=$("#DescripcionLarga").val();
        var fechaRellenada = dia !== ''; 
        var horaRellenada = horaInicio!== '';
        var horaRellenada2 = horaFin !== '';
        if (!fechaRellenada && !horaRellenada && !horaRellenada2 ){
            mostrarAlertaCross("Se tiene que poner un día y unas horas de inicio y fin")
        }
        else if(horaFin<horaInicio){
            mostrarAlertaCross("Horas mal puestas")
        }else{
            $.ajax({
                url: "/usuarios/reservaCorta",
                method: "POST",
                data:{nombre,ubicacion,dia,horaInicio,horaFin,descripcion,color},
                success:function(data){
                    if(!data){
                        mostrarAlertaCross("Ya hay una reserva para ese dia")
                    } else{
                        nuevaFecha()
                        mostrarAlertaCheck("Se guardo la reserva");
                        $("#reservaCortaModal").modal('hide');
                    }
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo guardar la reserva");
                }
            })
        }
    })

    $('#month').text(monthNames[monthNumber]+" ");
    $('#year').text(" "+yearNumber.toString());
    
    
    
    $("#next-month").on('click',function(){
        if(monthNumber !== 11){
            monthNumber++;
        }else{
            monthNumber = 0;
            yearNumber++;
        }
        nuevaFecha();
    })
    $("#prev-month").on('click',function(){
        if(monthNumber !== 0){
            monthNumber--;
        }else{
            monthNumber = 11;
            yearNumber--;
        }
    
        nuevaFecha();
    })
    
    
    const EscribeMes = (month) => {

        $.ajax({
            url: "/usuarios/getReservas",
            method: "GET",
            data:{mes:monthNumber+1,year:yearNumber},
            success:function(data){
                var semana=0;
                var fila =$("<div class='row'><div class='d-flex flex-row justify-content-evenly semana'></div></div>")
                const firstDayOfMonth = new Date(yearNumber, monthNumber, 1);
                let startDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7; // Ajustar para que lunes sea 0 y domingo sea 6
                const lastDayOfMonth = new Date(yearNumber, monthNumber+1, 0);
                let endDayOfWeek = (lastDayOfMonth.getDay() + 6) % 7; // Ajustar para que lunes sea 0 y domingo sea 6

                var inicioCalendario = new Date(yearNumber, monthNumber,- startDayOfWeek);
                var finCalendario = new Date(yearNumber, monthNumber + 1, 7 - endDayOfWeek); // Aquí puedes cambiarlo si prefieres que sea 8

                let fechasIntermedias = []; // Array para guardar todas las fechas del calendario

                for (let fecha = moment(inicioCalendario); fecha <= moment(finCalendario); fecha.add(1, 'days')) {
                    fechasIntermedias.push(fecha.format('YYYY-MM-DD'));
                }

                var j=1;//para coger las fechas intermedias
                var k=0;// para coger las reservas del data
                var l=0;//mirar cuantos dias dura la reserva larga seleccionada

                //FINAL MES ANTERIOR
                for(let i = InicioMes(); i>0;i--){
                    var dia=``;
                    if(l){
                        if (isDarkColor(data[k].color)) {
                            colorFondo= 'white' // Texto blanco para fondos oscuros
                        } else {
                            colorFondo='black' // Texto negro para fondos claros
                        }
                        dia =` 
                        <div class="datereservaLarga calendar__date  calendar__item calendar__last-days border border-dark border-3 w-100 py-4"
                         data-dia="${yearNumber}-${(monthNumber ).toString().padStart(2, '0')}-${(getDiasTotales(monthNumber-1)-(i-1)).toString().padStart(2, '0')}"
                          style="background-color: ${data[k].color}; color: ${colorFondo};" data-reserva=" ${data[k].id_reserva}">
                            ${getDiasTotales(monthNumber-1)-(i-1)}
                            <br>Reserva: ${data[k].nombre}
                        </div>`
                        l--;
                        if(l===0) k++;
                    }
                    if(k<data.length){
                        if(fechasIntermedias[j]===data[k].fecha_reserva_ini){
                            if(data[k].tipo){//tiene una reserva larga
                                if (isDarkColor(data[k].color)) {
                                    colorFondo= 'white' // Texto blanco para fondos oscuros
                                } else {
                                    colorFondo='black' // Texto negro para fondos claros
                                }
                               dia =` 
                                <div class="datereservaLarga calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber ).toString().padStart(2, '0')}-${(getDiasTotales(monthNumber-1)-(i-1)).toString().padStart(2, '0')}"
                                 style="background-color: ${data[k].color};  color: ${colorFondo};" data-reserva=" ${data[k].id_reserva}">
                                    ${getDiasTotales(monthNumber-1)-(i-1)}
                                    <br>Reserva: ${data[k].nombre}
                                </div>`
                                const fechaInicio = new Date(data[k].fecha_reserva_ini);
                                const fechaFin = new Date(data[k].fecha_reserva_fin);
                                const diferenciaMilisegundos = fechaFin.getTime() - fechaInicio.getTime();
                                l = diferenciaMilisegundos / (1000 * 60 * 60 * 24);// la diferencia en milisegundos se pasa a dias
                                if(l===0) k++;// si solo has reservado un dia entero tienes que avanzar la cita
                            }else{// miro cuantas reservas cortas estan asignadas a ese dia
                                var contadorReservas=1;
                                k++;
                                if(k<data.length){
                                    while(fechasIntermedias[j]===data[k].fecha_reserva_ini){
                                        contadorReservas++;
                                        k++;
                                    }
                                }
                                dia =` 
                                <div class="calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber ).toString().padStart(2, '0')}-${(getDiasTotales(monthNumber-1)-(i-1)).toString().padStart(2, '0')}">
                                    ${getDiasTotales(monthNumber-1)-(i-1)}
                                    <br>Reservas: ${contadorReservas}
                                </div>`
                            }
    
                        }
                    }
                    if(dia===``){
                       dia =` <div class="calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber ).toString().padStart(2, '0')}-${(getDiasTotales(monthNumber-1)-(i-1)).toString().padStart(2, '0')}">
                        ${getDiasTotales(monthNumber-1)-(i-1)}
                        </div>`
                    }
                    $(fila).find(".semana").append(dia);
                    semana++;
                   j++;
                }
              
                ///MES ACTUAL

                for(let i=1; i<=getDiasTotales(month); i++){
                    var dia=``;
                    var hoy= "border-dark";
                    if(semana===7){
                        $("#dates").append(fila);
                        fila = $("<div class='row'><div class='d-flex flex-row justify-content-evenly semana'></div></div>");
                        semana=0;
                    }
                    if(i===currentDay && currentMonth===month &&yearNumber===currentYear) {
                        hoy ="border-warning"
                    }
                    if(l>0){
                        if (isDarkColor(data[k].color)) {
                            colorFondo= 'white' // Texto blanco para fondos oscuros
                        } else {
                            colorFondo='black' // Texto negro para fondos claros
                        }
                        dia =` 
                        <div class="datereservaLarga calendar__item border border-3 w-100 py-4 ${hoy}" data-dia="${yearNumber}-${(monthNumber+1).toString().padStart(2, '0')}-${(i).toString().padStart(2, '0')}"
                         style="background-color: ${data[k].color}; color: ${colorFondo};" data-reserva=" ${data[k].id_reserva}">
                            ${i}
                            <br>Reserva: ${data[k].nombre}
                        </div>`
                        l--;
                        if(l===0) k++;
                    }
                    if(k<data.length){
                        if(fechasIntermedias[j]===data[k].fecha_reserva_ini){
                            if(data[k].tipo){//tiene una reserva larga
                                if (isDarkColor(data[k].color)) {
                                    colorFondo= 'white' // Texto blanco para fondos oscuros
                                } else {
                                    colorFondo='black' // Texto negro para fondos claros
                                }
                               dia =` 
                                <div class="datereservaLarga calendar__item border border-3 w-100 py-4 ${hoy}" data-dia="${yearNumber}-${(monthNumber+1).toString().padStart(2, '0')}-${(i).toString().padStart(2, '0')}" 
                                style="background-color: ${data[k].color}; color: ${colorFondo};"data-reserva=" ${data[k].id_reserva}">
                                    ${i}
                                    <br>Reserva: ${data[k].nombre}
                                </div>`
                                const fechaInicio = new Date(data[k].fecha_reserva_ini);
                                const fechaFin = new Date(data[k].fecha_reserva_fin);
                                var diferenciaMilisegundos = fechaFin.getTime() - fechaInicio.getTime();
                                l = diferenciaMilisegundos / (1000 * 60 * 60 * 24);// la diferencia en milisegundos se pasa a dias
                                if(l===0) k++;// si solo has reservado un dia entero tienes que avanzar la cita
                            }else{// miro cuantas reservas cortas estan asignadas a ese dia
                                var contadorReservas=1;
                                k++;
                                while(k<data.length && fechasIntermedias[j]===data[k].fecha_reserva_ini ){
                                    contadorReservas++;
                                    k++;
                                }
                                dia =` 
                                <div class="calendar__date calendar__item  border border-3 ${hoy} w-100 py-4" data-dia="${yearNumber}-${(monthNumber+1).toString().padStart(2, '0')}-${(i).toString().padStart(2, '0')}">
                                    ${(i)}
                                    <br>Reservas: ${contadorReservas}
                                </div>`
                            }
                        }
                    }
                    if(dia===``){
                       dia =` <div class="calendar__date calendar__item ${hoy} border border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber+1).toString().padStart(2, '0')}-${(i).toString().padStart(2, '0')}">
                        ${(i)}
                        </div>`
                    }
                    $(fila).find(".semana").append(dia);
                    j++;
                    semana++;
                }

                ///INICIO MES SIGUIENTE

                for(let i=0;i+semana<7;i++){
                    var dia=``;
                    if(l){
                        if (isDarkColor(data[k].color)) {
                            colorFondo= 'white' // Texto blanco para fondos oscuros
                        } else {
                            colorFondo='black' // Texto negro para fondos claros
                        }
                        dia =` 
                        <div class="datereservaLarga calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber + 2).toString().padStart(2, '0')}-${(i+1).toString().padStart(2, '0')}" 
                        style="background-color: ${data[k].color}; color: ${colorFondo};" data-reserva=" ${data[k].id_reserva}">
                            ${i+1}
                            <br>Reserva: ${data[k].nombre}
                        </div>`
                        l--;
                        if(l===0) k++;
                    }
                    if(k<data.length){
                        if(fechasIntermedias[j]===data[k].fecha_reserva_ini){
                            if(data[k].tipo){//tiene una reserva larga
                                if (isDarkColor(data[k].color)) {
                                    colorFondo= 'white' // Texto blanco para fondos oscuros
                                } else {
                                    colorFondo='black' // Texto negro para fondos claros
                                }
                               dia =` 
                                <div class="datereservaLarga calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber + 2).toString().padStart(2, '0')}-${(i+1).toString().padStart(2, '0')}" 
                                style="background-color: ${data[k].color}; color: ${colorFondo};"data-reserva=" ${data[k].id_reserva}">
                                    ${i+1}
                                    <br>Reserva: ${data[k].nombre}
                                </div>`
                                const fechaInicio = new Date(data[k].fecha_reserva_ini);
                                const fechaFin = new Date(data[k].fecha_reserva_fin);
                                const diferenciaMilisegundos = fechaFin.getTime() - fechaInicio.getTime();
                                l = diferenciaMilisegundos / (1000 * 60 * 60 * 24);// la diferencia en milisegundos se pasa a dias
                                if(l===0) k++;// si solo has reservado un dia entero tienes que avanzar la cita
                            }else{// miro cuantas reservas cortas estan asignadas a ese dia
                                var contadorReservas=1;
                                k++;
                                while(k<data.length && fechasIntermedias[j]===data[k].fecha_reserva_ini){
                                    contadorReservas++;
                                    k++;
                                }
                                dia =` 
                                <div class="calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber + 2).toString().padStart(2, '0')}-${(i+1).toString().padStart(2, '0')}">
                                    ${i+1}
                                    <br>Reservas: ${contadorReservas}
                                </div>`
                            }
    
                        }
                    }
                    if(dia===``){
                       dia =` <div class="calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4" data-dia="${yearNumber}-${(monthNumber + 2).toString().padStart(2, '0')}-${(i+1).toString().padStart(2, '0')}">
                        ${i+1}
                        </div>`
                    }
                    $(fila).find(".semana").append(dia);
                   j++;
                   
                }
                $("#dates").append(fila);

                $(document).on('click', '.calendar__date', function() {
                    var selectedDate = $(this).data("dia");
                    generarAgenda(selectedDate);
                });
            },
            error: function (error) {
                mostrarAlertaCross("No se han podido cargar tus reservas");
                var semana=0;
                var fila =$("<div class='row'><div class='d-flex flex-row justify-content-evenly semana'></div></div>")
                for(let i = InicioMes(); i>0;i--){
            
                    var dia =` <div class="calendar__date calendar__item calendar__last-days border border-dark border-3 w-100 py-4">
                    ${getDiasTotales(monthNumber-1)-(i-1)}
                    </div>`
                    $(fila).find(".semana").append(dia);
                    semana++;
                }
                
                for(let i=1; i<=getDiasTotales(month); i++){
                    if(semana===7){
                        $("#dates").append(fila);
                        fila = $("<div class='row'><div class='d-flex flex-row justify-content-evenly semana'></div></div>");
                        semana=0;
                    }
                    if(i===currentDay && currentMonth===month &&yearNumber===currentYear) {
                        var dia =  ` <div class="calendar__date calendar__item calendar__today border border-light border-3 w-100 py-4">${i}</div>`
                        $(fila).find(".semana").append(dia);
                        semana++;
                    }else{
                        var dia =` <div class="calendar__date calendar__item border border-dark border-3 w-100 py-4">${i}</div>`;
                        $(fila).find(".semana").append(dia);
                        semana++;
                    }
                }
                for(let i=0;i+semana<7;i++){
                    var dia =` <div class="calendar__date calendar__item calendar__last-days border border-dark border-3  w-100 py-4">${i+1}</div>`;
                    $(fila).find(".semana").append(dia);
                }
                $("#dates").append(fila);

                $(document).on('click', '.calendar__date', function() {
                    var selectedDate = $(this).data("dia");
                    generarAgenda(selectedDate);
                });
            }
        })

       
    }
    
    const getDiasTotales = month => {
        if(month === -1) month = 11;
    
        if (month == 0 || month == 2 || month == 4 || month == 6 || month == 7 || month == 9 || month == 11) {
            return  31;
    
        } else if (month == 3 || month == 5 || month == 8 || month == 10) {
            return 30;
    
        } else {
    
            return esBisiesto() ? 29:28;
        }
    }
    
    const esBisiesto = () => {
        return ((yearNumber % 100 !==0) && (yearNumber % 4 === 0) || (yearNumber % 400 === 0));
    }
    
    const InicioMes = () => {
        let start = new Date(yearNumber, monthNumber, 1);
        return ((start.getDay()-1) === -1) ? 6 : start.getDay()-1;
    }
    
    const nuevaFecha = () => {
        currentDate.setFullYear(yearNumber,monthNumber,currentDay);
        $('#month').text(monthNames[monthNumber]+" ");
        $('#year').text(" "+yearNumber.toString());
        $('#dates').text('');
        EscribeMes(monthNumber);
    }
    
    EscribeMes(monthNumber);

    $('#dates').on("click", ".row .semana .calendar_date", function() {
        var dia = $(this).val(); 
        generarAgenda(dia);
    });
    $('#dates').on("click", ".row .semana .datereservaLarga", function() {
        var id_reserva= $(this).attr("data-reserva");
        $.ajax({
            url: "/usuarios/getReservaId",
            method: "GET",
            data:{id_reserva},
            success:function(data){
             rellenarModal(data[0]);
             $("#reservaLargaUpdateModal").modal('show');
            },
            error: function (error) {
                mostrarAlertaCross("No se pudo recuperar la reserva");
            }
        })
    });
    $("#borrarReservaLarga").on("click",function(){
        var id_reserva= $(this).attr("data-reserva");
        $.ajax({
            url: "/usuarios/deleteReservaId",
            method: "POST",
            data:{id_reserva},
            success:function(data){
                nuevaFecha()
                $("#reservaLargaUpdateModal").modal('hide');
                mostrarAlertaCheck("Se borro la reserva con éxito")
            },
            error: function (error) {
                mostrarAlertaCross("No se pudo recuperar la reserva");
            }
        })
    })
    $("#UpdateReservaLarga").on('click',function(){
        var diaIni =$("#DiaInicioReservaUpdate").val();
        var diaIniParse=Date.parse(diaIni);
        var diaFin=$("#DiaFinReservaUpdate").val();
        var diaFinParse=Date.parse(diaFin);

        var nombre=$("#NombreReservaUpdateLarga").val();
        var ubicacion=$("#UbicacionReservaUpdateLarga").val();
        var dia_inicio=$("#DiaInicioReservaUpdate").val();
        var dia_final=$("#DiaFinReservaUpdate").val();
        var color=$("#colorReservaLargaUpdate").val();
        var descripcion=$("#DescripcionLargaUpdate").val();
        var id_reserva= $(this).attr("data-reserva");
        var fechaRellenada = diaIni !== ''; 
        var fechaRellenada2 = diaFin!== '';
        if (!fechaRellenada && !fechaRellenada2){
            mostrarAlertaCross("Se tiene que poner un día de inicio y finalizacion")
        }
        else if(diaFinParse<diaIniParse){
            mostrarAlertaCross("Dias mal puestos")
        }else{
            $.ajax({
                url: "/usuarios/UpdatereservaLarga",
                method: "POST",
                data:{id_reserva,nombre,ubicacion,dia_inicio,dia_final,descripcion,color},
                success:function(data){
                    if(!data){
                        mostrarAlertaCross("Ya hay una reserva para ese dia")
                    } else{
                        nuevaFecha()
                        $("#reservaLargaUpdateModal").modal('hide');
                        mostrarAlertaCheck("se modifico la reserva");
                    }
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo guardar la reserva");
                }
            })
        }
    })
    const citas = [
    ];
    function generarAgenda(dia) {
        $.ajax({
            url: "/usuarios/getCitasDia",
            method: "GET",
            data:{dia},
            success:function(data){
                let i=0;// a que 
                pintarAgenda();
                if(data){// si no hay reservas devuelve false
                    data.forEach(function(dia){
                        addReserva(dia.hora_inicio,dia.hora_fin,dia.nombre,dia.color,dia.id_reserva);
                    })
                }
                $("#fechaAgenda").text(dia);
                $("#agendaModal").modal("show");
            },
            error: function (error) {
                mostrarAlertaCross("No se pudo guardar la reserva");
            }
        })
       
    }
    $('#agenda').on("click", ".row .content .reserva", function() {
        var id_reserva= $(this).attr("data-reserva");
        $.ajax({
            url: "/usuarios/getReservaId",
            method: "GET",
            data:{id_reserva},
            success:function(data){
                $("#agendaModal").modal('hide');
                rellenarModal2(data[0]);
                $("#reservaCortaModalUpdate").modal('show');
            },
            error: function (error) {
                mostrarAlertaCross("No se pudo recuperar la reserva");
            }
        })
    });
    $("#BorrarReservaCorta").on("click",function(){
        var id_reserva= $(this).attr("data-reserva");
        $.ajax({
            url: "/usuarios/deleteReservaId",
            method: "POST",
            data:{id_reserva},
            success:function(data){
                nuevaFecha()
                $("#reservaCortaModalUpdate").modal('hide');
                mostrarAlertaCheck("Se borro la reserva con éxito")
            },
            error: function (error) {
                mostrarAlertaCross("No se pudo recuperar la reserva");
            }
        })
    })
    $("#UpdatereservaCorta").on('click',function(){
        var horaInicio =$("#HoraInicioUpdate").val();
        var horaFin =$("#HoraFinUpdate").val();
        
        var nombre=$("#NombreReservaCortaUpdate").val();
        var ubicacion=$("#UbicacionReservaCortaUpdate").val();
        var dia=$("#DiaReservaUpdate").val();
        var color=$("#colorReservaCortaUpdate").val();
        var descripcion=$("#DescripcionLargaUpdate").val();
        var id_reserva= $(this).attr("data-reserva");
        var fechaRellenada = dia !== ''; 
        var horaRellenada = horaInicio!== '';
        var horaRellenada2 = horaFin!== '';
        if (!fechaRellenada && !horaRellenada && !horaRellenada2 ){
            mostrarAlertaCross("Se tiene que poner un día y unas horas de inicio y fin")
        }
        else if(horaFin<horaInicio){
            mostrarAlertaCross("Horas mal puestas")
        }else{
            $.ajax({
                url: "/usuarios/UpdatereservaCorta",
                method: "POST",
                data:{id_reserva,nombre,ubicacion,dia,horaInicio,horaFin,descripcion,color},
                success:function(data){
                    if(!data){
                        mostrarAlertaCross("Ya hay una reserva para ese dia")
                    } else{
                        nuevaFecha()
                        mostrarAlertaCheck("Se modifico la reserva");
                        $("#reservaCortaModalUpdate").modal('hide');
                        
                    }
                },
                error: function (error) {
                    mostrarAlertaCross("No se pudo guardar la reserva");
                }
            })
        }
    })
})
function pintarAgenda(){
    $("#agenda").empty();
    for(let hora=0; hora <24;hora ++){
         let horaTexto = (hora < 10 ? "0" + hora : hora)+":00";
         let row = $('<div>', {class: 'row border border-dark fila'});
        let timeCol = $('<div>', {class: 'col-2 time'}).html(`<p>${horaTexto}</p>`);
        let contentCol = $('<div>', {class: 'col-10 content', 'data-time': horaTexto});
        row.append(timeCol).append(contentCol);
        $('#agenda').append(row);
    }
}
function addReserva(horaInicio,horaFin,nombre,color,id){
    var horasAgenda=$(".content");
    let indiceInicio,indiceFinal;
    let horaAnterior,indiceAnterior;
    let ini=parseTimeToDate(horaInicio);
    let fin=parseTimeToDate(horaFin);
    horasAgenda.each(function(hora){ //se coge las horas de inicio a fin para poder dibujar la reserva
        let now=parseTimeToDate($(this).data("time"));
        if(ini>=horaAnterior && ini<now){
            indiceInicio =indiceAnterior;
        }
        if(fin>=horaAnterior && fin<now){
            indiceFinal =indiceAnterior;
        }
        indiceAnterior=hora
        horaAnterior=now;
    })
    if(indiceFinal!==undefined && indiceInicio!==undefined){
        var duracion=(fin-ini)/60000;
        var colocacion=horaInicio.substring(3,5);
        const filaInicio = horasAgenda.eq(indiceInicio);
        const reservaDiv = $('<div>', {class: 'reserva','data-reserva': id});
        const nombreDiv = $('<span>',{class:'nombre'}).text(nombre);
        const horas= $('<span>',{class:'text-left ms-2'}).text("Inicio: "+horaInicio+" Fin: "+horaFin);
        reservaDiv.append(nombreDiv).append(horas);
        reservaDiv.css('height', (duracion) + 'px'); // Ajuste de altura
        reservaDiv.css('background-color', color); // Color de la reserva
        reservaDiv.css("top",colocacion+"px")// en que punto de la cuadricula empieza, depende del minuto de inicio de la reserva
        if (isDarkColor(color)) {
            reservaDiv.css('color', 'white'); // Texto blanco para fondos oscuros
        } else {
            reservaDiv.css('color', 'black'); // Texto negro para fondos claros
        }
        filaInicio.append(reservaDiv);
    }
}
function parseTimeToDate(time) {
    const [hours, minutes] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
}
function rellenarModal(datos) {
    // Asignar valores a los elementos del modal
    $('#NombreReservaUpdateLarga').val(datos.nombre);
    $('#UbicacionReservaUpdateLarga').val(datos.ubicacion);
    $('#DiaInicioReservaUpdate').val(new Date(datos.fecha_reserva_ini).toISOString().split('T')[0]); // Convertimos a formato YYYY-MM-DD
    $('#DiaFinReservaUpdate').val(new Date(datos.fecha_reserva_fin).toISOString().split('T')[0]); // Convertimos a formato YYYY-MM-DD
    $('#colorReservaLargaUpdate').val(datos.color);
    $('#DescripcionLargaUpdate').val(datos.descripcion);
    $('#borrarReservaLarga').attr("data-reserva",datos.id_reserva);
    $('#UpdateReservaLarga').attr("data-reserva",datos.id_reserva);
}

function rellenarModal2(datos){
    $('#NombreReservaCortaUpdate').val(datos.nombre);
    $('#UbicacionReservaCortaUpdate').val(datos.ubicacion);
    $('#DiaReservaUpdate').val(new Date(datos.fecha_reserva_ini).toISOString().split('T')[0]);  // Formatea la fecha
    $('#HoraInicioUpdate').val(datos.hora_inicio);
    $('#HoraFinUpdate').val(datos.hora_fin);
    $('#colorReservaCortaUpdate').val(datos.color);
    $('#DescripcionCortaUpdate').val(datos.descripcion);
    $('#BorrarReservaCorta').attr("data-reserva",datos.id_reserva);
    $('#UpdatereservaCorta').attr("data-reserva",datos.id_reserva);
}
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
  function isDarkColor(color) {
    // Convertir el color a RGB
    const rgb = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
    if (!rgb) return false;

    const r = parseInt(rgb[1], 16);
    const g = parseInt(rgb[2], 16);
    const b = parseInt(rgb[3], 16);

    // Calcular la luminancia relativa
    const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

    // Si la luminancia es menor de 128, el color es oscuro
    return luminance < 128;
}