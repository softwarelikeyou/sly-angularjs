(function(angular) {
    'use strict';

    angular
        .module('sly.views.loginPage')
        .config(routeConfig);

    routeConfig.$inject = ['$routeProvider'];

    function routeConfig($routeProvider) {
        $routeProvider.when('/login-page', {
            templateUrl: 'views/login-page/login-page.html',
            controller: 'LoginPageCtrl',
            controllerAs: 'loginPageCtrl'
        });
    }
})(window.angular);
