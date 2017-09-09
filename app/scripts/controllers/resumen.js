'use strict';

angular
    .module('luna')
    .controller('resumenCtrl', ['$scope', '$rootScope', 'adalAuthenticationService', 'DTOptionsBuilder', 'DTColumnDefBuilder', resumenCtrl]);

function resumenCtrl($scope, $rootScope, adalService, DTOptionsBuilder, DTColumnDefBuilder) {
    var tokeninterval;
    var token = null;
    var vm = this;
    vm.tablero = "desconocido";
    vm.totalGral = 0;
    vm.filterApplied = false;

    vm.hasToken = true;
    vm.getToken = function () {
        token = adalService.acquireToken(adalService.config.resource).$$state.value;
        if (token) {
            clearInterval(tokeninterval);
            vm.tokenacquired = true;
            $scope.$parent.hasToken = true;
        }
    }

    if ($scope.$parent.userInfo) {
        if ($scope.$parent.userInfo.isAuthenticated) {
            token = adalService.acquireToken(adalService.config.resource).$$state.value;
            if (!token) {
                tokeninterval = setInterval(vm.getToken, 100);
            }
            else {
                vm.tokenacquired = true;
                $scope.$parent.hasToken = true;
            }
        }
    }

    vm.setFilter = function (statec, statusc) {
        if (statec == undefined)
            statec = null;

        if (statusc == undefined)
            statusc = null;

        vm.filterApplied = true;
        queryAllIncidents(null, token, statec, statusc);
    }

    var language = {
        "sProcessing": "Procesando...",
        "sLengthMenu": "Mostrar _MENU_ registros",
        "sZeroRecords": "No se encontraron resultados",
        "sEmptyTable": "Ningún dato disponible.",
        "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
        "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
        "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
        "sInfoPostFix": "",
        "sSearch": "Buscar:",
        "sUrl": "",
        "sInfoThousands": ",",
        "sLoadingRecords": "Cargando...",
        "oPaginate": {
            "sFirst": "Primero",
            "sLast": "Ultimo",
            "sNext": "Siguiente",
            "sPrevious": "Anterior"
        },
        "oAria": {
            "sSortAscending": ": Activar para ordenar la columna de manera ascendente",
            "sSortDescending": ": Activar para ordenar la columna de manera descendente"
        }
    }

    vm.dtOptions = DTOptionsBuilder.newOptions()
        .withDOM("<'row'<'col-sm-4'l><'col-sm-4 text-center'B><'col-sm-4'f>>tp")
        .withDisplayLength(4)
        .withLanguage(language)
        .withButtons([
            { extend: 'csv', title: 'casos_cpm', className: 'btn-sm' },
            { extend: 'pdf', title: 'casos_cpm', className: 'btn-sm' },
            //{ extend: 'print', className: 'btn-sm' }
        ]);

    vm.dtColumns = [
        DTColumnDefBuilder.newColumnDef(0).withTitle('Número de Caso'),
        DTColumnDefBuilder.newColumnDef(1).withTitle('Título').notSortable(),    //titulo .notVisible()
        DTColumnDefBuilder.newColumnDef(2).withTitle('Proyecto'),
        DTColumnDefBuilder.newColumnDef(3).withTitle('Estado')
    ];

    vm.incidentesActivos = 0;
    vm.incidentesResueltos = 0;
    vm.incidentesCancelados = 0;
    vm.incidentesAltaPrioridad = 0;
    vm.incidentesEnEspera = 0;
    vm.fecha = getTime();
    vm.incidentes = [];

    $scope.RetrieveIncidents = function () {
        vm.incidentesActivos = 0;
        vm.incidentesResueltos = 0;
        vm.incidentesCancelados = 0;
        vm.incidentesAltaPrioridad = 0;
        vm.incidentesEnEspera = 0;

        var token = adalService.acquireToken(adalService.config.resource).$$state.value;
        queryIncidents(null, token, 0, 'pnlActivos', function (request) {
            var row = JSON.parse(request.response).value[0];
            vm.incidentesActivos = row["recordcount"];

            $scope.$apply();
            angular.element('#pnlActivos').toggleClass('ld-loading');

            queryIncidentsByStatusCode(null, token, 717810003, 'pnlEnEspera', function (request) {
                var row = JSON.parse(request.response).value[0];
                vm.incidentesEnEspera = row["recordcount"];
    
                $scope.$apply();
                angular.element('#pnlEnEspera').toggleClass('ld-loading');
    
                queryServiceStatus();
            });
        });
        queryIncidents(null, token, 1, 'pnlResueltos', function (request) {
            var row = JSON.parse(request.response).value[0];
            vm.incidentesResueltos = row["recordcount"];

            $scope.$apply();
            angular.element('#pnlResueltos').toggleClass('ld-loading');
        });
        queryIncidents(null, token, 2, 'pnlCancelados', function (request) {
            var row = JSON.parse(request.response).value[0];
            vm.incidentesCancelados = row["recordcount"];

            $scope.$apply();
            angular.element('#pnlCancelados').toggleClass('ld-loading');
        });
        queryIncidentsByPriority(null, token, 0, 1, 'pnlAltaPrioridad', function (request) {
            var row = JSON.parse(request.response).value[0];
            vm.incidentesAltaPrioridad = row["recordcount"];

            $scope.$apply();
            angular.element('#pnlAltaPrioridad').toggleClass('ld-loading');
        });
        /*queryIncidentsByStatusCode(null, token, 717810003, 'pnlEnEspera', function (request) {
            var row = JSON.parse(request.response).value[0];
            vm.incidentesEnEspera = row["recordcount"];

            $scope.$apply();
            angular.element('#pnlEnEspera').toggleClass('ld-loading');

            queryServiceStatus();
        });*/
    }

    $scope.RetrieveIncidentsTable = function () {
        vm.filterApplied = false;
        var token = adalService.acquireToken(adalService.config.resource).$$state.value;
        queryAllIncidents(null, token, null, null);
    }

    function queryIncidents(error, token, estatus, spinner, callback) {
        angular.element('#' + spinner).toggleClass('ld-loading');

        var recorduri = "/incidents";
        var prefetch = "<fetch mapping='logical' distinct='false' aggregate='true' >" +
            "  <entity name='incident' >" +
            "    <attribute name='incidentid' alias='recordcount' aggregate='count' />" +
            "    <filter type='and' >" +
            "      <condition attribute='statecode' operator='eq' value='" + estatus + "' />" +
            "      <condition attribute='accountid' operator='eq' value='e01e3ac6-c910-e611-80ec-c4346bac59b8' />" +
            "    </filter>" +
            "  </entity>" +
            "</fetch>";
        var fetch = encodeURI(prefetch);
        var recordquery = recorduri + "?fetchXml=" + fetch;

        Sdk.request(token, "GET", recordquery, null, true, 5000).then(callback).catch(function (error) {
            console.log(error.message);
            angular.element('#' + spinner).toggleClass('ld-loading');
        });
    }

    function queryIncidentsByPriority(error, token, estatus, prioritycode, spinner, callback) {
        angular.element('#' + spinner).toggleClass('ld-loading');

        var recorduri = "/incidents";
        var prefetch = "<fetch mapping='logical' distinct='false' aggregate='true' >" +
            "  <entity name='incident' >" +
            "    <attribute name='incidentid' alias='recordcount' aggregate='count' />" +
            "    <filter type='and' >" +
            "      <condition attribute='statecode' operator='eq' value='" + estatus + "' />" +
            "      <condition attribute='prioritycode' operator='eq' value='" + prioritycode + "' />" +
            "      <condition attribute='accountid' operator='eq' value='e01e3ac6-c910-e611-80ec-c4346bac59b8' />" +
            "    </filter>" +
            "  </entity>" +
            "</fetch>";
        var fetch = encodeURI(prefetch);
        var recordquery = recorduri + "?fetchXml=" + fetch;

        Sdk.request(token, "GET", recordquery, null, true, 5000).then(callback).catch(function (error) {
            console.log(error.message);
            angular.element('#' + spinner).toggleClass('ld-loading');
        });
    }

    function queryIncidentsByStatusCode(error, token, statuscode, spinner, callback) {
        angular.element('#' + spinner).toggleClass('ld-loading');

        var recorduri = "/incidents";
        var prefetch = "<fetch mapping='logical' distinct='false' aggregate='true' >" +
            "  <entity name='incident' >" +
            "    <attribute name='incidentid' alias='recordcount' aggregate='count' />" +
            "    <filter type='and' >" +
            "      <condition attribute='statuscode' operator='eq' value='" + statuscode + "' />" +
            "      <condition attribute='accountid' operator='eq' value='e01e3ac6-c910-e611-80ec-c4346bac59b8' />" +
            "    </filter>" +
            "  </entity>" +
            "</fetch>";
        var fetch = encodeURI(prefetch);
        var recordquery = recorduri + "?fetchXml=" + fetch;

        Sdk.request(token, "GET", recordquery, null, true, 5000).then(callback).catch(function (error) {
            console.log(error.message);
            angular.element('#' + spinner).toggleClass('ld-loading');
        });
    }

    function queryAllIncidents(error, token, estatus, estatuscode) {
        angular.element('#historial').toggleClass('ld-loading');
        vm.incidentes = [];

        var recorduri = "/incidents";
        var prefetch = "<fetch>" +
            "  <entity name='incident' >" +
            "    <attribute name='incidentid' />" +
            "    <attribute name='ticketnumber' />" +
            "    <attribute name='title' />" +
            "    <attribute name='createdon' />" +
            "    <attribute name='statecode' />" +
            "    <attribute name='rs_proyectoid' />" +
            "    <filter type='and' >";

        if (estatus != undefined) {
            prefetch = prefetch + "<condition attribute='statecode' operator='eq' value='" + estatus + "' />";
        }
        if (estatuscode != undefined) {
            prefetch = prefetch + "<condition attribute='statuscode' operator='eq' value='" + estatuscode + "' />";
        }

        prefetch = prefetch + "<condition attribute='accountid' operator='eq' value='e01e3ac6-c910-e611-80ec-c4346bac59b8' />" +
            "    </filter>" +
            "    <order attribute='createdon' descending='true' />" +
            "  </entity>" +
            "</fetch>";
        var fetch = encodeURI(prefetch);
        var recordquery = recorduri + "?fetchXml=" + fetch;

        Sdk.request(token, "GET", recordquery, null, true, 5000).then(function (request) {
            var collection = JSON.parse(request.response).value;
            collection.forEach(function (row, i) {
                var oppobject = {};
                oppobject.incidentid = row["incidentid"];
                oppobject.ticketnumber = row["ticketnumber"];
                oppobject.title = row["title"];
                oppobject.createdon = row["createdon"];
                oppobject.statecode = row["statecode"];
                oppobject.project = row["_rs_proyectoid_value@OData.Community.Display.V1.FormattedValue"];

                vm.incidentes.push(oppobject);
            });

            $scope.$apply();
            angular.element('#historial').toggleClass('ld-loading');
        }).catch(function (error) {
            console.log(error.message);
            angular.element('#historial').toggleClass('ld-loading');
        });
    }

    function queryServiceStatus() {
        angular.element('#pnlEstatus').toggleClass('ld-loading');
        if (vm.incidentesActivos !== 0 && vm.incidentesEnEspera != 0) {
            //var enprogreso = vm.incidentesActivos - vm.incidentesEnEspera;
            var enprogreso = vm.incidentesEnEspera;
            var porcentaje = (enprogreso * 100) / vm.incidentesActivos;
            if (porcentaje >= 0 && porcentaje <= 30) {
                vm.tablero = "rojo";
            } else if (porcentaje >= 30 && porcentaje <= 60) {
                vm.tablero = "amarillo";
            } else {
                vm.tablero = "verde";
            }
        }

        angular.element('#pnlEstatus').toggleClass('ld-loading');
        if (!$scope.$$phase) {
            $scope.$apply();
        }       
    }

    function getDate() {
        var today = new Date();
        var dd = today.getDate();
        var mm = today.getMonth() + 1;
        var yyyy = today.getFullYear();

        if (dd < 10) {
            dd = '0' + dd
        }

        if (mm < 10) {
            mm = '0' + mm
        }

        today = mm + '/' + dd + '/' + yyyy;
        return today;
    }

    function getTime() {
        var today = new Date();
        var hh = today.getHours();
        var mn = today.getMinutes();

        if (hh < 10) {
            hh = '0' + hh
        }

        if (mn < 10) {
            mn = '0' + mn
        }

        today = hh + ':' + mn;
        return today;
    }
}