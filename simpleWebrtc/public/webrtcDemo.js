'use strict';

var webrtcDemo = angular.module('webrtcDemo', [
    'ngRoute',
    'WebRTC.Controllers'
]);

webrtcDemo.config(function ($routeProvider, $locationProvider) {
    $locationProvider.html5Mode(true);
    $routeProvider

    .when('/', {
        templateUrl: '/webrtc/webRTC.html',
        controller: 'WebRTCCtrl'
    });
});