(function(){
  'use strict';
  angular.module('sprayApp',['ngMaterial','ngRoute','sprayApp.const'])
  .config(['$routeProvider',function($routeProvider){
    $routeProvider.when('/',{
      templateUrl:'templates/home.html'
    })
  }])
  .factory('dataHandler',['$http','sConst',function($http,sConst){
    return  {
      getFields: function(){
        console.log('fields');
        return fetch({'operation':'getFields'});
      },
      getChemicals: function(){
        console.log('chemicals');
        return true;
      }
    }
    function fetch(payload){
      return $http({
        method:'POST',
        url: sConst.apiUrl,
        data: payload,
        headers:{
          'Content-Type':'application/x-www-form-urlencoded',
        }
      });
    }
  }])
  .controller('mainCtrlr',['$log','$scope','dataHandler','$mdSidenav',function($log,$scope,dataHandler,$mdSidenav){
    var entryCard = ['entryNew','entryField','entryRecipie','entryWeather','entryComments','entrySubmit'];
    var recipieCard = [];
    var fieldCard = [];
    var reportCard = [];
    
    $scope.changeCard = function(card,direction,position){ //entryCard,next,0
      switch(direction){
          case'prev':
          case'left':
            --position;
            break;
          case'next':
          case'right':
            ++position;
      }
      $scope.pageName = 'partials/'+card[position]+'.html';
    };
    
    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');

    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }
    
    dataHandler.getFields().then(function successCallback(response) {
      $scope.fieldList = JSON.parse(response['data']['body'])['Items'];
    }, function errorCallback(response) {
      $scope.fieldList = "Something went wrong.";
    });
    
    $scope.menu = ['Make Recipie','Add Chemical','Add Field','Report','Weather'];
    
    $scope.entry = {
      date:'',
      field:'',
      recipie:'',
      weather:true,
      comments:''
    }
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