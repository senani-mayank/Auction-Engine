var app = angular.module('AuctionApp');

app.controller('joinAuctionCtrl', ['$scope', '$state', 'dataFactory', 
function ($scope, $state, dataFactory) {

    var loggedInUser = dataFactory.getLoggedInUser();
    $scope.auctionTypes = dataFactory.getAuctionTypes();
    //var bidCounter = new Date().getTime();//to generate unique bid ids

    $scope.selectedAuction = undefined;
    $scope.selectedAuctionType = $scope.auctionTypes[0];

    function onBidSubmit( auction, bidValue ){

        var auction = $scope.selectedAuction;
        var bidType = $scope.selectedAuctionType.name;
        var bidder = {};
        var bidId = {};
        var data = JSON.parse(JSON.stringify(englishAuctionBidTemplate));
        
        if( $scope.selectedAuctionType.name == "EnglishAuction" ){
            bidType = bidType + "Bid";
            data.bidder = "resource:" + NS + ".Bidder" + "#" +  loggedInUser.userId;
            data.bidId = auction.auctionId + loggedInUser.userId + new Date().getTime();
            data.bidValue = bidValue;
            data.auction = "resource:" + $scope.selectedAuction["$class"] + "#" + $scope.selectedAuction.auctionId;
        }


        var createBidRes = dataFactory.postResource( bidType, data );//create bid
        createBidRes.then(function successCallback(response) {
          //  aleret("bid created successsfully");
            console.log("bid place successfully..", response);
            submitBid( auction, response.data );
        }, function errorCallback(response) {
            console.log("Error Create Bids", response );

    }); 
        
        function submitBid( auction, bid ){//submit bid after it is created

            //var transactionId = bid.bidId + "t";
            var placeBidType = "Place" + bidType;//create full name of url
            var data = JSON.parse(JSON.stringify(englishAuctionPlaceBidTemplate));
            data.bid = "resource:" + bid["$class"] + "#" + bid.bidId;

            var placeBidRes = dataFactory.postResource( placeBidType, data );//place bid after creating
                placeBidRes.then(function successCallback(response) {
                    alert("bid created successsfully");
                    console.log("bid placed sucessfully", response);
                }, function errorCallback(response) {
                    alert("bid place failed");
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