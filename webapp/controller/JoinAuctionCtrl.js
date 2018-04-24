var app = angular.module('AuctionApp');

app.controller('joinAuctionCtrl', ['$scope', '$state', 'dataFactory', "$rootScope",
function ($scope, $state, dataFactory, $rootScope ) {

    var loggedInUser = dataFactory.getLoggedInUser();
       
    $scope.auctionTypes = dataFactory.getAuctionTypes();
    function resetData(){
        
        $scope.bids = [];
        $scope.bidsA = [];    
        $scope.winnerBid = "NA";$scope.auctionTypes = dataFactory.getAuctionTypes();
        $scope.winnerBidA = "NA";
        $scope.amountToPayA = "NA";
        $scope.amountToPay = "NA";
    }
    
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
        else if( $scope.selectedAuctionType.name == "KthPriceAuction" ){
            template = KthPriceAuctionBidTemplate;
        }        

        var data = JSON.parse(JSON.stringify( template ));
        
        if( ( $scope.selectedAuctionType.name == "EnglishAuction" ) || ( $scope.selectedAuctionType.name == "ReverseAuction" ) || ( $scope.selectedAuctionType.name == "KthPriceAuction" ) ){
            bidType = bidType + "Bid";
            data.bidder = "resource:" + NS + ".Bidder" + "#" +  loggedInUser.userId;
            data.bidId = auction.auctionId + loggedInUser.userId + new Date().getTime();
            data.bidValue = bidValue;
           // data.auction = "resource:" + auction["$class"] + "#" + auction.auctionId;
           data.auction = undefined;
        }
        else if( $scope.selectedAuctionType.name == "DutchAuction" ){
            bidType = bidType + "Bid";
            data.bidder = "resource:" + NS + ".Bidder" + "#" +  loggedInUser.userId;
            data.bidId = auction.auctionId + loggedInUser.userId + new Date().getTime();
            data.bidValue = ( $scope.currentMaxBid != "NA" ) ? $scope.currentMaxBid : 767 ;
            //data.auction = "resource:" + auction["$class"] + "#" + auction.auctionId;
            data.auction = undefined;            
            
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
                templateP = DutchAuctionPlaceBidTemplate;
                placeBidType = "Accept" + bidType;
            }  
            else if( $scope.selectedAuctionType.name == "KthPriceAuction" ){
                templateP = KthPriceAuctionPlaceBidTemplate;
            }             
            var data = JSON.parse(JSON.stringify( templateP ));

            data["auction"] = "resource:" + auction["$class"] + "#" + auction.auctionId;
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
        var query = { 
                    "where" : { 
                                "auctioneer" : { "neq" : auctioneerUri },
                                "status" : { "neq" : "FINISHED" }  
                        }
    
                    };

        var url = auctionType  + "?filter=" + JSON.stringify(query);

        var res = dataFactory.getAllResource( url );//get auctions list
        res.then(function successCallback(response) {
            resetData();
            $scope.auctions = response.data;
        }, function errorCallback(response) {
            $rootScope.showError(response);
        });
        
    }

    
    function onAuctioneerAuctionTypeChange( selectedAuctionType ){

        var auctionType = $scope.selectedAuctionTypeA.name;
        var auctioneerUri = "resource:" + NS + ".Auctioneer" + "%23" + loggedInUser.userId;

        var query = { 
            "where" : { 
                        "auctioneer" :  auctioneerUri ,
                        "status" : { "neq" : "FINISHED" }  
                }

            };

        var url = auctionType  + "?filter=" + JSON.stringify(query);
        var res = dataFactory.getAllResource( url );//get auctions list
        res.then(function successCallback(response) {
            resetData();
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
        else if( $scope.selectedAuctionTypeA.name == "KthPriceAuction" ){
            template = startKthPriceAuctionTemplate;
        }        

        var data = JSON.parse(JSON.stringify( template ));
        var url = "start" + $scope.selectedAuctionTypeA.name;
        data.auction = "resource:" + $scope.selectedAuctionA["$class"] + "#" + $scope.selectedAuctionA.auctionId;

        var res = dataFactory.postResource( url, data );//start auction
        res.then(function successCallback(response) {
            alert("auction started");
            console.log("started auction", response);
            $scope.auctionEndTimeA = response.auctionEndTime; //updates auction end time
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
        else if( $scope.selectedAuctionTypeA.name == "KthPriceAuction" ){
            template = stopKthPriceAuctionTemplate;
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
                if( ( currentAuctionUri == data.auction ) &&  ( ( $scope.selectedAuctionType.name == "EnglishAuction" ) || ( $scope.selectedAuctionType.name == "ReverseAuction" ) || ( $scope.selectedAuctionType.name == "KthPriceAuction" ) ) ){
                    $scope.currentMaxBid = data.bidValue;
                    $scope.bids = data.bids;
                    $scope.auctionEndTime = data.auction.auctionEndTime;                    
                }
            }//stop auction
            else if( data["$class"] == (  $scope.selectedAuction["$class"]  + "StopEvent") ){
                var flag = false;
                if(  currentAuctionUri == data.auction  ){
                   if(  $scope.selectedAuctionType.name == "KthPriceAuction" ){
                        flag = true;
                        $scope.amountToPay = data.AmountToPay;
                   }
                   populateWinnerBid( data.winnerBid, 'b', flag );
                }
             
            }            //update current dutch price 
            else if( data["$class"] == (  NS + "." + $scope.selectedAuctionType.name + ".DutchAuctionStatusUpdate" ) ){
                $scope.currentMaxBid = data.currentprice;
            }           
            else if( data["$class"] == (  $scope.selectedAuction["$class"]  + "Start") ){
                $scope.auctionEndTime = data.auction.auctionEndTime;//set end time of bidder
            } 
        }
        
        if( $scope.selectedAuctionA ){//auctioneer

            currentAuctionUriA = "resource:" +  $scope.selectedAuctionA["$class"] + "#" + $scope.selectedAuctionA.auctionId;            
            if( data["$class"] == (  $scope.selectedAuctionA["$class"]  + "BidUpdate") ){
                if( ( currentAuctionUriA == data.auction ) &&  ( ( $scope.selectedAuctionTypeA.name == "EnglishAuction" ) || ( $scope.selectedAuctionTypeA.name == "ReverseAuction" ) || ( $scope.selectedAuctionTypeA.name == "KthPriceAuction" ) ) ){
                    $scope.currentMaxBidA = data.bidValue;
                    $scope.bidsA = data.bids;
                    $scope.auctionEndTimeA = data.auction.auctionEndTime;
                }
            } //stop auction
            else if( data["$class"] == (  $scope.selectedAuctionA["$class"]  + "StopEvent") ){
                var flag = false;
                if(  currentAuctionUriA == data.auction  ){
                   if(  $scope.selectedAuctionTypeA.name == "KthPriceAuction" ){
                        $scope.amountToPayA = data.AmountToPay;
                        flag = true;
                   }
                   populateWinnerBid( data.winnerBid, 'a', flag );
                }
             
            }
            else if( data["$class"] == (  $scope.selectedAuctionA["$class"]  + "Start") ){
                $scope.auctionEndTimeA = data.auction.auctionEndTime;//set end time of auctioneer
            }                        

        }

        $scope.$apply();
        
    }

    function populateWinnerBid( bid, role, flag ){

        if( !bid ){
            if( role == "a" ){
                $scope.winnerBidA = "NA";
            }
            else if( role == "b" ){
                $scope.winnerBid = "NA";
            }
        }

        var resource;
        var resourceId = bid.split("#")[1];
        if( role == 'a' ){
            resource = $scope.selectedAuctionTypeA.name + "Bid";            
        }
        else if( role == 'b' ){
            resource = $scope.selectedAuctionType.name + "Bid";            
        }

       var res = dataFactory.getResourceById( resource, resourceId );
       res.then(function successCallback(response) {
           console.log( "winner bid", response );
            if( role == 'a' ){
                $scope.winnerBidA = response.data;
                if( flag == false )
                    $scope.amountToPayA = response.data.bidValue;
                alert( "Auctioneer auction Stop : Item sold at Value :- " + response.data.bidValue );
            }
            else if( role == 'b' ){
                $scope.winnerBid = response.data;
                if( flag == false )
                     $scope.amountToPay = response.data.bidValue;
                alert( "Bidder auction Stop : Item sold at Value :- " + response.data.bidValue );                
            }            
        }, function errorCallback(response) {
            $rootScope.showError(response);            
        });

    }

    function getResourceId( resource ){//fetch resource name from uri
        if( resource ){
            var split = resource.split("#");
            if( split.length > 1 ){
                return split[1];
            }
            else{
                return split[0];
            }
        }
        else{
            return "NA";
        }
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
    $scope.getResourceId = getResourceId;
    $scope.resetData = resetData();

    changeRole("bidder");
    resetData();
    
}]);