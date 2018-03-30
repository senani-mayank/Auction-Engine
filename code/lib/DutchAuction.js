/**
 * Business Logic For Reverse Auction
 */
'use strict';

var ReverseAuctiontimeoutInterval = 1000;


/**Invkkoked when an Reverse auction bid is places
 * @param {IN.AC.IIITB.ReverseAuction.PlaceReverseAuctionBid} placeBidTransaction
 * @transaction
 */
function onReverseAuctionBidPlaced( placeBidTransaction ) {
    console.log("onReverseAuctionBidPlaced", placeBidTransaction);
    var NS = "IN.AC.IIITB.ReverseAuction";
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

        return getAssetRegistry( NS + '.ReverseAuction' )
        .then(function ( ReverseAuctionRegistery ) {
            // add the temp reading to the shipment
            console.log("Auction Updated Successfully.!");
            return ReverseAuctionRegistery.update( auction );
        });
        /*
        .then(function() {
            return getAssetRegistry( NS + '.ReverseAuctionItem' );
        })
        .then(function( ReverseAuctionItemRegistery ) {
            // add the temp reading to the shipment
            console.log("Bid Placed Successfully.!");
            return ReverseAuctionItemRegistery.update(auctionItem);
        });
        */
        
    }


}

/**Invoked start the auction
 * @param {IN.AC.IIITB.ReverseAuction.StartReverseAuction} startAuction
 * @transaction
 */
function onReverseAuctionStart( startAuction ) {
  
    var NS = "IN.AC.IIITB.ReverseAuction";
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

    return  getAssetRegistry( NS + '.ReverseAuctionItem' )//update auctionItem status
            .then(function ( ReverseAuctionItemRegistry ) {
                console.log("Auction Item Updated Successfully.!");
                return ReverseAuctionItemRegistry.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.ReverseAuction' );
            })
            .then(function( ReverseAuctionRegistry ){
                console.log("Auction Updated Successfully.!");
                return ReverseAuctionRegistry.update( auction );
            });

}//end startReverseAuction


/**Invoked stop the auction
 * @param {IN.AC.IIITB.ReverseAuction.StopReverseAuction} stopAuction
 * @transaction
 */
function stopReverseAuction( stopAuction ) {
  
    var NS = "IN.AC.IIITB.ReverseAuction";
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

    return  getAssetRegistry( NS + '.ReverseAuction' )//update auctionItem status
            .then(function ( ReverseAuctionRegistry ) {
                console.log("Auction Updated Successfully.!");
                return ReverseAuctionRegistry.update( auction );
            });


}//end startReverseAuction



/**Invoked start the auction, assume auction status is set to finished
 * @param {IN.AC.IIITB.ReverseAuction.ReverseAuctionItemSold} itemSold
 * @transaction
 */
function onItemSold( itemSold ) {
  
    var NS = "IN.AC.IIITB.ReverseAuction";
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
    return  getAssetRegistry( NS + '.ReverseAuctionItem' )//update auctionItem status
            .then(function ( ReverseAuctionItemRegistry ) {
                console.log("1");
                return ReverseAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.ReverseAuction' );
            })
           .then(function( ReverseAuctionRegistry ){
                console.log("2");
                return ReverseAuctionRegistry.update( auction );
            });
}//end startReverseAuction
