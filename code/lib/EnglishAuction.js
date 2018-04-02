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
    
    var NS = "IN.AC.IIITB.EnglishAuction";
    var bid = placeBidTransaction.bid;
    var bidder = bid.bidder;
    var auction = bid.auction;
    var auctionItem = auction.auctionItem;
    var bidValue = bid.bidValue;

    if( auction.status == "CREATED" ){
        throw new Error("Auction Has Not Started Yet..!");
    }
    else if( auction.status == "FINISHED" ){
        throw new Error("This Auction is Over..!");
    }

    //check if auction should be closed
    var now = placeBidTransaction.timestamp;
    var timeoutTime = new Date( auction.auctionStartTime) ;
    timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );

    if( ( !auction.lastBidTimestamp ) && ( now >= timeoutTime ) ){//no bid & times up
        throw new Error("no bid placed and auction time is up, item unsold");
    }
    else {

        if( !auction.lastBidTimestamp ){
            auction.lastBidTimestamp =  placeBidTransaction.timestamp;
        }

        timeoutTime =  new Date( auction.lastBidTimestamp );
        timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );

        if( auction.lastBidTimestamp && ( now >= timeoutTime ) ){//if last bid was placed 2 minutes before
            throw new Error("Time Out Has Occured, item is sold");
        }
        else{
            //if current bid is > maxbid till now
            if(  ( !auction.currentMaxBid ) ||  ( auction.currentMaxBid.bidValue < bidValue ) ){

                auction["currentMaxBid"] = bid;
                auction.lastBidTimestamp = placeBidTransaction.timestamp;
                if( !auction.bids ){ // if bids array is not initialized
                    auction.bids = [];
                }
                auction.bids.push( bid );
                return updateAssets( auction );
            }
            else{
                throw new Error ("Your Bid Should Be Grater than Current Max Bid.");
            }
           
        }    

    }

    function updateAssets( auction, auctionItem ){

        return getAssetRegistry( NS + '.EnglishAuction' )
        .then(function ( englishAuctionRegistery ) {
            // add the temp reading to the shipment
            return englishAuctionRegistery.update( auction );
        })
        .then(function ( ) {//emt event about update asset

            var factory = getFactory();
            var bidPlaceEvent = factory.newEvent( NS , 'EnglishAuctionBidUpdate');
            bidPlaceEvent.bid = auction.currentMaxBid;
            return emit( bidPlaceEvent );

        });        

    }

}

/**Invoked start the auction
 * @param {IN.AC.IIITB.EnglishAuction.StartEnglishAuction} startAuction
 * @transaction
 */
function onEnglishAuctionStart( startAuction ) {

    var NS = "IN.AC.IIITB.EnglishAuction";
    //var factory = getFactory();
    //var bidPlaceEvent = factory.newEvent( NS , 'testEvent');
   // emit(bidPlaceEvent);
   
    var auction = startAuction.auction;

    if( auction.status == "FINISHED" ){
        throw new Error ( "Auction is ALready Over...!" );
    }
    else if( auction.status == "IN_PROGRESS" ){
        throw new Error ( "Auction is Already Running...!" );
    }

    auction.status = "IN_PROGRESS";
    auction.auctionStartTime = startAuction.timestamp;
    auction.auctionItem.status = "AUCTIONING";

    return  getAssetRegistry( NS + '.EnglishAuctionItem' )//update auctionItem status
            .then(function ( englishAuctionItemRegistry ) {
                return englishAuctionItemRegistry.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.EnglishAuction' );
            })
            .then(function( englishAuctionRegistry ){
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
        throw new Error ( "Auction is ALready Over...!");
    }
    else if( auction.status == "CREATED" ){
        throw new Error ( "Auction is Not Started Yet...!" );
    }

    auction.status = "FINISHED";
    auction.auctionEndTime = stopAuction.timestamp;

    return  getAssetRegistry( NS + '.EnglishAuction' )//update auctionItem status
            .then(function ( englishAuctionRegistry ) {
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
        throw new Error ( "Auction is not started yet..!" );
    }
    else if( auction.status == "IN_PROGRESS" ){
        throw new Error ( "Auction is IN_PROGRESS" );
    }

    auctionItem.status = "SOLD";
    auction.winnerBid = winnerBid;
    return  getAssetRegistry( NS + '.EnglishAuctionItem' )//update auctionItem status
            .then(function ( englishAuctionItemRegistry ) {
                return englishAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.EnglishAuction' );
            })
           .then(function( englishAuctionRegistry ){
                return englishAuctionRegistry.update( auction );
            });
            
}//end startEnglishAuction
