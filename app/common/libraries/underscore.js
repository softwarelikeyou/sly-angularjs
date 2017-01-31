(function(angular) {
    'use strict';

    angular
      .module('sly.libraries')
      .factory('_', underscore);

    underscore.$inject = ['$window'];

    function underscore($window) {
      return $window._;
    }

})(window.angular);
