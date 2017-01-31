/**
 * Created by steve on 6/6/16.
 */

(function(angular) {
    'use strict';

    angular.module('sly.services.user', ['ngCookies', 'ngResource'])
    .constant('USER_ROLES', {
        1: 'ADMIN',
        2: 'POWER',
        3: 'BASIC'
    })
    .config(
        ['$provide', function ($provide) {
            $provide.factory('userService', UserService);
    }]
        );

    UserService.$inject = ['$q', '$window', '$http', '$location', '$log', 'sessionService', 'base64Service', 'REST_URL'];

    function UserService($q, $window, $http, $location, $log, sessionService, base64Service, REST_URL) {

        var serviceInstance = {
            authenticate: authenticate,
            login: login,
            logout: logout,
            getUserListData: getUserListData,
            getUserDataById: getUserDataById,
            resolveUsername: resolveUsername,
            createUser: createUser,
            saveUser: saveUser,
            deleteUser: deleteUser,
        };

        return serviceInstance;

        function _doAuthentication(username, headerName, token) {

            var serviceUrl = REST_URL + '/user/authenticate';

            var headers = {};
            headers[headerName] = token;

            return $http({
                method: 'GET',
                url: serviceUrl,
                headers: headers
            }).then(function(response) {
                var data = response.data;

                sessionService.create(
                    data.userId,
                    username,
                    data.userType,
                    data.authToken
                );

                sessionService.setSessionData('locale', data.locale);
                sessionService.setSessionData('timeZone', data.timeZone);

                return $q.resolve();
            }, function(error) {
                return $q.reject(error.data);
            });
        }

        function authenticate(authToken) {
            var decoded = base64Service.decode(authToken);
            var username = decoded.substring(0, decoded.indexOf(':'));
            return _doAuthentication(username, 'AuthToken', authToken);
        }

        function login(credentials) {
            var auth = credentials.username + ':' + credentials.password;
            var authToken = 'Basic ' + base64Service.encode(auth);
            return _doAuthentication(credentials.username, 'Authorization', authToken);
        };

        function logout() {
            sessionService.destroy();
            $location.path('/login-page');
        }

        function getUserListData() {

            if (!sessionService.exists()) return $q.reject();

            var serviceUrl = REST_URL + '/user';
            var authToken = sessionService.get().authToken;

            return $http({
                method: 'GET',
                url: serviceUrl,
                headers: {'AuthToken': authToken}
            }).then(function (results) {
                    return results.data;
            });
        }

        function getUserDataById(id) {

            if (!sessionService.exists()) return $q.reject();

            var serviceUrl = REST_URL + '/user/' + id;
            var authToken = sessionService.get().authToken;

            return $http({
                method: 'GET',
                url: serviceUrl,
                headers: {'AuthToken': authToken}
            }).then(function (results) {
                return results.data;
            });
        }

        function resolveUsername(username) {

            if (!sessionService.exists()) return $q.reject();

            var serviceUrl = REST_URL + '/user/' + username;
            var authToken = sessionService.get().authToken;

            return $http({
                method: 'GET',
                url: serviceUrl,
                headers: {'AuthToken': authToken}
            })
            .then(
                function (response) {
                    return $q.reject(response.data);
                },
                function (response) {
                    return response.data;
                }
            );
        }

        function createUser(createObj) {

            if (!sessionService.exists()) return $q.reject();

            $log.info(createObj);
            
            var serviceURL = REST_URL + '/user';
            var authToken = sessionService.get().authToken;

            return $http({
                method: 'POST',
                url: serviceURL,
                headers: {'AuthToken': authToken},
                data: createObj
            })
            .then(
                function (result) {
                    return result.data;
                },
                function (result) {
                    return $q.reject(result.data);
                }
            );
        }

        function saveUser(createObj) {

            if (!sessionService.exists()) return $q.reject();

            var serviceURL = REST_URL + '/user';
            var authToken = sessionService.get().authToken;

            return $http({
                method: 'PUT',
                url: serviceURL,
                headers: {'AuthToken': authToken},
                data: createObj
            })
            .then(
                function (result) {
                    return result.data;
                },
                function (result) {
                    return $q.reject(result.data);
                }
            );

        }

        function deleteUser(id) {

            if (!sessionService.exists()) return $q.reject();

            var serviceUrl = REST_URL + '/user/' + id;
            
            var authToken = sessionService.get().authToken;

            return $http({
                method: 'DELETE',
                url: serviceUrl,
                headers: {'AuthToken': authToken}
            })
                .then(
                    function (result) {
                        return result.data;
                    },
                    function (result) {
                        return $q.reject(result.data);
                    }
                );
        }
    }


})(window.angular);