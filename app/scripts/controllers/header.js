angular
.module('luna')
.controller('headerCtrl', ['$scope', '$rootScope', 'adalAuthenticationService',
    function ($scope, $rootScope, adalService) {
        var vm = this;
        var tokeninterval;

        $scope.login = function () {
            adalService.login();
        };
        $scope.logout = function () {
            adalService.logOut();
        };

        vm.hasToken = true;
        vm.getToken = function(){
            token = adalService.acquireToken(adalService.config.resource).$$state.value;
            if(token){
                clearInterval(tokeninterval);
                vm.tokenacquired = true;
                $scope.$parent.hasToken = true;
            }
        }

        if($scope.$parent.userInfo){
            if($scope.$parent.userInfo.isAuthenticated){
                token = adalService.acquireToken(adalService.config.resource).$$state.value;
                if(!token){
                    tokeninterval = setInterval(vm.getToken, 100);
                }
                else{
                    vm.tokenacquired = true;
                    $scope.$parent.hasToken = true;
                }
            }
        }

    }
]);