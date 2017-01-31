(function(angular) {
    'use strict';

    angular.module('sly.directives.topBar', ['pascalprecht.translate', 'ui.bootstrap'])
    .directive('topBar', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/top-bar/top-bar.html',
            controller: TopBarCtrl,
            controllerAs: 'topBarCtrl'
        }
    });

    TopBarCtrl.$inject = ['userService', 'sessionService'];

    function TopBarCtrl(userService, sessionService) {

        var topBarCtrl = this;

        var username = null;

        if( sessionService.exists() ) {
            username = sessionService.get().username;
        }

        topBarCtrl.translationData = {
            user: username
        };

        topBarCtrl.logOut = function() {
            userService.logout();
        }

    }
    
})(window.angular);