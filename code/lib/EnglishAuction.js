/**
 * Business Logic For English Auction
 */
'use strict';

var EnglishAuctiontimeoutInterval = 1000;


/**Invkkoked when an english auction bid is places
 * @param {IN.AC.IIITB.EnglishAuction.PlaceEnglishAuctionBid} placeBidTransaction
 * @transaction
 */
function onEnglishAuctionBidPlaced( placeBidTransaction ) {
    console.log("onEnglishAuctionBidPlaced", placeBidTransaction);
    var NS = "IN.AC.IIITB.EnglishAuction";
    var bid = placeBidTransaction.bid;
    var bidder = bid.bidder;
    var auction = bid.auction;
    var auctionItem = auction.auctionItem;
    var bidValue = bid.bidValue;

    if( auction.status == "CREATED" ){
        console.log("Auction Has Not Started Yet..!");
        return "Auction Has Not Started Yet..!";
    }
    else if( auction.status == "FINISHED" ){
        console.log("This Auction is Over..!");
        return "This Auction is Over..!";
    }

    //check if auction should be closed
    var now = placeBidTransaction.timestamp;
    var timeoutTime = new Date( auction.auctionStartTime) ;
    timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );

    if( ( !auction.lastBidTimestamp ) && ( now >= timeoutTime ) ){//no bid & times up
        console.log("no bid placed and auction time is up, item unsold");
      	console.log(now," -> ",timeoutTime );
      	console.log("auction",auction);
        return;
    }
    else {

        if( !auction.lastBidTimestamp ){
            auction.lastBidTimestamp =  placeBidTransaction.timestamp;
        }

		console.log("andar aaya..!");
        timeoutTime =  new Date( auction.lastBidTimestamp );
        timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );
        console.log("bas andar hi aaya..!");

        if( auction.lastBidTimestamp && ( now >= timeoutTime ) ){//if last bid was placed 2 minutes before
            console.log("Time Out Has Occured, item is sold");
            console.log(timeoutTime.getTime() , now);
            return;
        }
        else{
            //if current bid is > maxbid till now
          	console.log("lo jee else mai bhi aaya");
            if(  ( !auction.currentMaxBid ) ||  ( auction.currentMaxBid.bidValue < bidValue ) ){
                auction.currentMaxBid.bidValue = bidValue;
                auction.lastBidTimestamp = placeBidTransaction.timestamp;
                auction.bids.push( bid );
                return updateAssets( auction );
            }
            else{
                console.log("Your Bid Should Be Grater than Current Max Bid.!");
                return "Your Bid Should Be Grater than Current Max Bid.";
            }
           
        }    

    }

    function updateAssets( auction, auctionItem ){

        return getAssetRegistry( NS + '.EnglishAuction' )
        .then(function ( englishAuctionRegistery ) {
            // add the temp reading to the shipment
            console.log("Auction Updated Successfully.!");
            return englishAuctionRegistery.update( auction );
        });
        /*
        .then(function() {
            return getAssetRegistry( NS + '.EnglishAuctionItem' );
        })
        .then(function( englishAuctionItemRegistery ) {
            // add the temp reading to the shipment
            console.log("Bid Placed Successfully.!");
            return englishAuctionItemRegistery.update(auctionItem);
        });
        */
        
    }


}

/**Invoked start the auction
 * @param {IN.AC.IIITB.EnglishAuction.StartEnglishAuction} startAuction
 * @transaction
 */
function onEnglishAuctionStart( startAuction ) {
  
    var NS = "IN.AC.IIITB.EnglishAuction";
    var auction = startAuction.auction;

    if( auction.status == "FINISHED" ){
        console.log("Auction is ALready Over");
        return "Auction is ALready Over...!";
    }
    else if( auction.status == "IN_PROGRESS" ){
        console.log("Auction is ALready Running");
        return "Auction is Already Running...!";
    }

    auction.status = "IN_PROGRESS";
    auction.auctionStartTime = startAuction.timestamp;
    //auction.auctionItem.auctionStartTime = startAuction.timestamp;//remove it later
    auction.auctionItem.status = "AUCTIONING";

    return  getAssetRegistry( NS + '.EnglishAuctionItem' )//update auctionItem status
            .then(function ( englishAuctionItemRegistry ) {
                console.log("Auction Item Updated Successfully.!");
                return englishAuctionItemRegistry.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.EnglishAuction' );
            })
            .then(function( englishAuctionRegistry ){
                console.log("Auction Updated Successfully.!");
                return englishAuctionRegistry.update( auction );
            });

}//end startEnglishAuction


/**Invoked stop the auction
 * @param {IN.AC.IIITB.EnglishAuction.StopEnglishAuction} stopAuction
 * @transaction
 */
function stopEnglishAuction( stopAuction ) {
  
    var NS = "IN.AC.IIITB.EnglishAuction";
    var auction = stopAuction.auction;

    if( auction.status == "FINISHED" ){
        console.log("Auction is ALready Over");
        return "Auction is ALready Over...!";
    }
    else if( auction.status == "CREATED" ){
        console.log("Auction is Not Started Yet");
        return "Auction is Not Started Yet...!";
    }

    auction.status = "FINISHED";
    auction.auctionEndTime = stopAuction.timestamp;

    return  getAssetRegistry( NS + '.EnglishAuction' )//update auctionItem status
            .then(function ( englishAuctionRegistry ) {
                console.log("Auction Updated Successfully.!");
                return englishAuctionRegistry.update( auction );
            });


}//end startEnglishAuction



/**Invoked start the auction, assume auction status is set to finished
 * @param {IN.AC.IIITB.EnglishAuction.EnglishAuctionItemSold} itemSold
 * @transaction
 */
function onItemSold( itemSold ) {
  
    var NS = "IN.AC.IIITB.EnglishAuction";
    var winnerBid = itemSold.winnerBid;
    var auction = itemSold.auction;
    var auctionItem = auction.auctionItem;

    if( auction.status == "CREATED" ){
        console.log("Auction is not started yet..!");
        return "Auction is not started yet..!";
    }
    else if( auction.status == "IN_PROGRESS" ){
        console.log("Auction is IN_PROGRESS");
        return "Auction is IN_PROGRESS";
    }

   // auction.status = "CLOSED";
   // auction.auctionItem.auctionEndTime = itemSold.timestamp;
    auctionItem.status = "SOLD";
    auction.winnerBid = winnerBid;
    return  getAssetRegistry( NS + '.EnglishAuctionItem' )//update auctionItem status
            .then(function ( englishAuctionItemRegistry ) {
                console.log("1");
                return englishAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.EnglishAuction' );
            })
           .then(function( englishAuctionRegistry ){
                console.log("2");
                return englishAuctionRegistry.update( auction );
            });
}//end startEnglishAuction
