'use strict';

var EnglishAuctiontimeoutInterval = 1000;


/**Invkkoked when an english auction bid is places
 * @param {IN.AC.IIITB.PlaceEnglishAuctionBid} onEnglishAuctionBidPlaced
 * @transaction
 */
function onEnglishAuctionBidPlaced( placeBidTransaction ) {
    
    var NS = "IN.AC.IIITB";
    var bid = placeBidTransaction.bid;
    var buyer = bid.buyer;
    var auctionItem = bid.auctionItem;
    var bidValue = bid.bidValue;
    var auction = auctionItem.auction;


    if( auction.status == "CREATED" ){
        console.log("Auction Has Not Started Yet..!");
        return "Auction Has Not Started Yet..!";
    }
    else if( auction.status == "CLOSED" ){
        console.log("This Auction is Over..!");
        return "This Auction is Over..!";
    }

    //if current bid is > maxbid till now
    if(  ( !auctionItem.currentMaxBid ) ||  ( auctionItem.currentMaxBid > bidValue ) ){
        auctionItem.currentMaxBid = bid;
    }
    else{
        console.log("Your Bid Should Be Grater than Current Max Bid.!");
        return "Your Bid Should Be Grater than Current Max Bid.";
    }
    
    auction.lastBidTimestamp = bid.timestamp;


    return getAssetRegistry( NS + '.EnglishAuction' )
    .then(function ( englishAuctionRegistery ) {
        // add the temp reading to the shipment
        console.log("Auction Updated Successfully.!");
        return englishAuctionRegistery.update( auction );
    })
    .then(function() {
        return getAssetRegistry( NS + '.EnglishAuctionItem' );
    })
    .then(function( englishAuctionItemRegistery ) {
        // add the temp reading to the shipment
        console.log("Bid Placed Successfully.!");
        return englishAuctionItemRegistery.update(auctionItem);
    });


}

/**Invoked start the auction
 * @param {IN.AC.IIITB.StartEnglishAuction} startEnglishAuction
 * @transaction
 */
function startEnglishAuction( startAuction ) {
  
    var NS = "IN.AC.IIITB";
    var auction = startAuction.auction;
    var auctionCreateTime = startAuction.timestamp;

    console.log("auction", auction);
    console.log("auctionCreateTime:", auctionCreateTime);

    if( auction.status == "FINISHED" ){
      console.log("Auction is ALready Over");
        return "Auction is ALready Over...!";
    }
    else if( auction.status == "IN_PROGRESS" ){
      console.log("Auction is ALready Running");
        return "Auction is Already Running...!";
    }
    console.log("passif else:");
    auction.status = "IN_PROGRESS";
    console.log("progress changed:");
    getAssetRegistry( NS + '.EnglishAuction' )
    .then(function ( englishAuctionRegistery ) {
        // add the temp reading to the shipment
        console.log("Auction Updated Successfully.!");
        return englishAuctionRegistery.update( auction );
    })
    //var auctionTimeout = auction.timestamp;
   // auctionTimeout.setMinutes( auctionTimeout.getMinutes() + 2 );

    var intervalId = setInterval( checkBidsInterval, EnglishAuctiontimeoutInterval );//checks if auction timeout has occured

    function checkBidsInterval(  ){//called every second after auction is created
      console.log("tick tick");
        var now = new Date().getTime();
        if( !auction.auctionItems[0].lastBidTimestamp  ){ //if no bid placed
            //nobody bought item
            var timeoutTime = new Date( auctionCreateTime );
            timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );
 			console.log(" no bid waala case");
            if(  now >= timeoutTime.getTime() ){
                console.log(" now >= timeoutTime.getTime()");
              	console.log(" now = ",now);
              	console.log(" timeoutTime.getTime() = ",timeoutTime.getTime());
              
                auction.auctionItems[0].status = "UNSOLD";
                auction.status = "FINISHED";
                onItemUnsold(auction,auction.auctionItems[0] );
                clearInterval( intervalId );
            }

        }
        else{
		console.log(" bid waala case");
            var timeoutTime = new Date( auction.auctionItems[0].lastBidTimestamp );
            timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );
            if( now >= timeoutTime.getTime()  ){
                //auction is closed and item sold to last bid
              //  auction.auctionItems[0].status = "SOLD"
                auction.status = "FINISHED";
                sellItem( auction, auction.auctionItems[0] );
                clearInterval( intervalId );
            }
            else{
                //auction continues
            }

        }

        function sellItem( auction, auctionItem ){
            var factory = getFactory();
            var grower = factory.newResource(NS, "EnglishAuctionItemSold" );
            auction.auctionItems[0].status = "SOLD";
           //  factory.newResource( NS, "EnglishAuctionItemSold" );
            console.log("item sold");
          
        }

        function onItemUnsold( auction, auctionItem ){

            return getAssetRegistry( NS + '.EnglishAuction' )
            .then(function ( englishAuctionRegistery ) {
                // add the temp reading to the shipment
                console.log("rAuction Updated Successfully.!");
                return englishAuctionRegistery.update( auction );
            })
            .then(function() {
                return getAssetRegistry( NS + '.EnglishAuctionItem' );
            })
            .then(function( englishAuctionItemRegistery ) {
                // add the temp reading to the shipment
                console.log("rEnglishAuctionItem Successfully.!");
                return englishAuctionItemRegistery.update(auctionItem);
            });

        }


    }//end checkBidInterval

}//end startEnglishAuction
