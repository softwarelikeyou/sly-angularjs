(function(angular) {
    'use strict';

    angular.module('sly.views.users.userEdit', [
        'ngRoute',
        'ui.slider',
        'ui.bootstrap.showErrors',
        'ngMessages',
        'pascalprecht.translate',
        'sly.libraries',
        'sly.validators',
    ])
    .controller('UserEditCtrl', UserEditCtrl);

    UserEditCtrl.$inject = ['$scope', '$routeParams', '$translate', '$log', '$anchorScroll', 'userService', 'navigationService', 'MODEL_OPTIONS'];

    function UserEditCtrl($scope, $routeParams, $translate, $log, $anchorScroll, userService, navigationService, MODEL_OPTIONS) {
        var userEditCtrl = this;

        userEditCtrl.user = null;

        userEditCtrl.editMode = $routeParams.id != null;
        
        userEditCtrl.submitUserEdit = submitUserEdit;

        userEditCtrl.loading = true;

        userEditCtrl.modelOptions = MODEL_OPTIONS;
        
        activate();

        function activate() {
            if (userEditCtrl.editMode) {

                userService.getUserDataById($routeParams.id).then(function(user) {
                    userEditCtrl.user = user;
                })
            }

        }

        function submitUserEdit(userForm) {

            userEditCtrl.errors = null;

            $scope.$broadcast('show-errors-check-validity');

            if(!userForm.$valid) {
                $anchorScroll('user-form');
                return;
            }

            userEditCtrl.user.userType = userForm.userType.$modelValue;
            
            userService.saveUser(userEditCtrl.user)
                .then(successHandler, errorHandler);

            function successHandler() {
                var successMessage = {
                    icon: 'fa-check-circle',
                    keys: ['USER_SAVED_SUCCESSFULLY']
                }

                navigationService.goTo('users', {}, [successMessage]);
            }

            function errorHandler(error) {
                $log.error(error);
                var errorMessage = {
                    'icon': 'fa-times-circle',
                    'keys': [
                        'FAILED_TO_UPDATE_USER',
                        error
                    ]
                };

                userEditCtrl.errors = [errorMessage];
                $anchorScroll('user-form');
            }
        }
    }

})(window.angular);
