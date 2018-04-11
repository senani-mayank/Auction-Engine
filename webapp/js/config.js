var ip = "34.217.79.112";
var port = 3000;
var baseUrl = "http://" + ip + ":" + port + "/api";
var webSocketUrl = "ws:" + ip + ":" + port;
var NS = "IN.AC.IIITB";

var auctionTypes = [ 
                    { name : "<-- Select Auction Type -->", auctionTypeId : "at0" },
                    { name : "EnglishAuction", auctionTypeId : "at1" },
                    { name : "ReverseAuction", auctionTypeId : "at2" }, 
                    { name : "DutchAuction", auctionTypeId : "at3" }, 
                    { name : "KthPriceAuction", auctionTypeId : "at4" }                   
                ];

var userPostTemplate = {
    "$class": "IN.AC.IIITB.User",
    "userId": "u1",
    "email": "",
    "firstName": "string",
    "lastName": "string"
  };

var auctioneerPostTemplate = {
    "$class": "IN.AC.IIITB.Auctioneer",
    "auctioneerId": "string",
    "user": {}
  };

var bidderPostTemplate = {
    "$class": "IN.AC.IIITB.Bidder",
    "bidderId": "string",
    "user": {}
  };

var itemPostTemplate = {
  "$class": "IN.AC.IIITB.Item",
  "itemId": "string",
  "name": "string",
  "description": "string"
};

var englishItemPostTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.EnglishAuctionItem",
  "auctionItemId": "string",
  "basePrice": 0,
  "status": "CREATED",
  "item": {},
  "owner" : ""
};

var reverseItemPostTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.ReverseAuctionItem",
  "auctionItemId": "string",
  "basePrice": 0,
  "status": "CREATED",
  "item": {},
  "owner" : ""  
};

var englishAuctionPostTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.EnglishAuction",
  "auctionItem": {},
  //"bids": [
  //  {}
  //],
  //"currentMaxBid": {},
  //"winnerBid": {},
  "auctionId": "string",
  "status": "CREATED",
  "type": "ENGLISH",
  "description": "string",
  //"lastBidTimestamp": "2018-03-31T12:25:07.176Z",
  //"auctionStartTime": "2018-03-31T12:25:07.176Z",
  //"auctionEndTime": "2018-03-31T12:25:07.176Z",
  "auctioneer": {}
};

var reverseAuctionPostTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.ReverseAuction",
  "auctionItem": {},
  //"bids": [
  //  {}
  //],
  //"currentMaxBid": {},
  //"winnerBid": {},
  "auctionId": "string",
  "status": "CREATED",
  "type": "REVERSE",
  "description": "string",
  //"lastBidTimestamp": "2018-03-31T12:25:07.176Z",
  //"auctionStartTime": "2018-03-31T12:25:07.176Z",
  //"auctionEndTime": "2018-03-31T12:25:07.176Z",
  "auctioneer": {}
};

var EnglishAuctionBidTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.EnglishAuctionBid",
  "bidValue": "string",
  "auction": {},
  "bidId": "string",
  "bidder": {}
};

var EnglishAuctionPlaceBidTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.PlaceEnglishAuctionBid",
  "bid": {},
  //"transactionId": "string",
  //"timestamp": "2018-04-01T05:54:25.687Z"
};


var ReverseAuctionBidTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.ReverseAuctionBid",
  "bidValue": "string",
  "auction": {},
  "bidId": "string",
  "bidder": {}
};

var ReverseAuctionPlaceBidTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.PlaceReverseAuctionBid",
  "bid": {},
  //"transactionId": "string",
  //"timestamp": "2018-04-01T05:54:25.687Z"
};


var startEnglishAuctionTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.StartEnglishAuction",
  "auction": {}
};

var stopEnglishAuctionTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.StopEnglishAuction",
  "auction": {}
};

var startReverseAuctionTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.StartReverseAuction",
  "auction": {}
};

var stopReverseAuctionTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.StopReverseAuction",
  "auction": {}
};

dummyUser = {  userId : 34, biddingId : 343, auctioneerId : 234   };
dummyAuctions = [ { "name" : "auction1", "auctionId" : "1" }, { "name" : "auction2", "auctionId" : "2" }, { "name" : "auction3", "auctionId" : "3" } ];