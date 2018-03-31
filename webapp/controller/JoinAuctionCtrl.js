var app = angular.module('AuctionApp');

app.controller('joinAuctionCtrl', ['$scope', '$state', 'dataFactory', 
function ($scope, $state, dataFactory) {

    var loggedInUser = dataFactory.getLoggedInUser();
    $scope.auctionTypes = dataFactory.getAuctionTypes();
    //var bidCounter = new Date().getTime();//to generate unique bid ids

    $scope.selectdAuction = undefined;
    $scope.selectedAuctionType = $scope.auctionTypes[0];

    function onBidSubmit( auction, bidValue ){

        var bidType = $scope.selectedAuctionType.name + "Bid";
        var bidder = loggedInUser.userId;
        var bidId = auction.auctionId + loggedInUser.userId + new Date().getTime();
        var data = dataFactory.getBidObject( auction, bidId, bidValue, bidder );

        var createBidRes = dataFactory.postResource( bidType, data );//create bid
        createBidRes.then(function successCallback(response) {
            submitBid( auction, response.data );
        }, function errorCallback(response) {
            console.log("Error Create Bids", response );

        }); 
        
        function submitBid( auction, bid ){

            var transactionId = bid.bidId + "t";
            var data = dataFactory.getPlaceBidObj(auction, bid, transactionId);

            var placeBidRes = dataFactory.postResource( bidType, data );//place bid after creating
                placeBidRes.then(function successCallback(response) {
                    console.log("bid placed sucessfully", response);
                }, function errorCallback(response) {
                    console.log("Error Place Bids", response );
        
                });             
        }

        alert( JSON.stringify(auction) + "----->" + bidValue );
    }
    
    function onAuctionTypeChange( selectedAuctionType ){

        var auctionType = $scope.selectedAuctionType.name;

        var res = dataFactory.getAllResource( auctionType );//get auctions list
        res.then(function successCallback(response) {
            $scope.auctions = response.data;
        }, function errorCallback(response) {
            console.log("Error Get Auctions", response );

        });
        
    }


    $scope.currentMaxBid = 34343.344;

    $scope.auctions = dummyAuctions;
    $scope.onBidSubmit = onBidSubmit;
    $scope.onAuctionTypeChange = onAuctionTypeChange;
    
}]);