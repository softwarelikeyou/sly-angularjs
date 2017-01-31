(function(angular) {
    'use strict';

    angular
        .module('sly.validators')
        .directive('resolvedUsername', resolvedUsername);

    resolvedUsername.$inject = ['$q', '$log', 'userService'];

    function resolvedUsername($q, $log, userService) {
        return {
            require: 'ngModel',
            scope: true,
            link: function(scope, $elem, attrs, ngModel) {

                if( scope.userEditCtrl.editMode ) return true;

                ngModel.$asyncValidators.resolvedUsername = function(modelValue) {

                    return userService.resolveUsername(modelValue).then(
                        function() {
                            return true;
                        },
                        function() {
                            return $q.reject();
                        }
                    )

                }

            }
        }
    };
})(window.angular);
