(function(angular) {
    'use strict';

    angular
        .module('sly.views.users')
        .config(routeConfig);

    routeConfig.$inject = ['$routeProvider'];

    function routeConfig($routeProvider) {
        $routeProvider.when('/users', {
            templateUrl: 'views/users/users.html',
            scope: {
                messages: '=messages'
            },
            bindToController: true,
            controller: 'UsersCtrl',
            controllerAs: 'usersCtrl'
        });
    }
})(window.angular);