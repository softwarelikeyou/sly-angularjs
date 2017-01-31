(function(angular) {
    'use strict';

    angular
        .module('sly.views.users.userEdit')
        .config(routeConfig)

    routeConfig.$inject = ['$routeProvider'];

    function routeConfig($routeProvider) {
        $routeProvider.when('/user-edit/:id?', {
            scope: {
                messages: '=messages'
            },
            bindToController: true,
            templateUrl: 'views/users/user-edit/user-edit.html',
            controller: 'UserEditCtrl',
            controllerAs: 'userEditCtrl'
        });
    }
})(window.angular);