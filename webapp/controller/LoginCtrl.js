var app = angular.module('AuctionApp');

app.controller('loginCtrl', ['$scope', '$state', 'dataFactory', 
function ($scope, $state, dataFactory) {
    console.log("inside login..");
    //var loggedInUser = dataFactory.getLoggedInUser(); 
    $scope.user = { "userId" : "", "password" : "" };
    function onLoginClick(){
        
        if( $scope.user.register ){
            register();
        }
        else{
            login();
        }

        function login(){

            var res = dataFactory.getResourceById( "User", $scope.user.userId  );

            res.then(function successCallback(response) {
            var user = response.data;
            dataFactory.setLoggedInUser( user );
            $state.go("home");//goto home page

            }, function errorCallback(response) {

                alert("Error : " + JSON.stringify(response.data) );
                console.log("Error Login", response );

            });

        }

        function register(){//first register as user with provided userId, then on success it si automatically reigtered as auctioneer and bidder wirh same userId

            var data = JSON.parse(JSON.stringify( userPostTemplate ));
            data.userId = $scope.user.userId;
            data.email = $scope.user.email;
            data.firstName = $scope.user.firstName;
            data.lastName = $scope.user.lastName;

            var res = dataFactory.postResource( "User", data  );
                res.then(function successCallback(response) {

                   var auctioneerPostData = JSON.parse(JSON.stringify(auctioneerPostTemplate));
                   auctioneerPostData.auctioneerId = response.data.userId;
                   auctioneerPostData.user = "resource:" + response.data["$class"] + "#" + response.data.userId ;
                   dataFactory.postResource( "Auctioneer", auctioneerPostData  );

                   var bidderPostData = JSON.parse(JSON.stringify(bidderPostTemplate));
                   bidderPostData.bidderId = response.data.userId;
                   bidderPostData.user = "resource:" + response.data["$class"] + "#" + response.data.userId ;
                   dataFactory.postResource( "Bidder", bidderPostData  );

                   setTimeout(function(){ //loginuser after 1 second
                        dataFactory.setLoggedInUser( response.data );
                        $state.go("home");//goto home page                     
                   }, 1000);

                }, function errorCallback(response) {

                    alert("userId not found", JSON.stringify(response.data));
                    console.log("Error Login", response );

                });

        }

    }

    $scope.onLoginClick = onLoginClick;
    
}]);