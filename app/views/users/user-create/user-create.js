(function(angular) {
    'use strict';

    angular.module('sly.views.users.userCreate', [
        'ngRoute',
        'ui.slider',
        'ui.bootstrap.showErrors',
        'ngMessages',
        'pascalprecht.translate',
        'sly.libraries',
        'sly.validators',
    ])
        .controller('UserCreateCtrl', UserCreateCtrl);

    UserCreateCtrl.$inject = ['$scope', '$routeParams', '$translate', '$log', '$anchorScroll', 'userService', 'navigationService', 'MODEL_OPTIONS'];

    function UserCreateCtrl($scope, $routeParams, $translate, $log, $anchorScroll, userService, navigationService, MODEL_OPTIONS) {
        var userCreateCtrl = this;

        userCreateCtrl.user = null;
        
        userCreateCtrl.submitUserCreate = submitUserCreate;

        userCreateCtrl.loading = true;

        userCreateCtrl.modelOptions = MODEL_OPTIONS;

        activate();

        function activate() {

        }

        function submitUserCreate(userForm) {

            userCreateCtrl.errors = null;

            $scope.$broadcast('show-errors-check-validity');

            if(!userForm.$valid) {
                $anchorScroll('user-form');
                return;
            }

            userCreateCtrl.user.userType = userForm.userType.$modelValue;
            
                userService.createUser(angular.toJson(userCreateCtrl.user))
                    .then(successHandler, errorHandler);

            function successHandler() {
                var successMessage = {
                    icon: 'fa-check-circle',
                    keys: ['USER_SAVED_SUCCESSFULLY']
                };

                successMessage.keys = ['USER_CREATED_SUCCESSFULLY'];

                navigationService.goTo('users', {}, [successMessage]);
            }

            function errorHandler(error) {
                $log.error(error);
                var errorMessage = {
                    'icon': 'fa-times-circle',
                    'keys': [
                        'FAILED_TO_CREATE_USER',
                        error
                    ]
                };

                userCreateCtrl.errors = [errorMessage];
                $anchorScroll('user-form');
            }
        }
    }

})(window.angular);