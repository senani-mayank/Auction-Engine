var app = angular.module('AuctionApp');
app.controller('createAuctionCtrl', ['$scope', '$state', 'dataFactory',  "$rootScope",
function ($scope, $state, dataFactory, $rootScope ) {
    
    var loggedInUser = dataFactory.getLoggedInUser();
    var auctionTypes = dataFactory.getAuctionTypes();
    $scope.selectedAuctionType = auctionTypes[0];
    $scope.selectedItem = {};

    $scope.items = [];

    function onAuctionSubmit(  ){
        var data = {};
        if( $scope.selectedAuctionType.name == "EnglishAuction" ){

            data = JSON.parse(JSON.stringify(englishAuctionPostTemplate));
            data.auctionItem = "resource:" + $scope.selectedItem["$class"] + "#" + $scope.selectedItem.auctionItemId;
            data.description = $scope.auctionDescription;
            data.auctionId = $scope.auctionId;
            data.auctioneer = "resource:" + NS + ".Auctioneer" + "#" + loggedInUser.userId;

        }
        else if( $scope.selectedAuctionType.name == "ReverseAuction" ){

            data = JSON.parse(JSON.stringify(reverseAuctionPostTemplate));
            data.auctionItem = "resource:" + $scope.selectedItem["$class"] + "#" + $scope.selectedItem.auctionItemId;
            data.description = $scope.auctionDescription;
            data.auctionId = $scope.auctionId;
            data.auctioneer = "resource:" + NS + ".Auctioneer" + "#" + loggedInUser.userId;

        }


        var res = dataFactory.postResource( $scope.selectedAuctionType.name, data );
            res.then(function successCallback(response) {
                
                alert( "created success " + JSON.stringify( response.data ) );
            }, function errorCallback(response) {
                $rootScope.showError(response);
            });                
    }

    //var auctionTypes = [ { "name" : "auction1", "auctionTypeId" : "1"}, { "name" : "auction2", "auctionTypeId" : "2" } ];
    function fetchItems(){

        var owner = "resource:" + NS + ".Auctioneer" + "#" + loggedInUser.userId;
        var url = $scope.selectedAuctionType.name + "Item" + "?filter = { 'where' : { 'owner' : " + owner + " } }";

        var res = dataFactory.getAllResource( url  );
        res.then(function successCallback(response) {
            $scope.items = response.data;
            $scope.selectedItem = $scope.items[0];
            console.log("item created", response);
        }, function errorCallback(response) {
            $rootScope.showError(response);
        });

    }    

    function onAuctionTypeChange(){
        fetchItems();
    }

    $scope.auctionTypes = auctionTypes;
    $scope.onAuctionSubmit = onAuctionSubmit;
    $scope.onAuctionTypeChange = onAuctionTypeChange;

    
    
}]);