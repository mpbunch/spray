(function(){
  'use strict';
  angular.module('sprayApp.const',[])
  .constant('sConst',{
    awsUrl:'https://63tcrphej6.execute-api.us-east-1.amazonaws.com/prod/data',
    coordsUrl:'http://freegeoip.net/json/',
    weatherUrl:'http://api.openweathermap.org/data/2.5/weather',
    weatherKey:'298c7fd17c85ab89e996c1dc1fea99db'
  })
})();