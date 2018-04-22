var app = angular.module('AuctionApp');

app.controller('joinAuctionCtrl', ['$scope', '$state', 'dataFactory', "$rootScope",
function ($scope, $state, dataFactory, $rootScope ) {


    var loggedInUser = dataFactory.getLoggedInUser();

    $scope.auctionLabels = [ "#", "Name", "Type", "Description", "StartDate", "EndDate", "Status", "ItemId", "WinnerBid" ];
    $scope.auctions = [
                         { "name" : "Auct1", "type" : "English", "description" : "dsadf","startDate" : "er", "endDate" : "ddfd", "status" : "CREATED", "itemId" : "333", "winnerBid" : "SDSDSDSDSD" }
                     ];
    
    $scope.auctionTypes = auctionTypes;
    for( var i=0; i<scope.auctionTypes.length; i++ ){ //loop through all auction types

        var auctionType = $scope.auctionTypes[i].name;
        var auctioneerUri = "resource:" + NS + ".Auctioneer" + "%23" + loggedInUser.userId;
        var query = { "where" : { "auctioneer" : { "eq" : auctioneerUri } } };
        var url = auctionType  + "?filter=" + JSON.stringify(query);
        
        var res = dataFactory.getAllResource( url );//get auctions list        
        res.then(function successCallback(response) {
            console.log( "dfdf", response );
            $scope.auctions = $scope.auctions.concat( response.data );//add elements tpo our array
        }, function errorCallback(response) {
            $rootScope.showError(response);
        });

    }

}]);