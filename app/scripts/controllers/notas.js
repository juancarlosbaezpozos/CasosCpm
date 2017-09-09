angular
    .module('luna')
    .controller('notasCtrl', ['$scope', '$rootScope', '$stateParams', 'adalAuthenticationService',
        function ($scope, $rootScope, $stateParams, adalService) {
            var tokeninterval;
            var token = null;
            var vm = this;

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

            $scope.RetrieveNotes = function () {
                vm.description = "";

                var token = adalService.acquireToken(adalService.config.resource).$$state.value;
                queryNotes(null, token);
            }

            function queryNotes(error, token) {
                var recorduri = "/activitypointers";
                var prefetch = "<fetch>" +
                    "  <entity name='activitypointer' >" +
                    "    <attribute name='activityid' />" +
                    "    <attribute name='subject' />" +
                    "    <attribute name='description' />" +
                    "    <filter type='and' >" +
                    "      <condition attribute='activityid' operator='eq' value='" + $stateParams.notaId + "' />" +
                    "    </filter>" +
                    "  </entity>" +
                    "</fetch>";
                var fetch = encodeURI(prefetch);
                var recordquery = recorduri + "?fetchXml=" + fetch;

                Sdk.request(token, "GET", recordquery, null, true, 5000).then(function (request) {
                    var row = JSON.parse(request.response).value[0];
                    if (row !== undefined) {
                        vm.subject = row["subject"];
                        vm.description = strip(row["description"]);
                    } else {
                        vm.subject="";
                        vm.description="sin notas que mostrar.";
                    }

                    $scope.$apply();
                }).catch(function (error) {
                    console.log(error.message);
                });
            }

            function strip(html) {
                var tmp = document.createElement("DIV");
                tmp.innerHTML = html;
                return tmp.textContent || tmp.innerText;
            }

        }]);