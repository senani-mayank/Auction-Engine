var app = angular.module('AuctionApp');
app.controller('indexCtrl', function($scope, $state) {
    $(function(){

        //to apply affix to topnavbar
        $('.navbar').affix({
          offset: {
            /* Affix the navbar after scroll below header */
            top: $("header").outerHeight(true)}
        });

        var navbarOptions = [];
        navbarOptions.push( { "name" : "View Auctions", "state" : "home" } );
        navbarOptions.push( { "name" : "Create Item", "state" : "createItem" } );        
        navbarOptions.push( { "name" : "Create Auction", "state" : "createAuction" } );
        navbarOptions.push( { "name" : "Join Auction", "state" : "joinAuction" } );
        
        
        function changeState( state ){
            $state.go(state);
        }
        
        $scope.navbarOptions = navbarOptions;
        $scope.changeState = changeState;


    });
});