(function(angular) {
    'use strict';

    angular
        .module('sly.validators')
        .directive('arrayMinLength', arrayMinLength);

    function arrayMinLength() {
        return {
            require: 'ngModel',
            link: function(scope, $elem, attrs, ngModel) {
                ngModel.$validators.arrayMinLength = arrayMinLengthValidator;

                function arrayMinLengthValidator(modelValue, viewValue) {
                    var isValid = modelValue && modelValue.length >= attrs.arrayMinLength;
                    return !!isValid;
                }
            }
        }
    }
})(window.angular);
