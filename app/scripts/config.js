angular
    .module('luna')
    .config([
        '$stateProvider', '$urlRouterProvider', '$locationProvider', '$compileProvider', '$httpProvider', 'adalAuthenticationServiceProvider',
        function ($stateProvider, $urlRouterProvider, $locationProvider, $compileProvider, $httpProvider, adalProvider) {
            $locationProvider.hashPrefix('');

            // Optimize load start with remove binding information inside the DOM element
            $compileProvider.debugInfoEnabled(true);

            // Set default state
            $urlRouterProvider.otherwise("/main");  // /dashboard
            $stateProvider
                .state('main', {
                    abstract: true,
                    url: "/main",
                    templateUrl: "views/common/content.html",
                    requireADLogin: true
                })
                .state('main.resumen', {
                    url: "/resumen",
                    templateUrl: "views/resumen.html",
                    data: {
                        pageTitle: 'Resumén'
                    },
                    requireADLogin: true
                })
                .state('main.detalle',{
                    url:"/detalle/:incidenteId",
                    templateUrl:'views/detalle.html',
                    data: {
                        pageTitle: 'Detalle'
                    },
                    requireADLogin: true,
                    controller: "resumenDetalleCtrl",
                    controllerAs: 'vm'
                })
                .state('main.detalle.nota',{
                    url:"/nota/:notaId",
                    templateUrl:'views/notas.html',
                    data: {
                        pageTitle: 'Detalle'
                    },
                    requireADLogin: true,
                    controller: "notasCtrl",
                    controllerAs: 'vm'
                })

                /*$httpProvider.interceptors.push('myHttpInterceptor');
                var spinnerFunction = function (data, headersGetter) {
                    console.log('start spinner 1');
                    $('#mydiv').show();
                    return data;
                };
                $httpProvider.defaults.transformRequest.push(spinnerFunction);*/

                $httpProvider.interceptors.push(function () {
                    return {
                        request: function (config) {
                            if (config.url.indexOf('.html') > -1) {
                                config.url += '?_v=' + (new Date()).getTime();
                            }
                            return config;
                        }
                    };
                });

                var endpoints = {
                    "https://rhino0.api.crm.dynamics.com/api/data/v8.1/": "908f99f7-4871-4d14-9fab-6804114479c7",
                };
                adalProvider.init({
                    tenant: 'rhinosystems.mx',
                    clientId: '66ae54ac-ccd5-481b-94bb-f02e14e531dd',
                    resource: 'https://rhino0.crm.dynamics.com',
                    redirectUri: 'http://13.65.92.26:9000',
                    postLogoutRedirectUri: 'http://13.65.92.26:9000',
                    extraQueryParameter: 'nux=1',
                    endpoints: endpoints,
                    cacheLocation: 'localStorage'
                }, $httpProvider);

        }
    ])
    /*.factory('myHttpInterceptor', function ($q, $window) {
        return function (promise) {
            return promise.then(function (response) {
                console.log('stop spinner 1');
                $('#mydiv').hide();
                return response;

            }, function (response) {
                console.log('stop spinner 2');
                $('#mydiv').hide();
                return $q.reject(response);
            });
        };
    })*/
    .run(function ($rootScope, $state) {
        $rootScope.$state = $state;
    });