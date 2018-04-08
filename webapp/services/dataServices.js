var app = angular.module('AuctionApp');
app.factory('dataFactory', ['$http', function ($http) {
    'use strict';
    var dataFactory = {};

    var CurrentlyloggedInUser = undefined;
    
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
    
    function postResource( resourceName, data ){
        return callApi( "POST", baseUrl + "/" + resourceName, data );
    }    

    function getLoggedInUser(){

        var user = localStorage.getItem( "loggedInUser" );
        if( user ){
            return JSON.parse(user);
        }
        return undefined;

    }

    function setLoggedInUser( user ){
        localStorage.setItem( "loggedInUser", JSON.stringify(user) );
     }    

    function getAuctionTypes(){
        return auctionTypes;
    }

    function getBidObject( auction, bidId, bidValue, bidder ){

        var obj = {};
        if( auction.type == "ENGLISH" ){
            obj = {
                "$class": "IN.AC.IIITB.EnglishAuction.EnglishAuctionBid",
                "auction": auction.auctionId,
                "bidId": bidId,
                "bidValue": bidValue,
                "bidder": bidder
              };
        }


        return obj;

    }

    function getPlaceBidObj( auction, bid, transactionId ){
        var obj = {};
        if( auction.type == "ENGLISH" ){
            obj = JSON.parse(JSON.stringify(placeEngAuctionBidTemplate));
            obj.bid = bid.bidId;
            obj.auction = auction.auctionId;
            obj.transactionId = transactionId;
        }
        return obj;
    }



    dataFactory.getAllResource = getAllResource;


    dataFactory.getResourceById = getResourceById;
    dataFactory.postResource = postResource;

    dataFactory.getLoggedInUser = getLoggedInUser;  
    dataFactory.setLoggedInUser = setLoggedInUser;
    dataFactory.getAuctionTypes = getAuctionTypes;
    dataFactory.getBidObject = getBidObject;
    dataFactory.getPlaceBidObj = getPlaceBidObj;    
    
    
    return dataFactory;

}]);