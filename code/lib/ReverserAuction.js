/**
 * Business Logic For Reverse Auction
 */
'use strict';

var ReverseAuctiontimeoutInterval = 1000;


/**Invkkoked when an reverse auction bid is places
 * @param {IN.AC.IIITB.ReverseAuction.PlaceReverseAuctionBid} placeBidTransaction
 * @transaction
 */
function onReverseAuctionBidPlaced( placeBidTransaction ) {
    
    var NS = "IN.AC.IIITB.ReverseAuction";
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

            if(  ( !auction.currentMinBid ) ||  ( auction.currentMinBid.bidValue > bidValue ) ){

                auction["currentMinBid"] = bid;
                auction.lastBidTimestamp = placeBidTransaction.timestamp;
                if( !auction.bids ){ // if bids array is not initialized
                    auction.bids = [];
                }                
                auction.bids.push( bid );
                return updateAssets( auction );
            }
            else{
                throw new Error( "Your Bid Should Be lesser than Current Min Bid." );
            }    

        }   
      }

    

    function updateAssets( auction, auctionItem ){

        return getAssetRegistry( NS + '.ReverseAuction' )
        .then(function ( reverseAuctionRegistery ) {
            // add the temp reading to the shipment
            return reverseAuctionRegistery.update( auction );
        })
        .then(function ( ) {//emt event about update asset

            var factory = getFactory();
            var bidPlaceEvent = factory.newEvent( NS , 'ReverseAuctionBidUpdate');
            bidPlaceEvent.bidValue = auction.currentMinBid.bidValue;
            bidPlaceEvent.bid = auction.currentMinBid;
            bidPlaceEvent.bids = auction.bids;  
            bidPlaceEvent.auction = auction;          
            return emit( bidPlaceEvent );

        });        

    }

}

/**Invoked start the auction
 * @param {IN.AC.IIITB.ReverseAuction.StartReverseAuction} startAuction
 * @transaction
 */
function onReverseAuctionStart( startAuction ) {

    var NS = "IN.AC.IIITB.ReverseAuction";
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

    return  getAssetRegistry( NS + '.ReverseAuctionItem' )//update auctionItem status
            .then(function ( reverseAuctionItemRegistry ) {
                return reverseAuctionItemRegistry.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.ReverseAuction' );
            })
            .then(function( reverseAuctionRegistry ){
                return reverseAuctionRegistry.update( auction );
            });             ;

}//end startReverseAuction


/**Invoked stop the auction
 * @param {IN.AC.IIITB.ReverseAuction.StopReverseAuction} stopAuction
 * @transaction
 */
function stopReverseAuction( stopAuction ) {
  
    var NS = "IN.AC.IIITB.ReverseAuction";
    var auction = stopAuction.auction;
    var auctionItem = auction.auctionItem;    

    if( auction.status == "FINISHED" ){
        throw new Error ( "Auction is ALready Over...!");
    }
    else if( auction.status == "CREATED" ){
        throw new Error ( "Auction is Not Started Yet...!" );
    }

    if( !auction.currentMaxBid ){
        auctionItem.status = "UNSOLD"; 
    }
    else{
        auctionItem.status = "SOLD"; 
    }

    auction.status = "FINISHED";   
    auction.auctionEndTime = stopAuction.timestamp;
    auction.winnerBid = auction.currentMaxBid;

    return  getAssetRegistry( NS + '.ReverseAuctionItem' )//update auctionItem status
            .then(function ( reverseAuctionItemRegistry ) {
                return reverseAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.ReverseAuction' );
            })
           .then(function( reverseAuctionRegistry ){
                return reverseAuctionRegistry.update( auction );
            })
            .then(function ( ) {//emt event about update asset

                var factory = getFactory();
                var stopAuctionEvent = factory.newEvent( NS , 'ReverseAuctionStopEvent');
                stopAuctionEvent.auction = auction;
                stopAuctionEvent.winnerBid = auction.currentMaxBid;
                return emit( stopAuctionEvent );
    
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
        throw new Error ( "Auction is not started yet..!" );
    }
    else if( auction.status == "IN_PROGRESS" ){
        throw new Error ( "Auction is IN_PROGRESS" );
    }

    auctionItem.status = "SOLD";
    auction.winnerBid = winnerBid;
    return  getAssetRegistry( NS + '.ReverseAuctionItem' )//update auctionItem status
            .then(function ( reverseAuctionItemRegistry ) {
                return reverseAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.ReverseAuction' );
            })
           .then(function( reverseAuctionRegistry ){
                return reverseAuctionRegistry.update( auction );
            });
            
}//end startReverseAuction
