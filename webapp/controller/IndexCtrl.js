var app = angular.module('AuctionApp');
app.controller('indexCtrl', function($scope) {
    $(function(){
        //to apply affix to topnavbar
        $('.navbar').affix({
          offset: {
            /* Affix the navbar after scroll below header */
            top: $("header").outerHeight(true)}
        });
    });
});