var app = angular.module('AuctionApp');

app.controller('loginCtrl', ['$scope', '$state', 'dataFactory', 
function ($scope, $state, dataFactory) {
    console.log("inside login..");
    //var loggedInUser = dataFactory.getLoggedInUser(); 
    $scope.user = { "userId" : "", "password" : "" };
    function onLoginClick(){

        var res = dataFactory.getResourceById( "User", $scope.user.userId  );

            res.then(function successCallback(response) {
            var user = response.data;
            dataFactory.setLoggedInUser( user );
            $state.go("home");//goto home page

        }, function errorCallback(response) {

            alert("userId not found");
            console.log("Error Login", response );

        });

    }

    $scope.onLoginClick = onLoginClick;
    
}]);