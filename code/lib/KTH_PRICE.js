/**
 * Business Logic For Kth Price Auction
 */
'use strict';

var KTH_PRICEtimeoutInterval = 1000;


/**Invkkoked when an Kth Price auction bid is places
 * @param {IN.AC.IIITB.KTH_PRICE.PlaceKTH_PRICEBid} placeBidTransaction
 * @transaction
 */
function onKTH_PRICEBidPlaced( placeBidTransaction ) {
    
    var NS = "IN.AC.IIITB.KTH_PRICE";
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
    timeoutTime.setMinutes( timeoutTime.getMinutes() + 5 );

    if( ( !auction.lastBidTimestamp ) && ( now >= timeoutTime ) ){//no bid & times up
        throw new Error("no bid placed and auction time is up, item unsold");
    }
    else {

        if( !auction.lastBidTimestamp ){
            auction.lastBidTimestamp =  placeBidTransaction.timestamp;
        }

       // timeoutTime =  new Date( auction.lastBidTimestamp );
        //timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );

        if( auction.lastBidTimestamp && ( now >= timeoutTime ) ){//if last bid was placed 2 minutes before
            throw new Error("Time Out Has Occured, item is sold");
        }
        else{
            //if current bid is > maxbid till now
            if(  ( !auction.currentMaxBid ) ||  ( auction.currentMaxBid.bidValue <= bidValue )||  ( auction.currentMaxBid.bidValue > bidValue ) ){

                auction["currentMaxBid"] = bid;
               // auction.lastBidTimestamp = placeBidTransaction.timestamp;
                if( !auction.bids ){ // if bids array is not initialized
                    auction.bids = [];
                }
                auction.bids.push( bid );
                return updateAssets( auction );
            }
            else{
                throw new Error ("Your Bid Should Be Greater than Current Max Bid.");
            }
           
        }    

    }

    function updateAssets( auction, auctionItem ){

        return getAssetRegistry( NS + '.KTH_PRICE' )
        .then(function ( KTH_PRICERegistery ) {
            // add the temp reading to the shipment
            return KTH_PRICERegistery.update( auction );
        })
        .then(function ( ) {//emt event about update asset

            var factory = getFactory();
            var bidPlaceEvent = factory.newEvent( NS , 'KTH_PRICEBidUpdate');
            bidPlaceEvent.bidValue = auction.currentMaxBid.bidValue;
            bidPlaceEvent.bid = auction.currentMaxBid;
            bidPlaceEvent.bids = auction.bids;  
            bidPlaceEvent.auction = auction;          
            return emit( bidPlaceEvent );

        });        

    }

}


/**Invoked start the auction
 * @param {IN.AC.IIITB.KTH_PRICE.StartKTH_PRICE} startAuction
 * @transaction
 */
function onKTH_PRICEStart( startAuction ) {

    var NS = "IN.AC.IIITB.KTH_PRICE";
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

    return  getAssetRegistry( NS + '.KTH_PRICEItem' )//update auctionItem status
            .then(function ( KTH_PRICEItemRegistry ) {
                return KTH_PRICEItemRegistry.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.KTH_PRICE' );
            })
            .then(function( KTH_PRICERegistry ){
                return KTH_PRICERegistry.update( auction );
            });             ;

}//end startKTH_PRICE


/**Invoked stop the auction
 * @param {IN.AC.IIITB.KTH_PRICE.StopKTH_PRICE} stopAuction
 * @transaction
 */
function stopKTH_PRICE( stopAuction ) {
  
    var NS = "IN.AC.IIITB.KTH_PRICE";
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
    var k=auction.k;
    var n = auction.bids.legth;
    auction.bids.sort();
    auction.winnerBid = auction.bids[n-1];

    return  getAssetRegistry( NS + '.KTH_PRICEItem' )//update auctionItem status
            .then(function ( KTH_PRICEItemRegistry ) {
                return KTH_PRICEItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.KTH_PRICE' );
            })
           .then(function( KTH_PRICERegistry ){
                return KTH_PRICERegistry.update( auction );
            })
            .then(function ( ) {//emt event about update asset

                var factory = getFactory();
                var stopAuctionEvent = factory.newEvent( NS , 'KTH_PRICEStopEvent');
                stopAuctionEvent.auction = auction;
                stopAuctionEvent.winnerBid = auction.bids[n-1];
                return emit( stopAuctionEvent );
    
            });


}//end startKTH_PRICE



/**Invoked start the auction, assume auction status is set to finished
 * @param {IN.AC.IIITB.KTH_PRICE.KTH_PRICEItemSold} itemSold
 * @transaction
 */
function onItemSold( itemSold ) {
  
    var NS = "IN.AC.IIITB.KTH_PRICE";
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
    var kthbid;
    var k = auction.k; 
    auction.winnerBid = auction.bids[n-1];
       kthbid = auction.bids[n-k]; 
    return  getAssetRegistry( NS + '.KTH_PRICEItem' )//update auctionItem status
            .then(function ( KTH_PRICEItemRegistry ) {
                return KTH_PRICEItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.KTH_PRICE' );
            })
           .then(function( KTH_PRICERegistry ){
                return KTH_PRICERegistry.update( auction );
            });
            
}//end startKTH_PRICE