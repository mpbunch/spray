(function(){
  'use strict';
  angular.module('sprayApp',['ngMaterial','ngRoute','sprayApp.const'])
  .config(['$routeProvider','$logProvider',function($routeProvider,$logProvider){
    $logProvider.debugEnabled(true);
    $routeProvider.when('/',{
      templateUrl:'templates/home.html'
    })
  }])
  .factory('dataHandler',['$http','sConst',function($http,sConst){
    return  {
      getFields: function(){
        return post({'operation':'getFields'});
      },
      getChemicals: function(){
        return post({'operation':'getChemicals'});
      },
      getRecipies: function(){
        return post({'operation':'getRecipies'});
      },
      getWeather: function(lat,lon){
        return get(sConst.weatherUrl+'?lat='+lat+'&lon='+lon+'&APPID='+sConst.weatherKey);
      },
      getCoords: function(){
        return get(sConst.coordsUrl);
      },
      getData: function(){
        return post({'operation':'getData'});
      },
      putData: function(payload){
        return post({'operation':'putData','payload':payload})
      }
    }
    function get(url){
      //function, incase other things need to be added later
      return $http.get(url);
    }
    function post(payload){
      return $http({
        method:'POST',
        url: sConst.awsUrl,
        data: payload,
        headers:{
          'Content-Type':'application/x-www-form-urlencoded',
        }
      });
    }
  }])
  .controller('mainCtrlr',['$log','$scope','dataHandler','$mdSidenav','$parse','$filter',function($log,$scope,dataHandler,$mdSidenav,$parse,$filter){
    //Partial Maker .. because i was tired of typing the word partials
    function makePartial(partial){
      return {page:'partials/'+partial+'.html',card:partial};
    }

    //Initial card partial
    $scope.entry    = makePartial('initEntry');
    $scope.recipie  = makePartial('initRecipie');
    $scope.field    = makePartial('initField');
    $scope.chemical = makePartial('initChemical');
    $scope.report   = makePartial('initReport');

    //Order of cards; change this order to change UI order
    var entryCard     = ['initEntry','entryField','entryRecipie','entryWeather','entryComments','entrySubmit'];
    var recipieCard   = ['initRecipie','recipieTitle','recipieChemical','recipieComments','recipieSubmit'];
    var fieldCard     = ['initField','fieldTitle','fieldComments','fieldSubmit'];
    var chemicalCard  = ['initChemical','chemicalTitle','chemicalComments','chemicalSubmit'];
    var reportCard    = ['initReport','reportData'];//'reportFields','reportChemicals','reportWeather','reportActivity'];

    //Find 'next' card .. even if next card is the previous card
    $scope.changeCard = function(card,direction = 'next'){                    //changeCard('entry','prev') || changeCard('entry')
      var position = eval(card+'Card').indexOf($scope[card].card);
      switch(direction){
          case'prev':
          case'left':
            --position;
            break;
          case'next':
          case'right':
            ++position;
            break;
      }
      $parse(card).assign($scope,makePartial(eval(card+'Card')[position]));   //Output Example: $scope.entry = 'partials/entryField.html';
    };

    //###################################################################################################
    //Handle all promises in controller
    //Why? B/c you have access to the scope variable here, you dont need to mess with $scope.$apply()
    //###################################################################################################
    //Get Fields
    function getFields(){
      dataHandler.getFields().then(function successCallback(response) {
        $scope.fieldList = alphaOrder(JSON.parse(response['data']['body'])['Items']);
        console.log($scope.fieldList);
      }, function errorCallback(response) {
        $scope.fieldList = "Something went wrong.";
      });
    };
    getFields();
    
    //Get Chemicals
    function getChemicals(){
      dataHandler.getChemicals().then(function successCallback(response) {
        $scope.chemicalList = alphaOrder(JSON.parse(response['data']['body'])['Items']);
        console.log($scope.chemicalList);
      }, function errorCallback(response) {
        $scope.chemicalList = "Something went wrong.";
      });
    };
    getChemicals();
    
    //Get Recipies
    function getRecipies(){
      dataHandler.getRecipies().then(function successCallback(response) {
        $scope.recipieList = alphaOrder(JSON.parse(response['data']['body'])['Items']);
        console.log($scope.recipieList);
      }, function errorCallback(response) {
        $scope.recipieList = "Something went wrong.";
      });
    };
    getRecipies();
    
    function getEntryData(){
      dataHandler.getData().then(function successCallback(response) {
        $scope.dataList = alphaOrder(JSON.parse(response['data']['body'])['Items']);
        console.log($scope.dataList);
      }, function errorCallback(response) {
        $scope.dataList = "Something went wrong.";
      });
    };
    getEntryData();
    
    //Get Weather via Coords
    function getWeather(){
      dataHandler.getCoords().then(function successCallback(response){
        $scope.location = response.data;
        console.log(response.data);
        dataHandler.getWeather($scope.location.latitude, $scope.location.longitude).then(function successCallback(response){
          $scope.weather = {};
          $scope.weather.details = response.data.weather[0];
          $scope.weather.details.icon = convertIcons($scope.weather.details.icon);
          $scope.weather.temp = Math.round(1.8 * (response.data.main.temp - 273) + 32);
          $scope.weather.wind = response.data.wind;
          $scope.weather.wind.deg = getCardinal($scope.weather.wind.deg);
          $scope.weather.humidity = response.data.main.humidity;
          $scope.entryForm.weather = $scope.weather;//add weather to entryForm by default
          $scope.entryForm.weather.attach = true;   //turn on weather attach
          console.log($scope.weather);
        });
      });
    };
    getWeather();

    //Convert junky openweathermap icons to material icons
    function convertIcons(icon){
      switch(icon){
        case'01d':
        case'01n':
          return 'weather-sunny';
        case'02d':
        case'02n':
          return 'weather-partlycloudy';
        case'03d':
        case'03n':
        case'04d':
        case'04n':
          return 'weather-cloudy';
        case'09d':
        case'09n':
        case'10d':
        case'10n':
          return 'weather-pouring';
        case'11d':
        case'11n':
          return 'weather-lightning';
        case'13d':
        case'13n':
          return 'weather-snowy';
        case'50d':
        case'50n':
          return 'weather-fog';
      }
    }

    //Convert degrees to cardnial direction
    function getCardinal(angle){
      var directions = 8;
      var degree = 360 / directions;
      angle = angle + degree/2;
      if(angle >= 0 * degree && angle < 1 * degree)
        return "North";
      if(angle >= 1 * degree && angle < 2 * degree)
        return "NEast";
      if(angle >= 2 * degree && angle < 3 * degree)
        return "East";
      if(angle >= 3 * degree && angle < 4 * degree)
        return "SEeast";
      if(angle >= 4 * degree && angle < 5 * degree)
        return "South";
      if(angle >= 5 * degree && angle < 6 * degree)
        return "SWest";
      if(angle >= 6 * degree && angle < 7 * degree)
        return "West";
      if(angle >= 7 * degree && angle < 8 * degree)
        return "NWest";
    }

    //Sort returnd dynamo responses by ID
    //PROBLEM:
    //Item in items | orderBy:'id' track by $index
    //returns the newly orderd $index value, IE the $index value does not coorospond with items[$index]
    //also, (key,value) in items | orderBy:'id', will not return correct data for items[key]
    //SOLUTION:
    //Pre-sort your arry so ng-repeat is already in the right order, no need for orderBy:'id'
    //Make sure you handle $index-1 for zeroth element
    function alphaOrder(objs){
      return objs.sort(function(a,b){return a.id - b.id});
    }

    //dont have a clean solution for adding weather info to entryForm
    $scope.attachWeather = function(){
      console.log($scope.entryForm.weather.attach);
      if(!$scope.entryForm.weather.attach){
        $scope.entryForm.weather = $scope.weather;
        $scope.entryForm.weather.attach = false;
      }else{
        $scope.entryForm.weather = {}; //remove weather data from entryForm
        $scope.entryForm.weather.attach = true;
      }
    }

    //Submit forms
    //Remove any null or empty values, dynamo will crash and burn if you dont
    $scope.submitForm = function(form){
      console.log('Form:',form);
      dataHandler.putData(scrubForm($scope[form+'Form'])).then(function successCallback(response){
        console.log('Submit: ',response);
        switch(form){
          case'entry':
            getEntryData();
            break;
          case'recipie':
            getRecipies();
            break;
          case'field':
            getFields();
            break;
          case'chemical':
            getChemicals();
            break;
        };
      });
    };

    //Remove null, empty values from object
    function scrubForm(form){
      Object.keys(form).forEach(k => (!form[k] && form[k] !== undefined) && delete form[k]);
      console.log('Clean: ',form);
      return form;
    }

    //Probably going to get rid of the menu
    $scope.menu = ['Make Recipie','Add Chemical','Add Field','Report','Weather'];
    $scope.toggleLeft = buildToggler('left');
    $scope.toggleRight = buildToggler('right');
    function buildToggler(componentId) {
      return function() {
        $mdSidenav(componentId).toggle();
      };
    }

    //Default entryForm
    //Weather switch set to on by default
    $scope.entryForm = {
      form:'entryForm',
      field:{},
      recipie:{},
      weather:{attach:true},
      comment:''
    };
    //Default recipieForm
    $scope.recipieForm = {
      form:'recipieForm',
      name:'',
      chemicals:[{}],
      comment:''
    };
    
    
    $scope.getRecipieName = function(id){
      return $filter('filter')($scope.recipieList,id)[0].name;
    };
    $scope.getRecipieChemicals = function(id){
      return $filter('filter')($scope.recipieList,id)[0].chemicals;
    };
    
  }])
})();