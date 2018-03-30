var app = angular.module('AuctionApp');
app.controller('loadingCtrl', function( $scope, $state) {
    console.log("inside loading..");
    var user = { "userId" : undefined };
    if( user.userId == undefined ){
        $state.go("login");
    }
});