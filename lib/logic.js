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
    var auction = bid.auction;
    var auctionItem = auction.auctionItem;
    var bidValue = bid.bidValue;

    if( auction.status == "CREATED" ){
        console.log("Auction Has Not Started Yet..!");
        return "Auction Has Not Started Yet..!";
    }
    else if( auction.status == "CLOSED" ){
        console.log("This Auction is Over..!");
        return "This Auction is Over..!";
    }

    //check if auction should be closed
    var now = new Date().getTime()
    var timeoutTime =  new Date( auctionItem.auctionStartTime );
    timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );
    if( ( !auctionItem.lastBidTimestamp ) && ( now >= timeoutTime.getTime() ) ){//no bid & times up
        console.log("no bid placed and auction time is up, item unsold");
        return;
    }
    else {

        timeoutTime =  new Date( auctionItem.lastBidTimestamp );
        timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );

        if( auctionItem.lastBidTimestamp && ( now >= timeoutTime.getTime() ) ){
            console.log("Time Out Has Occured, item is sold");
            return;
        }
        else{
            //if current bid is > maxbid till now
            if(  ( !auctionItem.currentMaxBid ) ||  ( auctionItem.currentMaxBid > bidValue ) ){
                auctionItem.currentMaxBid = bid;
                auctionItem.lastBidTimestamp = bid.timestamp;
                return updateAssets( aucton, auctionItem );
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


}

/**Invoked start the auction
 * @param {IN.AC.IIITB.StartEnglishAuction} startEnglishAuction
 * @transaction
 */
function startEnglishAuction( startAuction ) {
  
    var NS = "IN.AC.IIITB";
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
    auction.auctionItem.auctionStartTime = startAuction.timestamp;

    return  getAssetRegistry( NS + '.EnglishAuctionItem' )//update auctionItem status
            .then(function ( englishAuctionItemRegistery ) {
                console.log("Auction Item Updated Successfully.!");
                return englishAuctionItemRegistery.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.EnglishAuction' );
            })
            .then(function( englishAuctionRegistry ){
                console.log("Auction Updated Successfully.!");
                return englishAuctionRegistry.update( auction );
            });

}//end startEnglishAuction
