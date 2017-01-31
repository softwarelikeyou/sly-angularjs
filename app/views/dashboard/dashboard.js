(function(angular) {
    'use strict';

    angular.module('sly.views.dashboard', ['pascalprecht.translate', 'ui.bootstrap'])
    .controller('DashboardCtrl', DashboardCtrl);

    DashboardCtrl.$inject = ['sessionService', 'navigationService'];

    function DashboardCtrl(sessionService, navigationService) {
        var dashboardCtrl = this;
        
        this.username = sessionService.get().username;
        
    }
})(window.angular);
