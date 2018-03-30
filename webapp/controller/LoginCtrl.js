var app = angular.module('AuctionApp');
app.controller('loginCtrl', function($scope, $state) {
    console.log("inside login..");
    function onLoginClick(){
        $state.go("home");
    }

    $scope.onLoginClick = onLoginClick;
});