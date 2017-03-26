(function(){
  'use strict';
  angular.module('sprayApp',['ngRoute','sprayApp.const'])
  .config(['$routeProvider',function($routeProvider){
    $routeProvider.when('/',{
      templateUrl:'templates/home.html',
      controller:'mainCtrlr'
    })
  }])
  .controller('mainCtrlr',['$log','$scope','sConst','$http',function($log,$scope,sConst,$http){
    var getData = function(payload){
      $http({
        method:'POST',
        url: sConst.apiUrl,
        data: payload,
        headers:{
          'Content-Type':'application/x-www-form-urlencoded',
//          'x-api-key':awsConfig.key
        }
      }).then(function successCallback(response) {
        $log.debug(response)
        return response['data']['Items'];
      }, function errorCallback(response) {
        $log.debug('Get Data Error');
        return false;
      });
    };
    var payload = {'operation':'getFields'};
    $scope.fieldList = getData(payload);
    $scope.form = {
      field:'f1',
      task:'t1',
      carrierRate:'r1',
      acres:'Acres',
      p1:'p11',
      p1Rate:'p11Rate',
      p2:'p21',
      p2Rate:'p21Rate',
      comments:'Comments'
    }
  }])
})();