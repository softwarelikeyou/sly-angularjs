(function(angular) {
    'use strict';

    angular.module('sly.directives.userTypes', ['pascalprecht.translate'])
    .directive('userTypes', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/user-types/user-types.html',
            require: 'ngModel',
            scope: {
                userType: '=userType',
                form: '='
            },
            controller: UserTypesCtrl,
            controllerAs: 'userTypesCtrl',
            bindToController: true
        }
    });

    UserTypesCtrl.$inject = ['USER_ROLES'];

    function UserTypesCtrl(USER_ROLES) {

        var userTypeCtrl = this;
        
        activate();

        function activate() {
            userTypeCtrl.userTypes = USER_ROLES;
        }

    }

})(window.angular);
