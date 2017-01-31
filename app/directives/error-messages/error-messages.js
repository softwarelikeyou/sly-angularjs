(function(angular) {
    'use strict';

    angular.module('sly.directives.errorMessage', ['pascalprecht.translate', 'ui.bootstrap'])
    .directive('slyErrorMessages', function () {
        return {
            restrict: 'E',
            replace: true,
            transclude: true,
            scope: {
                errorMessages: '=errorMessages'
            },
            bindToController: true,
            templateUrl: 'directives/error-messages/error-messages.html',
            controller: ErrorMessagesCtrl,
            controllerAs: 'errorMessagesCtrl'
        }
    });

    ErrorMessagesCtrl.$inject = [];

    function ErrorMessagesCtrl() {
        var errorMessagesCtrl = this;
        
    }

})(window.angular);
