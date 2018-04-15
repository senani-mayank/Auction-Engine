var app = angular.module('AuctionApp');

app.controller('joinAuctionCtrl', ['$scope', '$state', 'dataFactory', "$rootScope",
function ($scope, $state, dataFactory, $rootScope ) {

    var loggedInUser = dataFactory.getLoggedInUser();
    $scope.auctionTypes = dataFactory.getAuctionTypes();
    $scope.bids = [];
    $scope.bidsA = [];    
    $scope.winnerBid = "NA";
    $scope.winnerBidA = "NA";
    
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
        var template = EnglishAuctionBidTemplate;
        if( $scope.selectedAuctionType.name == "ReverseAuction" ){
             template = ReverseAuctionBidTemplate;            
        }
        else if( $scope.selectedAuctionType.name == "DutchAuction" ){
            template = DutchAuctionBidTemplate;
        }
        var data = JSON.parse(JSON.stringify( template ));
        
        if( ( $scope.selectedAuctionType.name == "EnglishAuction" ) || ( $scope.selectedAuctionType.name == "ReverseAuction" ) ){
            bidType = bidType + "Bid";
            data.bidder = "resource:" + NS + ".Bidder" + "#" +  loggedInUser.userId;
            data.bidId = auction.auctionId + loggedInUser.userId + new Date().getTime();
            data.bidValue = bidValue;
            data.auction = "resource:" + auction["$class"] + "#" + auction.auctionId;
        }
        else if( $scope.selectedAuctionType.name == "DutchAuction" ){
            bidType = bidType + "Bid";
            data.bidder = "resource:" + NS + ".Bidder" + "#" +  loggedInUser.userId;
            data.bidId = auction.auctionId + loggedInUser.userId + new Date().getTime();
            data.bidValue = ( $scope.currentMaxBid ) ? $scope.currentMaxBid : 767 ;
            data.auction = "resource:" + auction["$class"] + "#" + auction.auctionId;
            
        }

        var createBidRes = dataFactory.postResource( bidType, data );//create bid
        createBidRes.then(function successCallback(response) {
            
            console.log("bid place successfully..", response);
            submitBid( auction, response.data );
        }, function errorCallback(response) {
            $rootScope.showError(response);
        }); 
        
        function submitBid( auction, bid ){//submit bid after it is created

            var placeBidType = "Place" + bidType;//create full name of url
            var templateP =  EnglishAuctionPlaceBidTemplate;
            if( $scope.selectedAuctionType.name == "ReverseAuction" ){
                templateP = ReverseAuctionPlaceBidTemplate;            
            }          
            else if( $scope.selectedAuctionType.name == "DutchAuction" ){
                templateP = DutchAuctionPlaceBidTemplate
                placeBidType = "Accept" + bidType;
            }  
            var data = JSON.parse(JSON.stringify( templateP ));
            data.bid = "resource:" + bid["$class"] + "#" + bid.bidId;

            var placeBidRes = dataFactory.postResource( placeBidType, data );//place bid after creating
                placeBidRes.then(function successCallback(response) {
                    alert("bid placed successsfully");
                }, function errorCallback(response) {
                    $rootScope.showError(response);        
                });             
        }

    }
    
    function onAuctionTypeChange( selectedAuctionType ){

        var auctionType = $scope.selectedAuctionType.name;
        var auctioneerUri = "resource:" + NS + ".Auctioneer" + "%23" + loggedInUser.userId;
        var query = { "where" : { "auctioneer" : { "neq" : auctioneerUri } } };

        var url = auctionType  + "?filter=" + JSON.stringify(query);

        var res = dataFactory.getAllResource( url );//get auctions list
        res.then(function successCallback(response) {
            $scope.auctions = response.data;
        }, function errorCallback(response) {
            $rootScope.showError(response);
        });
        
    }

    
    function onAuctioneerAuctionTypeChange( selectedAuctionType ){

        var auctionType = $scope.selectedAuctionTypeA.name;
        var auctioneerUri = "resource:" + NS + ".Auctioneer" + "%23" + loggedInUser.userId;
        var query = { "where" : { "auctioneer" :  auctioneerUri  } };
        var url = auctionType  + "?filter=" + JSON.stringify(query);
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

        auction = $scope.selectedAuctionA;
        var template = startEnglishAuctionTemplate;
        if( $scope.selectedAuctionTypeA.name == "ReverseAuction" ){
            template = startReverseAuctionTemplate;
        }
        else if( $scope.selectedAuctionTypeA.name == "DutchAuction" ){
            template = startDutchAuctionTemplate;
        }

        var data = JSON.parse(JSON.stringify( template ));
        var url = "start" + $scope.selectedAuctionTypeA.name;
        data.auction = "resource:" + $scope.selectedAuctionA["$class"] + "#" + $scope.selectedAuctionA.auctionId;

        var res = dataFactory.postResource( url, data );//start auction
        res.then(function successCallback(response) {
            alert("auction started");
            console.log("started auction", response);
            if( $scope.selectedAuctionTypeA.name == "DutchAuction" ){
                updateDutchStatus( auction );
            }
        }, function errorCallback(response) {
            $rootScope.showError(response);            
        });

        //contineously fetch dutch auction status
        function updateDutchStatus( auction ){

            var inter = setInterval(function(){
                
                var template = GetCurrentStatusDutchTemplate;                
                var data = JSON.parse(JSON.stringify( template ));
                data.auction = "resource:" + auction["$class"] + "#" + auction.auctionId;
                var url =  "GetCurrentStatusDutch";
                var res = dataFactory.postResource( url, data );//start auction
                res.then(function successCallback(response) {
                    console.log("GetCurrentStatusDutch called");
                }, function errorCallback(response) {
                    clearTimeout( inter );
                    $rootScope.showError(response);            
                });     

            }, 10000);

        }

    }   
    
    function stopAuction( auction ){

        var template = stopEnglishAuctionTemplate;
        if( $scope.selectedAuctionTypeA.name == "DutchAuction" ){
            template = stopDutchAuctionTemplate;
        }
        else if( $scope.selectedAuctionTypeA.name == "ReverseAuction" ){
            template = stopReverseAuctionTemplate;
        }     
        
        var data = JSON.parse(JSON.stringify( template ));
        var url = "stop" + $scope.selectedAuctionTypeA.name;
        data.auction = "resource:" + $scope.selectedAuctionA["$class"] + "#" + $scope.selectedAuctionA.auctionId;

        var res = dataFactory.postResource( url, data );//get auctions list
        res.then(function successCallback(response) {
            alert(" auction stopped");
            console.log("stopped auction", response);
        }, function errorCallback(response) {
            $rootScope.showError(response);            
        });

    }    
    
    
    function onEventReceived( data ){

        data = JSON.parse(data);
        var currentAuctionUri = undefined;
        var currentAuctionUriA = undefined;

        if( $scope.selectedAuction ){//bidder
            currentAuctionUri = "resource:" +  $scope.selectedAuction["$class"] + "#" + $scope.selectedAuction.auctionId;  
            //bid update         
            if( data["$class"] == (  $scope.selectedAuction["$class"]  + "BidUpdate") ){//on bidder side
                if( ( currentAuctionUri == data.auction ) &&  ( ( $scope.selectedAuctionType.name == "EnglishAuction" ) || ( $scope.selectedAuctionType.name == "ReverseAuction" ) ) ){
                    $scope.currentMaxBid = data.bidValue;
                    $scope.bids = data.bids;
                }
            }//stop auction
            else if( data["$class"] == (  $scope.selectedAuction["$class"]  + "StopEvent") ){
                if( ( currentAuctionUri == data.auction ) && ( ( $scope.selectedAuctionType.name == "EnglishAuction" ) || ( $scope.selectedAuctionType.name == "ReverseAuction" ) ) ){
                    $scope.winnerBid = data.winnerBid;
                }             
            }               //update current dutch price 
            else if( data["$class"] == (  NS + "." + $scope.selectedAuctionType.name + ".DutchAuctionStatusUpdate" ) ){
                $scope.currentMaxBid = data.currentprice;
            }           

        }

        if( $scope.selectedAuctionA ){//auctioneer

            currentAuctionUriA = "resource:" +  $scope.selectedAuctionA["$class"] + "#" + $scope.selectedAuctionA.auctionId;            
            if( data["$class"] == (  $scope.selectedAuctionA["$class"]  + "BidUpdate") ){
                if( ( currentAuctionUriA == data.auction ) &&  ( ( $scope.selectedAuctionTypeA.name == "EnglishAuction" ) || ( $scope.selectedAuctionTypeA.name == "ReverseAuction" ) ) ){
                    $scope.currentMaxBidA = data.bidValue;
                    $scope.bidsA = data.bids;
                }
            } //stop auction
            else if( data["$class"] == (  $scope.selectedAuctionA["$class"]  + "StopEvent") ){
                if( ( currentAuctionUriA == data.auction ) && ( ( $scope.selectedAuctionTypeA.name == "EnglishAuction" ) || ( $scope.selectedAuctionTypeA.name == "ReverseAuction" ) ) ){
                    $scope.winnerBidA = data.winnerBid;
                }
             
            }           

        }

        $scope.$apply();
        
    }

    $rootScope.onEventReceived = onEventReceived;

    $scope.currentMaxBid = "NA";

    $scope.auctions = dummyAuctions;
    $scope.onBidSubmit = onBidSubmit;
    $scope.onAuctionTypeChange = onAuctionTypeChange;
    $scope.changeRole = changeRole;
    $scope.onAuctioneerAuctionTypeChange = onAuctioneerAuctionTypeChange;
    $scope.startAuction = startAuction;
    $scope.stopAuction = stopAuction;

    changeRole("bidder");
    
}]);