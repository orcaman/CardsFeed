'use strict';

angular.module('nowApp', [
  'ngRoute',
  'ngAnimate',
  'google-maps',
  'ui.bootstrap',
  'ngTouch'
  ])
.config(function ($routeProvider) {
  $routeProvider
  .when('/', {
    templateUrl: 'views/main.html',
    controller: 'MainCtrl'
  })
  .otherwise({
    redirectTo: '/'
  });
});
