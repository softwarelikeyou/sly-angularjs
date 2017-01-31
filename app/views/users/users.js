(function(angular) {
    'use strict';

    angular.module('sly.views.users', [
        'pascalprecht.translate',
        'ui.bootstrap',
        'ui.grid',
        'ui.grid.selection',
        'ui.grid.resizeColumns',
        'sly.views.users.userEdit',
        'sly.views.users.userCreate',
        'sly.modals.removeUser',
        'sly.directives.userTypes',
    ])
    .controller('UsersCtrl', UsersCtrl);

    UsersCtrl.$inject = ['$uibModal', '$translate', '$scope', '$interval', '$log', 'userService', 'navigationService'];

    function UsersCtrl($uibModal, $translate, $scope, $interval, $log, userService, navigationService) {
        var usersCtrl = this;

        usersCtrl.setSelectedUser = setSelectedUser;
        usersCtrl.onClickCreateUser = onClickCreateUser;
        usersCtrl.onClickEditUser = onClickEditUser;
        usersCtrl.onClickRemoveUser = onClickRemoveUser;
        usersCtrl.updateListData = updateListData;

        usersCtrl.selected = null;

        usersCtrl.emptyGridIconClass = 'fa-spinner fa-pulse';

        usersCtrl.emptyGridMessages = [
            'LOADING_USERS'
        ];
        
        usersCtrl.gridOptions = {
            enableColumnsMenu: true,
            enableColumnMenus: false,
            enableMinHeightCheck: true,
            minRowsToShow: 4,
            rowHeight: 40,
            enableRowHeaderSelection: false,
            enableFooterTotalSelected: false,
            gridMenuTitleFilter: $translate,
            multiSelect: false
        };

        usersCtrl.gridOptions.columnDefs = [
            {
                field: '\u2714',
                headerCellTemplate: '<div></div>',
                cellTemplate: '<div class="ui-grid-cell-contents"><input type="radio" ng-model="grid.appScope.usersCtrl.selected" ng-value="row.entity" ng-click></div>',
                width: 25,
                headerCellClass: 'sly-ui-grid-header-cell',
                cellClass: 'sly-ui-grid-cell',
                headerTooltip: true
            },
            {
                name: 'userId',
                field: 'userId',
                displayName: 'USER_ID',
                headerCellFilter: 'translate',
                headerCellClass: 'sly-ui-grid-header-cell',
                cellClass: 'sly-ui-grid-cell',
                headerTooltip: true,
                cellTooltip: true,
                minWidth: 140
            },
            {
                name: 'username',
                field: 'username',
                displayName: 'USER_NAME',
                headerCellFilter: 'translate',
                headerCellClass: 'sly-ui-grid-header-cell',
                cellClass: 'sly-ui-grid-cell',
                headerTooltip: true,
                cellTooltip: true,
                minWidth: 140
            },
            {
                name: 'userType',
                field: 'userType',
                displayName: 'USER_TYPE',
                headerCellFilter: 'translate',
                headerCellClass: 'sly-ui-grid-header-cell',
                cellClass: 'sly-ui-grid-cell',
                headerTooltip: true,
                cellTooltip: true,
                minWidth: 140
            },
            {
                name: 'displayName',
                field: 'displayName',
                displayName: 'DISPLAY_NAME',
                headerCellFilter: 'translate',
                headerCellClass: 'sly-ui-grid-header-cell',
                cellClass: 'sly-ui-grid-cell',
                headerTooltip: true,
                cellTooltip: true,
                minWidth: 140
            }

        ];

        usersCtrl.gridOptions.onRegisterApi = function(gridApi) {
            usersCtrl.gridApi = gridApi;
            gridApi.selection.on.rowSelectionChanged(null, function(row) {
                usersCtrl.selected = row.entity;
                usersCtrl.setSelectedUser(row.isSelected ? row.entity : null);
            });
        };

        activate();

        function activate() {

            updateListData();

            var refreshInterval = $interval(updateListData, 10000);

            $scope.$on('$destroy', function destroyHandler() {
                if (refreshInterval) {
                    $interval.cancel(refreshInterval);
                }
            });

        }

        function setSelectedUser(user) {
            usersCtrl.selected = user;
        }

        function onClickCreateUser() {
             navigationService.goTo('userCreate');
        }


        function onClickEditUser() {
            if( usersCtrl.selected == null ) {
                return;
            }
            navigationService.goTo('userEdit', {
                id: usersCtrl.selected.userId
            });
        }


        function onClickRemoveUser() {
            
            if( usersCtrl.selected == null ) return;

            var modal = $uibModal.open({
                templateUrl: 'modals/remove-user/remove-user.html',
                backdrop: 'static',
                controller: 'RemoveUserCtrl',
                controllerAs: 'removeUserCtrl',
                resolve: {
                    user: function () {
                        return usersCtrl.selected;
                    }
                }
            });

            modal.result.then(function() {

                usersCtrl.messages = [{
                    'icon': 'fa-check-circle',
                    'keys': ['THE_USER_WAS_REMOVED_SUCCESSFULLY']
                }];
                setSelectedUser(null);
                updateListData();
            });
        }

        function updateListData() {

            userService.getUserListData().then(function(data){

                usersCtrl.gridOptions.data = data;

            });
        }
        
    }
})(window.angular);
