(function(angular) {
    'use strict';

    angular
        .module('sly.validators')
        .directive('validPassword', validPassword);

    validPassword.$inject = ['$q'];

    function validPassword($q) {
        return {
            require: 'ngModel',
            scope: {},
            link: function(scope, $elem, attrs, ngModel) {
                
                ngModel.$asyncValidators.validPassword = function(modelValue) {

                    if( !modelValue )
                        return $q.reject(false);

                    if( modelValue.length < 8 )
                        return $q.reject(false);

                    return $q.resolve(true);
                }
            }
        }
    };
})(window.angular);
