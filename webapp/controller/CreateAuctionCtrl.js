var app = angular.module('AuctionApp');
app.controller('createAuctionCtrl', function( $scope, $state) {
    
    function onAuctionSubmit(  ){
        alert( JSON.stringify(auction) + "----->" + bidValue );
    }
    var auctionTypes = [ { "name" : "auction1", "auctionTypeId" : "1"}, { "name" : "auction2", "auctionTypeId" : "2" } ];
 
    $scope.auctionTypes = auctionTypes;
    $scope.onAuctionSubmit = onAuctionSubmit;
    
});