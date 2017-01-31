/**
 * Created by steve on 6/6/16.
 */

(function(angular) {
    'use strict';

    var ROUTES_BUILDER;

    angular.module('sly.services.navigation', [])
        .config(
            ['$provide', function ($provide) {
                $provide.factory('navigationService', NavigationService);
            }]
        );

    NavigationService.$inject = ['$location', '$log'];

    function NavigationService($location, $log) {
        var messages = [];

        var serviceInstance = {
            goTo: goTo,
            getMessages: getMessages
        };

        return serviceInstance;


        function goTo(viewName, parameters, notifications) {
            var route = buildRoute(viewName, parameters);
            messages = notifications || [];
            $location.path(route);
        }

        function getMessages() {
            var messagesCopy = messages;
            messages = [];
            return messagesCopy;
        }

        function buildRoute(viewName, parameters) {
            return (ROUTES_BUILDER[viewName] || ROUTES_BUILDER['default'])(parameters, $log);
        }
    }

    ROUTES_BUILDER = {
        'dashboard': function() {
            return '/dashboard';
        },
        'logout': function() {
            return '/logout-page';
        },
        'login': function() {
            return '/login-page';
        },
        'userEdit': function(parameters) {
            var route = '/user-edit/';
            if (parameters && parameters.id) {
                route = route + parameters.id;
            }
            return route;
        },
        'userCreate': function() {
            return '/user-create';
        },
        'users': function() {
            return '/users';
        },
        'default': function() {
            return '/';
        }
    };

})(window.angular);