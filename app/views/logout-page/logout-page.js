(function(angular) {
    'use strict';

    angular.module('sly.views.logoutPage', [])
    .controller('LogoutPageCtrl', LogoutPageCtrl);

    LogoutPageCtrl.$inject = ['userService'];

    function LogoutPageCtrl(userService) {
        userService.logout();
    }

})(window.angular);