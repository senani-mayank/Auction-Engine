var app = angular.module('AuctionApp');
app.factory('dataFactory', ['$http', function ($http) {
    'use strict';
    var dataFactory = {};
    
    function callApi( method, url, data ){

        var obj = {
            method: method,
            url: url
          };
          if( data ){
            obj.data = data;
          }

        return   $http( obj ); 
    }

    function getAllResource( resourceName ){
        return callApi( "GET", baseUrl + "/" + resourceName );
    }

    function getResourceById( resourceName, resourceId ){
        return callApi( "GET", baseUrl + "/" + resourceName + "/" + resourceId );
    }    
    
    function postResource( resourceName ){
        return callApi( "POST", baseUrl + "/" + resourceName, data );
    }    

    function getLoggedInUser(){
        return dummyUser;
    }

    function setLoggedInUser( user ){
       // $rootScope.loggedInUser = user;
    }

    dataFactory.getAllResource = getAllResource;


    dataFactory.getLoggedInUser = getLoggedInUser;
    dataFactory.getResourceById = getResourceById;
    
    dataFactory.setLoggedInUser = setLoggedInUser;
    
    
    return dataFactory;

}]);