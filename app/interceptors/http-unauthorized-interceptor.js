(function(angular) {

    'use strict';

    angular
        .module('sly.interceptors')
        .config(HttpUnauthorizedInterceptorSetup);

    HttpUnauthorizedInterceptorSetup.$inject = ['$provide', '$httpProvider'];

    function HttpUnauthorizedInterceptorSetup($provide, $httpProvider) {
        $provide.factory('httpUnauthorizedInterceptor', HttpUnauthorizedInterceptor);
        $httpProvider.interceptors.push('httpUnauthorizedInterceptor');
    }

    HttpUnauthorizedInterceptor.$inject = ['$q', 'sessionService', 'navigationService', '$window'];

    function HttpUnauthorizedInterceptor($q, sessionService, navigationService, $window) {

        var httpUnauthorizedInterceptor = {
            responseError: responseError
        };

        return httpUnauthorizedInterceptor;

        function responseError(response) {

            var status = response.status;

            if (status == 401) {

                sessionService.destroy();

                navigationService.goTo('login');

                return $q.resolve();
            }

            // otherwise
            return $q.reject(response);
        }

    }

})(window.angular);