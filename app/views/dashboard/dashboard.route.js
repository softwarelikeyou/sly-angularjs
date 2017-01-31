(function(angular) {
    'use strict';

    angular
        .module('sly.views.dashboard')
        .config(routeConfig);

    routeConfig.$inject = ['$routeProvider'];

    function routeConfig($routeProvider) {
        $routeProvider.when('/dashboard', {
            templateUrl: 'views/dashboard/dashboard.html',
            controller: 'DashboardCtrl',
            controllerAs: 'dashboardCtrl'
        });
    }
})(window.angular);
