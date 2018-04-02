var app = angular.module('AuctionApp');

app.controller('joinAuctionCtrl', ['$scope', '$state', 'dataFactory', "$rootScope",
function ($scope, $state, dataFactory, $rootScope ) {

    var loggedInUser = dataFactory.getLoggedInUser();
    $scope.auctionTypes = dataFactory.getAuctionTypes();
    //var bidCounter = new Date().getTime();//to generate unique bid ids

    //bidder part
    $scope.selectedAuction = undefined;
    $scope.selectedAuctionType = $scope.auctionTypes[0];

    //auctioneer part
    $scope.selectedAuctionA = undefined;
    $scope.selectedAuctionTypeA = $scope.auctionTypes[0];    
    

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
            
            console.log("bid place successfully..", response);
            submitBid( auction, response.data );
        }, function errorCallback(response) {
            $rootScope.showError(response);
        }); 
        
        function submitBid( auction, bid ){//submit bid after it is created

            //var transactionId = bid.bidId + "t";
            var placeBidType = "Place" + bidType;//create full name of url
            var data = JSON.parse(JSON.stringify(englishAuctionPlaceBidTemplate));
            data.bid = "resource:" + bid["$class"] + "#" + bid.bidId;

            var placeBidRes = dataFactory.postResource( placeBidType, data );//place bid after creating
                placeBidRes.then(function successCallback(response) {
                    alert("bid placed successsfully");
                }, function errorCallback(response) {
                    $rootScope.showError(response);        
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
            $rootScope.showError(response);
        });
        
    }

    
    function onAuctioneerAuctionTypeChange( selectedAuctionType ){

        var auctionType = $scope.selectedAuctionTypeA.name;
        var auctioneerUri = "resource:" + NS + ".Auctioneer" + "%23" + loggedInUser.userId;
        var url = "queries/get" + auctionType + "ByAuctioneerId" + "?auctioneer=" + auctioneerUri;
        var res = dataFactory.getAllResource( url );//get auctions list
        res.then(function successCallback(response) {
            $scope.auctioneerAuctions = response.data;
        }, function errorCallback(response) {
            $rootScope.showError(response);
        });
        
    }    

    function changeRole( role ){

        if( role == "bidder" ){
            $scope.currentRole = "bidder";
        }
        else{
            $scope.currentRole = "auctioneer";
        }

    }

    function startAuction( auction ){

        var data = JSON.parse(JSON.stringify(startEnglishAuctionTemplate));
        var url = "start" + $scope.selectedAuctionTypeA.name;
        data.auction = "resource:" + $scope.selectedAuctionA["$class"] + "#" + $scope.selectedAuctionA.auctionId;

        var res = dataFactory.postResource( url, data );//get auctions list
        res.then(function successCallback(response) {
            alert("engish auction started");
            console.log("started auction", response);
        }, function errorCallback(response) {
            $rootScope.showError(response);            
        });

    }   
    
    function stopAuction( auction ){

        var data = JSON.parse(JSON.stringify(stopEnglishAuctionTemplate));
        var url = "stop" + $scope.selectedAuctionTypeA.name;
        data.auction = "resource:" + $scope.selectedAuctionA["$class"] + "#" + $scope.selectedAuctionA.auctionId;

        var res = dataFactory.postResource( url, data );//get auctions list
        res.then(function successCallback(response) {
            alert("engish auction stopped");
            console.log("stopped auction", response);
        }, function errorCallback(response) {
            $rootScope.showError(response);            
        });

    }    
    
    
    function onEventReceived( data ){
        if( data["$class"] == (  $scope.selectedAuction["$class"] + "." + $scope.selectedAuctionType.name + "BidUpdate") ){
            if( $scope.selectedAuctionType.name == "EnglishAuction" ){
                $scope.currentMaxBid = data.bid.bidValue;
            }
        }
    }

    $rootScope.onEventReceived = onEventReceived;

    $scope.currentMaxBid = 34343.344;

    $scope.auctions = dummyAuctions;
    $scope.onBidSubmit = onBidSubmit;
    $scope.onAuctionTypeChange = onAuctionTypeChange;
    $scope.changeRole = changeRole;
    $scope.onAuctioneerAuctionTypeChange = onAuctioneerAuctionTypeChange;
    $scope.startAuction = startAuction;
    $scope.stopAuction = stopAuction;

    changeRole("bidder");
    
}]);