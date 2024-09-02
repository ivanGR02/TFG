
$(function(){
    $(document).on('click', '.link', function() { //al dar a una tarjeta  
        var formId = $(this).attr('data-id');
        $('#form' + formId).submit();
    });
});