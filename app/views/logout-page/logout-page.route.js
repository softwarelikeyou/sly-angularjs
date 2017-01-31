(function(angular) {
    'use strict';

    angular
        .module('sly.views.logoutPage')
        .config(routeConfig);

    routeConfig.$inject = ['$routeProvider'];

    function routeConfig($routeProvider) {
        $routeProvider.when('/logout-page', {
            templateUrl: 'views/logout-page/logout-page.html',
            controller: 'LogoutPageCtrl',
            controllerAs: 'logoutPageCtrl'
        });
    }
})(window.angular);