(function(angular) {
    'use strict';

    angular
        .module('sly.validators')
        .directive('passwordCheck', passwordCheck);

    function passwordCheck() {
        return {
            require: 'ngModel',
            scope: {
                reference: '=passwordCheck',
                form: '='
            },
            link: function(scope, $elem, attrs, ngModel) {

                ngModel.$validators.passwordMatch = function(modelValue, viewValue) {
                    var isValid = modelValue === scope.reference;
                    return isValid;
                }

                scope.$watch('reference', function(value) {
                    var isValid = value === ngModel.$viewValue;
                    ngModel.$setValidity('passwordMatch', isValid);
                });
            }
        }
    };
})(window.angular);