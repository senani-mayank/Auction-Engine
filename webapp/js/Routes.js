var app = angular.module("AuctionApp", ["ui.router"]);
/*
app.config(function($routeProvider) {
    $routeProvider
    .when("/", {
        templateUrl : "/views/Loading.html",
        controller : "loadingCtrl"
    })
    .when("/login", {
        templateUrl : "/views/Login.html",
        controller : "loginCtrl"
    })
    .when("/home", {
        templateUrl : "/views/Home.html",
        controller : "homeCtrl"
    });
});
*/

app.config(function($stateProvider, $urlRouterProvider) {
  
    $stateProvider
      .state('loading', {
        url: "/",
        templateUrl: "views/Loading.html",
        controller: 'loadingCtrl'
      }) 
      .state('login', {
        url: "/login",
        templateUrl: "/views/Login.html",
        controller: 'loginCtrl'
      })
      .state('home', {
        url: "/home",
        templateUrl: "/views/Home.html",
        controller: 'homeCtrl'
      })
      .state('createAuction', {
        url: "/createAuction",
        templateUrl: "/views/CreateAuction.html",
        controller: 'createAuctionCtrl'
      })
      .state('joinAuction', {
        url: "/joinAuction",
        templateUrl: "/views/JoinAuction.html",
        controller: 'joinAuctionCtrl'
      });
      $urlRouterProvider.otherwise("/");
  });