angular
    .module('luna')
    .controller('resumenDetalleCtrl', ['$scope', '$rootScope', '$stateParams', 'adalAuthenticationService',
        function ($scope, $rootScope, $stateParams, adalService) {
            var tokeninterval;
            var token = null;
            var vm = this;
            vm.activities = [];

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

            $scope.RetrieveDetails = function () {
                var token = adalService.acquireToken(adalService.config.resource).$$state.value;
                queryIncidentById(null, token);
                queryIncidentHistory(null, token);
                queryResolution(null,token);
            }

            function queryIncidentById(error, token) {
                var recorduri = "/incidents";
                var prefetch = "<fetch top='1' >" +
                    "  <entity name='incident' >" +
                    "    <attribute name='incidentid' />" +
                    "    <attribute name='ticketnumber' />" +
                    "    <attribute name='statuscode' />" +
                    "    <attribute name='caseorigincode' />" +
                    "    <attribute name='title' />" +
                    "    <attribute name='createdon' />" +
                    "    <attribute name='modifiedon' />" +
                    "    <attribute name='description' />" +
                    "    <attribute name='createdby' />" +
                    "    <attribute name='prioritycode' />" +
                    "    <attribute name='rs_nivelesdeatencion' />" +
                    "    <attribute name='rs_lugar' />" +
                    "    <filter type='and' >" +
                    "      <condition attribute='incidentid' operator='eq' value='" + $stateParams.incidenteId + "' />" +
                    "    </filter>" +
                    "    <link-entity name='owner' from='ownerid' to='ownerid' >" +
                    "      <attribute name='name' />" +
                    "    </link-entity>" +
                    "  </entity>" +
                    "</fetch>";
                var fetch = encodeURI(prefetch);
                var recordquery = recorduri + "?fetchXml=" + fetch;

                Sdk.request(token, "GET", recordquery, null, true, 5000).then(function (request) {
                    //console.log(request.response);
                    var row = JSON.parse(request.response).value[0];
                    vm.ticketnumber = row["ticketnumber"];
                    vm.title = row["title"];
                    vm.createdon = row["createdon"];
                    vm.modifiedon = row["modifiedon"];
                    vm.prioritycode = row["prioritycode@OData.Community.Display.V1.FormattedValue"];
                    vm.statuscode = row["statuscode@OData.Community.Display.V1.FormattedValue"];
                    vm.owner = row["_createdby_value@OData.Community.Display.V1.FormattedValue"];
                    vm.caseorigincode = row["caseorigincode@OData.Community.Display.V1.FormattedValue"];
                    vm.nivelatencion = row["rs_nivelesdeatencion@OData.Community.Display.V1.FormattedValue"];
                    vm.lugar = row["rs_lugar@OData.Community.Display.V1.FormattedValue"];
                    vm.description = row["description"];

                    $scope.$apply();
                }).catch(function (error) {
                    console.log(error.message);
                });
            }

            function queryIncidentHistory(error, token) {
                var recorduri = "/activitypointers";
                var prefetch = "<fetch>" +
                    "  <entity name='activitypointer' >" +
                    "    <attribute name='createdon' />" +
                    "    <attribute name='subject' />" +
                    "    <attribute name='activityid' />" +
                    "    <attribute name='activitytypecode' />" +
                    "    <filter type='and' >" +
                    "      <condition attribute='regardingobjectid' operator='eq' value='" + $stateParams.incidenteId + "' />" +
                    "    </filter>" +
                    "    <order attribute='createdon' />" +
                    "  </entity>" +
                    "</fetch>";
                var fetch = encodeURI(prefetch);
                var recordquery = recorduri + "?fetchXml=" + fetch;

                Sdk.request(token, "GET", recordquery, null, true, 5000).then(function (request) {
                    var collection = JSON.parse(request.response).value;
                    collection.forEach(function (row, i) {
                        var oppobject = {};
                        oppobject.activityid=row["activityid"];
                        oppobject.createdon = row["createdon"];
                        oppobject.subject = row["subject"];
                        oppobject.activitytypecode = row["activitytypecode@OData.Community.Display.V1.FormattedValue"];

                        vm.activities.push(oppobject);
                    });

                    $scope.$apply();
                }).catch(function (error) {
                    console.log(error.message);
                });
            }

            function queryResolution(error, token) {
                var recorduri = "/incidentresolutions";
                var prefetch = "<fetch top='1' >" +
                    "  <entity name='incidentresolution' >" +
                    "    <attribute name='incidentid' />" +
                    "    <attribute name='description' />" +
                    "    <attribute name='subject' />" +
                    "    <filter type='and' >" +
                    "      <condition attribute='incidentid' operator='eq' value='" + $stateParams.incidenteId + "' />" +
                    "    </filter>" +
                    "  </entity>" +
                    "</fetch>";
                var fetch = encodeURI(prefetch);
                var recordquery = recorduri + "?fetchXml=" + fetch;

                Sdk.request(token, "GET", recordquery, null, true, 5000).then(function (request) {
                    var row = JSON.parse(request.response).value[0];
                    if(row !==undefined){
                        vm.resolutionsubject = row["subject"];
                        vm.resolutiondescription = row["description"];
                    }else{
                        vm.resolutionsubject = "no determinada";
                        vm.resolutiondescription = "no se encontró detalle sobre la solución";
                    }                   

                    $scope.$apply();
                }).catch(function (error) {
                    console.log(error.message);
                });
            }

        }]);