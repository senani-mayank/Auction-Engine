var app = angular.module('AuctionApp');
app.controller('joinAuctionCtrl', function( $scope, $state) {
    var auctions = [ { "name" : "auction1", "auctionId" : "1" }, { "name" : "auction2", "auctionId" : "2" }, { "name" : "auction3", "auctionId" : "3" } ];
    
    function onBidSubmit( auction, bidValue ){
        alert( JSON.stringify(auction) + "----->" + bidValue );
    }
    
    $scope.auctions = auctions;
    $scope.onBidSubmit = onBidSubmit;
    
});