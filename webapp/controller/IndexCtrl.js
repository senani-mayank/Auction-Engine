var app = angular.module('AuctionApp');
app.controller('indexCtrl', ["$scope", "$state", "$rootScope", function( $scope, $state, $rootScope) {
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

        $rootScope.showError = function ( response ){
            alert( "Error : " + JSON.stringify(response.data.error.message) );
        }



    function openWebSocket()
        {
           if ("WebSocket" in window)
           {  
              // Let us open a web socket
              var ws = new WebSocket( webSocketUrl );
               
              ws.onopen = function()
              {
                 // Web Socket is connected, send data using send()
                 //ws.send("Message to send");
                 //alert("Message is sent...");
              };
               
              ws.onmessage = function (evt) 
              { 
                 var received_msg = evt.data;
                 alert("Message is received...");
                 $rootScope.onEventReceived(evt.data);
                 console.log(evt);
              };
               
              ws.onclose = function()
              { 
                 // websocket is closed.
                 alert("Connection is closed..."); 
              };
                   
              window.onbeforeunload = function(event) {
                 socket.close();
              };
           }
           else
           {
              // The browser doesn't support WebSocket
              alert("WebSocket NOT supported by your Browser!");
           }
        }        
        openWebSocket();






    });
}]);