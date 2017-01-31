/**
 * Created by steve on 6/6/16.
 */

(function(angular) {

    'use strict';

    var REST_HOST   = window.location.host.replace(/:[0-9]+$/, '');
    var REST_SSL    = window.location.protocol == 'https:';
    var REST_PORT   = window.location.port;
    var REST_SCHEME = REST_SSL ? 'https' : 'http';

    var angular_modules = [
        'ngRoute',
        'ngAnimate',
        'angular-storage',
        'ui.bootstrap',
        'ui.bootstrap.showErrors',
        'ui.grid',
        'ui.slider',
        'sly.libraries',
        'sly.interceptors',
        'sly.validators',
        'sly.services',
        'sly.services.session',
        'sly.services.navigation',
        'sly.services.user',
        'sly.service.base64',
        'sly.views',
        'sly.views.users',
        'sly.views.users.userCreate',
        'sly.views.users.userEdit',
        'sly.views.dashboard',
        'sly.views.loginPage',
        'sly.views.logoutPage',
        'sly.directives.topBar',
        'sly.directives.errorMessage',
        'sly.directives.userTypes',
        'sly.modals',
        'sly.modals.removeUser',
    ];

    angular.module('sly', angular_modules)
        .constant('REST_URL', REST_SCHEME + '://' + REST_HOST + ':' + REST_PORT + '/rest')
        .constant('MODEL_OPTIONS', {
            updateOn: 'default blur',
            debounce: { 'default': 250, 'blur': 0 }
        })
        .config(AppConfig)
        .run(Main);

    AppConfig.$inject = ['$translateProvider', 'storeProvider'];

    function AppConfig($translateProvider, storeProvider) {
        storeProvider.setStore('sessionStorage');

        $translateProvider.useStaticFilesLoader({
            prefix: 'languages/',
            suffix: '.json'
        });

        $translateProvider.preferredLanguage('enUS');

        $translateProvider.useSanitizeValueStrategy(null);

    }

    Main.$inject = ['$rootScope', '$log', '$location', '$route', '$http', 'sessionService', 'navigationService', 'userService'];

    function Main($rootScope, $log, $location, $route, $http, sessionService, navigationService, userService) {
        
        $rootScope.$on('$locationChangeStart', locationChangeStart);

        function locationChangeStart(event, next, current) {

            if( !sessionService.exists() ) {

                $http({method: 'GET', url: ''})
                    .success(function (data, status, headers, config) {

                        var authToken = headers()['AuthToken'] || headers()['authtoken'] || headers()['AUTHTOKEN'];

                        //$log.info(authToken)

                        if (authToken !== undefined) {
                            userService.authenticate(authToken).then(
                                function() {
                                    $route.reload();
                                },
                                function() {
                                    checkSessionAndRedirect();
                                }
                            );
                        }
                        else {
                            checkSessionAndRedirect();
                        }

                    })
                    .error(function() {
                        checkSessionAndRedirect();
                    });

            }
            else {
                checkSessionAndRedirect();
            }
        }

        function checkSessionAndRedirect() {
            // redirect to login page if not logged in and trying to access a restricted page
            var restrictedPage = $location.path() != '/login-page';
            var loggedIn = sessionService.exists();

            if (restrictedPage && !loggedIn) {
                    navigationService.goTo('login');
            }
            else if (!restrictedPage && loggedIn) {
                navigationService.goTo('dashboard');
            }


        }
    }

    angular.element(document).ready(function () {

        window.name = "";

        angular.bootstrap(document, ['sly'], {
            strictDi: true
        });

    });
    
})(window.angular);    