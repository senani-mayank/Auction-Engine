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

    if( auction.status == "FINISHED" ){
      console.log("Auction is ALready Over");
        return "Auction is ALready Over...!";
    }
    else if( auction.status == "IN_PROGRESS" ){
      console.log("Auction is ALready Running");
        return "Auction is Already Running...!";
    }

    auction.status = "IN_PROGRESS";
    return  getAssetRegistry( NS + '.EnglishAuction' )//update auction status
            .then(function ( englishAuctionRegistery ) {
                console.log("Auction Updated Successfully.!");
                return englishAuctionRegistery.update( auction );
            });

}//end startEnglishAuction
