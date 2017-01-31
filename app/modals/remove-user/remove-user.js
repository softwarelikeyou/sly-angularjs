(function(angular) {

    'use strict';

    angular.module('sly.modals.removeUser', ['pascalprecht.translate', 'ui.bootstrap'])
    .controller('RemoveUserCtrl', RemoveUserCtrl);

    RemoveUserCtrl.$inject = ['$uibModalInstance', '$log', 'userService', 'user'];

    function RemoveUserCtrl($uibModalInstance, $log, userService, user) {

        var removeUserCtrl = this;
        
        removeUserCtrl.onClickOkButton = onClickOkButton;

        activate();

        function activate() {

            removeUserCtrl.user = user;

            if( removeUserCtrl.user == null ) {
                $uibModalInstance.dismiss();
            }
        }
        
        function onClickOkButton() {

            $log.info(user.username);
            
            userService.deleteUser(user.userId).then(
                function() {
                    return $uibModalInstance.close();
                },
                function(error) {
                    removeUserCtrl.errors = [{
                        icon: 'fa-times-circle',
                        keys: ['COULD_NOT_REMOVE_USER', error]
                    }];
                }
            );
        }
    }
})(window.angular);