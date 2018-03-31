var baseUrl = "http://34.212.20.227:3000/api";
var auctionTypes = [ 
                    { name : "<-- Select Auction Type -->", auctionTypeId : "at0" },
                    { name : "EnglishAuction", auctionTypeId : "at1" },
                    { name : "ReverseAuction", auctionTypeId : "at2" }, 
                    { name : "DutchAuction", auctionTypeId : "at3" }, 
                    { name : "KthPriceAuction", auctionTypeId : "at4" }                   
                ];

 var placeEngAuctionBidTemplate =  {
        "$class": "IN.AC.IIITB.EnglishAuction.PlaceEnglishAuctionBid",
        "bid": {},
        "transactionId": ""//,
       // "timestamp": "2018-03-30T21:06:18.555Z"
        };

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
  "item": {}
};

var englishAuctionPostTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.EnglishAuction",
  "auctionItem": {},
  "bids": [
    {}
  ],
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

dummyUser = {  userId : 34, biddingId : 343, auctioneerId : 234   };
dummyAuctions = [ { "name" : "auction1", "auctionId" : "1" }, { "name" : "auction2", "auctionId" : "2" }, { "name" : "auction3", "auctionId" : "3" } ];