/**
 * Created by steve on 6/6/16.
 */

(function(angular) {
    'use strict';

    angular.module('sly.services.session', [])
        .constant('SESSION', 'slySession')
        .config(
        ['$provide', function ($provide) {
            $provide.factory('sessionService', SessionService);
        }]
    );

    SessionService.$inject = ['store', 'SESSION'];

    var session = null;

    function SessionService(store, SESSION) {

        var serviceInstance = {
            create: create,
            get: get,
            destroy: destroy,
            setSessionData: setSessionData,
            getSessionData: getSessionData,
            deleteSessionData: deleteSessionData,
            exists: exists,
            getSelectedLocale: getSelectedLocale,
            getTimeZone: getTimeZone
        };

        return serviceInstance;

        function create(sessionId, username, userType, authToken) {

            session = {
                id: sessionId,
                username: username,
                userRole: userType,
                authToken: authToken,
                data: {}
            }

            store.set(SESSION, session);
        }

        function get() {

            if (session == null) {
                session = store.get(SESSION);
            }

            if (session == null) {
                return null;
            }
            else {
                return {
                    id: session.id,
                    username: session.username,
                    userType: session.userType,
                    authToken: session.authToken,
                    data: session.data
                };
            }
        }

        function destroy() {
            store.remove(SESSION);
            session = null;
        }

        function setSessionData(key, value) {
            if (get() == null) return;
            session.data[key] = value;
            store.set(SESSION, session);
        }

        function getSessionData(key) {
            if (get() == null) return;
            return session.data[key];
        }

        function deleteSessionData(key) {
            if (get() == null) return;
            delete session.data[key];
            store.set(SESSION, session);
        }

        function exists() {
            return get() != null;
        }

        function getSelectedLocale() {
            return getSessionData('locale');
        }

        function getTimeZone() {
            return getSessionData('timeZone');
        }

    }


})(window.angular);