$(document).ready(function () {
    $('#tblCasos').dataTable({
        "language": {
            "paginate": {
                "first": "Primera",
                "last": "Ultima",
                "next": "Siguiente",
                "previous": "Anterior"
            },
            "emptyTable": "Sin datos disponibles en la tabla",
            "info": "Mostrando pag _PAGE_ de _PAGES_",
            "infoEmpty": "Sin registros que mostrar",
            "infoFiltered": " - filtrados de _MAX_ registros",
            "search": "Buscar:",
            "lengthMenu": "Desplegar _MENU_ registros",
            "loadingRecords": "Por favor espere - cargando...",
            "processing": "Procesando...",
            "zeroRecords": "Sin registros que mostrar"
        }
    });
});