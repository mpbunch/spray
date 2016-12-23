(function(){
  'use strict';
  angular.module('sprayApp',['ngRoute'])
  .config(['$routeProvider',function($routeProvider){
    $routeProvider.when('/',{
      templateUrl:'templates/home.html',
      controller:'mainCtrlr'
    })
  }])
  .controller('mainCtrlr',['$scope',function($scope){
    $scope.test = 'test';
  }])
})();