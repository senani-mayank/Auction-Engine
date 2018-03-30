var app = angular.module('AuctionApp');

app.controller('joinAuctionCtrl', ['$scope', '$state', 'dataFactory', 
function ($scope, $state, dataFactory) {

    var loggedInUser = dataFactory.getLoggedInUser();

    function onBidSubmit( auction, bidValue ){
        alert( JSON.stringify(auction) + "----->" + bidValue );
    }
    
    $scope.currentMaxBid = 34343.344;

    $scope.auctions = dummtAuctions;
    $scope.onBidSubmit = onBidSubmit;
    
}]);