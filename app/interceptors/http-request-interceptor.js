(function(angular) {

    'use strict';

    angular
        .module('sly.interceptors')
        .config(HttpRequestInterceptorSetup);

    HttpRequestInterceptorSetup.$inject = ['$provide', '$httpProvider'];

    function HttpRequestInterceptorSetup($provide, $httpProvider) {
        $provide.factory('httpRequestInterceptor', HttpRequestInterceptor);
        $httpProvider.interceptors.push('httpRequestInterceptor');
    }

    HttpRequestInterceptor.$inject = ['$q', 'sessionService', 'navigationService', '$window', '$log'];

    function HttpRequestInterceptor($q, sessionService, navigationService, $window, $log) {

        var httpRequestInterceptor = {
            request: request
        };

        return httpRequestInterceptor;

        function request(request) {

            $log.info(request);

            return $q.resolve(request);
        }

    }

})(window.angular);