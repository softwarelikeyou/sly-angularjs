(function(angular) {
    'use strict';

    angular
        .module('sly.views.users.userCreate')
        .config(routeConfig)

    routeConfig.$inject = ['$routeProvider'];

    function routeConfig($routeProvider) {
        $routeProvider.when('/user-create', {
            scope: {
                messages: '=messages'
            },
            bindToController: true,
            templateUrl: 'views/users/user-edit/user-create.html',
            controller: 'UserCreateCtrl',
            controllerAs: 'userCreateCtrl'
        });
    }
})(window.angular);