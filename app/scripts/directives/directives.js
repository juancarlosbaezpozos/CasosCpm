
angular
    .module('luna')
    .directive('pageTitle', pageTitle)
    .directive('spinnerLdr', spinnerLdr)
    .directive('fixedWidth', fixedWidth)
    .directive('minimalizaMenu', minimalizaMenu)
    .directive('sparkline', sparkline)
    .directive('filterTools', filterTools)
    .directive('panelTools', panelTools);

function pageTitle($rootScope, $timeout) {
    return {
        link: function (scope, element) {
            var listener = function (event, toState, toParams, fromState, fromParams) {
                // Default title
                var title = 'Caja Popular Mexicana';
                // Create your own title pattern
                if (toState.data && toState.data.pageTitle) title = 'CPM | ' + toState.data.pageTitle;
                $timeout(function () {
                    element.text(title);
                });
            };
            $rootScope.$on('$stateChangeStart', listener);
        }
    };
}

function spinnerLdr($rootScope) {
    return {
        restrict: 'A',
        scope: true,
        template: '<div class="loader"><div class="loader-spin"></div></div>',
        link: function (scope, element, attrs) {
            var hpanel = $element.closest('div.panel-body');
            hpanel.toggleClass('ld-loading');
        }
    };
}

function fixedWidth() {
    return {
        restrict: 'A',
        scope: {
            'fixedWidth': "@"
        },
        link: function (scope, element, attr) {
            if (!isNaN(scope.fixedWidth)) {
                var widthPx = scope.fixedWidth + 'px';
                element.css('width', widthPx);
            }
        }
    };
}

function minimalizaMenu($rootScope) {
    return {
        restrict: 'EA',
        template: '<div class="left-nav-toggle"><a href ng-click="minimalize()"><i class="stroke-hamburgermenu"></i> </a>',
        controller: function ($scope, $element) {

            $scope.minimalize = function () {
                $("body").toggleClass("nav-toggle");
            }
        }
    };
}

function sparkline() {
    return {
        restrict: 'A',
        scope: {
            sparkData: '=',
            sparkOptions: '=',
        },
        link: function (scope, element, attrs) {
            scope.$watch(scope.sparkData, function () {
                render();
            });
            scope.$watch(scope.sparkOptions, function () {
                render();
            });
            var render = function () {
                $(element).sparkline(scope.sparkData, scope.sparkOptions);
            };
        }
    };
}

function panelTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/panel_tools.html',
        controller: function ($scope, $element) {
            $scope.showhide = function () {
                var hpanel = $element.closest('div.panel');
                var icon = $element.find('i:first');
                var body = hpanel.find('div.panel-body');
                var footer = hpanel.find('div.panel-footer');
                body.slideToggle(300);
                footer.slideToggle(200);

                icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                hpanel.toggleClass('').toggleClass('panel-collapse');
                $timeout(function () {
                    hpanel.resize();
                    hpanel.find('[id^=map-]').resize();
                }, 50);
            };

            $scope.closebox = function () {
                alert("no se permite cerrar este panel.");
                /*var hpanel = $element.closest('div.panel');
                hpanel.remove();*/
            }
        }
    };
};

function filterTools($timeout) {
    return {
        restrict: 'A',
        scope: true,
        templateUrl: 'views/common/filter_tools.html',
        controller: function ($scope, $element) {
            $scope.showhide = function () {
                var hpanel = $element.closest('div.panel');
                hpanel.toggleClass('glow')
                var icon = $element.find('i:first');

                /*var body = hpanel.find('div.panel-body');
                 var footer = hpanel.find('div.panel-footer');
                 body.slideToggle(300);
                 footer.slideToggle(200);
 
                 icon.toggleClass('fa-chevron-up').toggleClass('fa-chevron-down');
                 hpanel.toggleClass('').toggleClass('panel-collapse');
                 $timeout(function () {
                     hpanel.resize();
                     hpanel.find('[id^=map-]').resize();
                 }, 50);*/
            };

        }
    };
};
