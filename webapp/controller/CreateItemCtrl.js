var app = angular.module('AuctionApp');

app.controller('createItemCtrl', ['$scope', '$state', 'dataFactory', "$rootScope",
function ($scope, $state, dataFactory, $rootScope ) {
    console.log("inside createItemCtrl..");
    var loggedInUser = dataFactory.getLoggedInUser(); 
    $scope.item = { "itemId" : "", "description" : "", "name" : "" };
    $scope.auctionTypes = dataFactory.getAuctionTypes();
    $scope.selectedAuctionType = auctionTypes[0];
    $scope.items = [];
    
    function onItemCreate(){     
        
        
        if( $scope.isAuctionItem ){
            createAuctionItem();
        }
        else{
            createItem();
        }

        function createItem(){

            var data = JSON.parse( JSON.stringify( itemPostTemplate ) );
                data.itemId = $scope.item.itemId;
                data.name = $scope.item.name;
                data.description = $scope.item.description;

            var res = dataFactory.postResource( "Item", data );
            res.then(function successCallback(response) {
                alert( "item created successfully" );
                console.log("item created", response);
            }, function errorCallback(response) {
                $rootScope.showError(response);
            });

        }

        function createAuctionItem(){

            var data = {};

            if( $scope.selectedAuctionType.name == "EnglishAuction" ){
                data = JSON.parse( JSON.stringify( englishItemPostTemplate ) );
            }
            else if( $scope.selectedAuctionType.name == "ReverseAuction" ){
                data = JSON.parse( JSON.stringify( reverseItemPostTemplate ) );              
            }
            else if( $scope.selectedAuctionType.name == "DutchAuction" ){
                data = JSON.parse( JSON.stringify( dutchItemPostTemplate ) );              
            }            
            
            data.auctionItemId = $scope.item.itemId;
            data.basePrice = $scope.item.basePrice;
            data.item = "resource:" + $scope.selectedItem["$class"] + "#" + $scope.selectedItem.itemId;
            data.owner = "resource:" + NS + ".Auctioneer" + "#" + loggedInUser.userId;            

            var res = dataFactory.postResource( $scope.selectedAuctionType.name + "Item", data );
            res.then(function successCallback(response) {
                alert( "auction item created successfully" );
                console.log("item created", response);
            }, function errorCallback(response) {
                $rootScope.showError(response);
            });

        }
        
    }

   function fetchItems(){

        var res = dataFactory.getAllResource( "Item" );
        res.then(function successCallback(response) {
            $scope.items = response.data;
            console.log("item created", response);
        }, function errorCallback(response) {
            $rootScope.showError(response);
        });

    }    

    $scope.onItemCreate = onItemCreate;
    $scope.fetchItems = fetchItems;
    fetchItems();
    
}]);