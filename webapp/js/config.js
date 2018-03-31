var baseUrl = "http://52.36.100.52:3000/api";
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

dummyUser = {  userId : 34, biddingId : 343, auctioneerId : 234   };
dummyAuctions = [ { "name" : "auction1", "auctionId" : "1" }, { "name" : "auction2", "auctionId" : "2" }, { "name" : "auction3", "auctionId" : "3" } ];