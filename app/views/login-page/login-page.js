(function(angular) {
    'use strict';

    angular.module('sly.views.loginPage', ['pascalprecht.translate', 'ui.bootstrap', 'ui.grid'])
    .controller('LoginPageCtrl', LoginPageCtrl);

    LoginPageCtrl.$inject = ['navigationService', 'userService'];

    function LoginPageCtrl(navigationService, userService) {

        var loginPageCtrl = this;

        loginPageCtrl.credentials = { username: '', password: '' };
        loginPageCtrl.login = login;

        function login(credentials) {
            userService.login(credentials).then(loginSuccessHandler, loginFailureHandler);
        }

        function loginSuccessHandler() {
            navigationService.goTo('dashboard');
        }

        function loginFailureHandler() {
            loginPageCtrl.loginFailed = true;
        }

    }

})(window.angular);
