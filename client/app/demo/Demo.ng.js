'use strict';
angular.module('app').factory('Demo', [
  'EspResource',
  function (EspResource) {
    return EspResource.group('demo', {}, {
      'demo1': {
        'method': 'GET',
        url: '/:prefix/demo/demo1'
      },
      'demo2': {
        'method': 'GET',
        url: '/:prefix/demo/demo2'
      },
      'demo3': {
        'method': 'GET',
        url: '/:prefix/demo/demo3'
      },
      'demo4': {
        'method': 'GET',
        url: '/:prefix/demo/demo4'
      }
    });
  }
]);
