var NS = "IN.AC.IIITB";

var ip = "52.140.97.39";
var port = 3000;
var baseUrl = "http://" + ip + ":" + port + "/api" ;
var webSocketUrl = "ws:" + ip + ":" + port;

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
//auction item
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

var dutchItemPostTemplate = {
  "$class": "IN.AC.IIITB.DutchAuction.DutchAuctionItem",
  "auctionItemId": "string",
  "basePrice": 0,
  "status": "CREATED",
  "item": {},
  "owner" : ""  
};


var KthPriceItemPostTemplate = {
  "$class": "IN.AC.IIITB.KthPriceAuction.KthPriceAuctionItem",
  "auctionItemId": "string",
  "basePrice": 0,
  "status": "CREATED",
  "item": {},
  "owner" : ""
};

//auction
var englishAuctionPostTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.EnglishAuction",
  "auctionItem": {},
  "auctionId": "string",
  "status": "CREATED",
  "type": "ENGLISH",
  "description": "string",
  "auctioneer": {}
};

var reverseAuctionPostTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.ReverseAuction",
  "auctionItem": {},
  "auctionId": "string",
  "status": "CREATED",
  "type": "REVERSE",
  "description": "string",
  "auctioneer": {}
};

var dutchAuctionPostTemplate = {
  "$class": "IN.AC.IIITB.DutchAuction.DutchAuction",
  "auctionItem": {},
  "currentprice": 0,
  "auctionId": "string",
  "status": "CREATED",
  "type": "DUTCH",
  "description": "string",
  "auctioneer": {}
}

var KthPriceAuctionPostTemplate = {
  "$class": "IN.AC.IIITB.KthPriceAuction.KthPriceAuction",
  "auctionItem": {},
  "k": 0,
  "auctionId": "string",
  "status": "CREATED",
  "type": "KTH_PRICE",
  "description": "string",
  "auctioneer": {}
};

//bid template
var EnglishAuctionBidTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.EnglishAuctionBid",
  "bidValue": "string",
  "auction": {},
  "bidId": "string",
  "bidder": {}
};

var ReverseAuctionBidTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.ReverseAuctionBid",
  "bidValue": "string",
  "auction": {},
  "bidId": "string",
  "bidder": {}
};

var DutchAuctionBidTemplate = {
  "$class": "IN.AC.IIITB.DutchAuction.DutchAuctionBid",
  "bidValue": 0,//same as current price
  "auction": {},
  "bidId": "string",
  "bidder": {}
}

var KthPriceAuctionBidTemplate = {
  "$class": "IN.AC.IIITB.KthPriceAuction.KthPriceAuctionBid",
  "bidValue": "string",
  "auction": {},
  "bidId": "string",
  "bidder": {}
};

//bid post template

var EnglishAuctionPlaceBidTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.PlaceEnglishAuctionBid",
  "bid": {},
};

var ReverseAuctionPlaceBidTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.PlaceReverseAuctionBid",
  "bid": {},
};

var DutchAuctionPlaceBidTemplate = {
  "$class": "IN.AC.IIITB.DutchAuction.AcceptDutchAuctionBid",
  "bid": {},
};

var KthPriceAuctionPlaceBidTemplate = {
  "$class": "IN.AC.IIITB.KthPriceAuction.PlaceKthPriceAuctionBid",
  "bid": {},
};


//start auction template
var startEnglishAuctionTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.StartEnglishAuction",
  "auction": {}
};

var startReverseAuctionTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.StartReverseAuction",
  "auction": {}
};

var startDutchAuctionTemplate = {
  "$class": "IN.AC.IIITB.DutchAuction.StartDutchAuction",
  "auction": {}
};

var startKthPriceAuctionTemplate = {
  "$class": "IN.AC.IIITB.KthPriceAuction.StartKthPriceAuction",
  "auction": {}
};

//stop english template
var stopEnglishAuctionTemplate = {
  "$class": "IN.AC.IIITB.EnglishAuction.StopEnglishAuction",
  "auction": {}
};


var stopReverseAuctionTemplate = {
  "$class": "IN.AC.IIITB.ReverseAuction.StopReverseAuction",
  "auction": {}
};

var stopDutchAuctionTemplate = {
  "$class": "IN.AC.IIITB.DutchAuction.StopDutchAuction",
  "auction": {}
};

var stopKthPriceAuctionTemplate = {
  "$class": "IN.AC.IIITB.KthPriceAuction.StopKthPriceAuction",
  "auction": {}
};

//get auction status
var GetCurrentStatusDutchTemplate  = {
  "$class": "IN.AC.IIITB.DutchAuction.GetCurrentStatusDutch",
  "auction": {}
}


dummyUser = {  userId : 34, biddingId : 343, auctioneerId : 234   };
dummyAuctions = [ { "name" : "auction1", "auctionId" : "1" }, { "name" : "auction2", "auctionId" : "2" }, { "name" : "auction3", "auctionId" : "3" } ];