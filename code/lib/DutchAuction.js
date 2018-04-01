/**
 * Business Logic For Dutch Auction
 */
'use strict';

var DutchAuctiontimeoutInterval = 1000;


/**Invkkoked when an Dutch auction bid is accepts
 * @param {IN.AC.IIITB.DutchAuction.AcceptDutchAuctionBid} closeBidTransaction
 * @transaction
 */
function onDutchAuctionAccept( closeBidTransaction ) {
    console.log("onDutchAuctionBidacceptd", closeBidTransaction);
    var NS = "IN.AC.IIITB.DutchAuction"; 
    var bid = closeBidTransaction.bid;
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

    var now = acceptBidTransaction.timestamp;
    var timeoutTime = new Date( auction.auctionStartTime) ;
    timeoutTime.setMinutes( timeoutTime.getMinutes() + 20 );

    if( ( auction.lastBidTimestamp ) || ( now >= timeoutTime ) ){//no bid & times up
        console.log("no bid acceptd and auction time is up, item unsold");
      	console.log(now," -> ",timeoutTime );
      	console.log("auction",auction);
        return;
    }
    else {

        if( !auction.lastBidTimestamp ){
            auction.lastBidTimestamp =  acceptBidTransaction.timestamp;
        }

        console.log("bid recieved !! no further bids accepted");


       /* my logic for dutch decrement (if needed) 


        var bidtimediff = Double( now - auction.auctionStartTime);
        var bidactualprice=  ((20 - bidtimediff)%2) * auctionItem.basePrice;
        auction.bid.bidValue= bidactualprice;


        */
        
                auction.currentMaxBid.bidValue = bidValue;
                auction.bids.push( bid );
                return getAssetRegistry( NS + '.DutchAuction' )
                .then(function ( DutchAuctionRegistry ) {
                    console.log("Auction Updated Successfully.!");
                    return DutchAuctionRegistry.update( auction );
                });  
        }
    }
    





/**Invoked start the auction
 * @param {IN.AC.IIITB.DutchAuction.StartDutchAuction} startAuction
 * @transaction
 */
function onDutchAuctionStart( startAuction ) {
  
    var NS = "IN.AC.IIITB.DutchAuction";
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
    
   return  getAssetRegistry( NS + '.DutchAuctionItem' )//update auctionItem status
            .then(function ( DutchAuctionItemRegistry ) {
                console.log("Auction Item Updated Successfully.!");
                return DutchAuctionItemRegistry.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.DutchAuction' );
            })
            .then(function( DutchAuctionRegistry ){
                console.log("Auction Updated Successfully.!");
                return DutchAuctionRegistry.update( auction );
            });
    
            

}//end startDutchAuction


/**Invoked stop the auction
 * @param {IN.AC.IIITB.DutchAuction.StopDutchAuction} stopAuction
 * @transaction
 */
function stopDutchAuction( stopAuction ) {
  
    var NS = "IN.AC.IIITB.DutchAuction";
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

    return  getAssetRegistry( NS + '.DutchAuction' )//update auctionItem status
            .then(function ( DutchAuctionRegistry ) {
                console.log("Auction Updated Successfully.!");
                return DutchAuctionRegistry.update( auction );
            });


}//end stopDutchAuction



/**Invoked start the auction, assume auction status is set to finished
 * @param {IN.AC.IIITB.DutchAuction.DutchAuctionItemSold} itemSold
 * @transaction
 */
function onItemSold( itemSold ) {
  
    var NS = "IN.AC.IIITB.DutchAuction";
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
    return  getAssetRegistry( NS + '.DutchAuctionItem' )//update auctionItem status
            .then(function ( DutchAuctionItemRegistry ) {
                console.log("1");
                return DutchAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.DutchAuction' );
            })
           .then(function( DutchAuctionRegistry ){
                console.log("2");
                return DutchAuctionRegistry.update( auction );
            });
}//end itemsold
