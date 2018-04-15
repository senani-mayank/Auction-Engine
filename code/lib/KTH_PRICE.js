/**
 * Business Logic For KthPrice Auction
 */
'use strict';

var KthPriceAuctiontimeoutInterval = 1000;


/**Invkkoked when an KthPrice auction bid is places
 * @param {IN.AC.IIITB.KthPriceAuction.PlaceKthPriceAuctionBid} placeBidTransaction
 * @transaction
 */
function onKthPriceAuctionBidPlaced( placeBidTransaction ) {
    
    var NS = "IN.AC.IIITB.KthPriceAuction";
    var bid = placeBidTransaction.bid;
    var bidder = bid.bidder;
    var auction = bid.auction;
    var auctionItem = auction.auctionItem;
    var bidValue = bid.bidValue;
  console.log(bidder.bidderId);
    if( auction.status == "CREATED" ){
        throw new Error("Auction Has Not Started Yet..!");
    }
    else if( auction.status == "FINISHED" ){
        throw new Error("This Auction is Over..!");
    }
  var i;
    //check if auction should be closed
    var now = placeBidTransaction.timestamp;
    var timeoutTime = new Date( auction.auctionStartTime) ;
    timeoutTime.setMinutes( timeoutTime.getMinutes() + 100);

    if( ( !auction.lastBidTimestamp ) && ( now >= timeoutTime ) ){//no bid & times up
        throw new Error("no bid placed and auction time is up, item unsold");
    }
    else {

        if( !auction.lastBidTimestamp ){
            auction.lastBidTimestamp =  placeBidTransaction.timestamp;
        }

       // timeoutTime =  new Date( auction.lastBidTimestamp );
       // timeoutTime.setMinutes( timeoutTime.getMinutes() + 2 );

        if( auction.lastBidTimestamp && ( now >= timeoutTime ) ){//if last bid was placed 2 minutes before
            throw new Error("Time Out Has Occured, item is sold");
        }
        else{
            //if current bid is > maxbid till now
           if(  ( !auction.currentMaxBid ) ||  ( auction.currentMaxBid.bidValue < bidValue ) ){

                auction["currentMaxBid"] = bid;
               // auction.lastBidTimestamp = placeBidTransaction.timestamp;
                if( !auction.bids ){ // if bids array is not initialized
                    auction.bids = [];
                  console.log("2");
                  auction.bids.push( bid );
                }
             else
             {   
                for( i=0; i<auction.bids.length;i++)
                        {   
                           console.log("length =" + auction.bids.length);
                          console.log(bidder.bidderId);
                          console.log(auction.bids[i].bidder.bidderId);
                        //  console.log(auction.bids[i]);
                             if(bidder.bidderId == auction.bids[i].bidder.bidderId)
                             {  
                                throw new Error ("Bidder has already placed bid");
                             }
                          //else 
                         // { auction.bids.push( bid );
                           //     console.log("j");
                          //}
                        }
             }
                 console.log("4");
                auction.bids.push( bid );
               console.log(5);
                return updateAssets( auction );
            console.log(6);
            }
            else{
                if( !auction.bids ){ // if bids array is not initialized
                    auction.bids = [];
                  console.log("l");
                  auction.bids.push(bid);
                }
                else {
                        for( i=0; i<auction.bids.length;i++)
                        {   
                           console.log("length =" + auction.bids.length);
                          console.log(bidder.bidderId);
                          console.log(auction.bids[i].bidder.bidderId);
                        //  console.log(auction.bids[i]);
                             if(bidder.bidderId == auction.bids[i].bidder.bidderId)
                             {  
                                throw new Error ("Bidder has already placed bid");
                             }
                          //else 
                         // { auction.bids.push( bid );
                           //     console.log("j");
                          //}
                        }
                auction.bids.push( bid );
               console.log("j");
                }
                return updateAssets( auction );       
                //   throw new Error ("Your Bid Should Be Greater than Current Max Bid.");
            }
           console.log("3");
        }    

    }

    function updateAssets( auction, auctionItem ){

        return getAssetRegistry( NS + '.KthPriceAuction' )
        .then(function ( KthPriceAuctionRegistery ) {
            // add the temp reading to the shipment
            return KthPriceAuctionRegistery.update( auction );
        })
        .then(function ( ) {//emt event about update asset

            var factory = getFactory();
            var bidPlaceEvent = factory.newEvent( NS , 'KthPriceAuctionBidUpdate');
          console.log("a");
        //   bidPlaceEvent.bidValue = bid.bidValue;
           // bidPlaceEvent.bid = bid;
            bidPlaceEvent.bids = auction.bids;  
          console.log("b");
            bidPlaceEvent.auction = auction;
          console.log("c");
            return emit( bidPlaceEvent );
          

        });        

    }

}


/**Invoked start the auction
 * @param {IN.AC.IIITB.KthPriceAuction.StartKthPriceAuction} startAuction
 * @transaction
 */
function onKthPriceAuctionStart( startAuction ) {

    var NS = "IN.AC.IIITB.KthPriceAuction";
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

    return  getAssetRegistry( NS + '.KthPriceAuctionItem' )//update auctionItem status
            .then(function ( KthPriceAuctionItemRegistry ) {
                return KthPriceAuctionItemRegistry.update( auction.auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.KthPriceAuction' );
            })
            .then(function( KthPriceAuctionRegistry ){
                return KthPriceAuctionRegistry.update( auction );
            });             ;

}//end startKthPriceAuction


/**Invoked stop the auction
 * @param {IN.AC.IIITB.KthPriceAuction.StopKthPriceAuction} stopAuction
 * @transaction
 */
function stopKthPriceAuction( stopAuction ) {
  
    var NS = "IN.AC.IIITB.KthPriceAuction";
    var auction = stopAuction.auction;
    var auctionItem = auction.auctionItem;    
  // var bidValue = stopAuction.b.bidValue;
    if( auction.status == "FINISHED" ){
        throw new Error ( "Auction is ALready Over...!");
    }
    else if( auction.status == "CREATED" ){
        throw new Error ( "Auction is Not Started Yet...!" );
    }
  console.log("c");
//  console.log(bidValue);
    if( !auction.currentMaxBid )//|| auction.currentMaxBid.bidValue>0)
    {
        auctionItem.status = "UNSOLD"; 
       console.log("xxxxx");
    }
    else{
        auctionItem.status = "SOLD"; 
       console.log("sam");
    }
     var n = auction.bids.length;
  console.log("x");
     var k = auction.k;
  console.log("k=" + k );
    //  auction.bids.sort();
    var bidvalue = [];
 
   for( i=0; i<auction.bids.length;i++)
   {
      bidvalue[i] = auction.bids[i].bidValue ;
     //console.log("yahooo=" + bidvalue[i]);
   }
  bidvalue.sort();
  var AmountToPay = 0;
  for( i=0; i<auction.bids.length;i++)
   {
     
     console.log("yahooo=" + bidvalue[i]);
   }
  var ctr=0;
  if(auction.bids.length>=2)
  {
  if(bidvalue[0]>bidvalue[1])
  {   
       for( i=0; i<auction.bids.length;i++)
       { 
           
               if(ctr==k-1)
               {  
                 AmountToPay=bidvalue[i]
                 break;
               }
              ctr++;
               if(bidvalue[i]==bidvalue[i+1])
               {  ctr--;
               }
          
       }
     if(AmountToPay == 0)
    {
        AmountToPay = bidvalue[auction.bids.length-1];
    }
  }
    else
    {
         for( i=0; i<auction.bids.length;i++)
       { 
           
               if(ctr==k-1)
               {  
                 AmountToPay=bidvalue[i]
                 break;
               }
              ctr++;
               if(bidvalue[i]==bidvalue[i+1])
               {  ctr--;
               }
          
       }
     if(AmountToPay == 0)
    {
        AmountToPay = bidvalue[auction.bids.length-1];
    }
    }
   
  }
  console.log("amounttopay="  + AmountToPay);
    auction.status = "FINISHED";   
    console.log("x");
    auction.auctionEndTime = stopAuction.timestamp;
    auction.winnerBid = auction.currentMaxBid;
    console.log("x");
  

    return  getAssetRegistry( NS + '.KthPriceAuctionItem' )//update auctionItem status
            .then(function ( KthPriceAuctionItemRegistry ) {
                return KthPriceAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.KthPriceAuction' );
            })
           .then(function( KthPriceAuctionRegistry ){
                return KthPriceAuctionRegistry.update( auction );
            })
            .then(function ( ) {//emt event about update asset

                var factory = getFactory();
                var stopAuctionEvent = factory.newEvent( NS , 'KthPriceAuctionStopEvent');
                stopAuctionEvent.auction = auction;
                stopAuctionEvent.AmountToPay = AmountToPay;
                stopAuctionEvent.winnerBid = auction.winnerBid;
       console.log("s");
           //     stopAuctionEvent.winnerBid = auction.currentMaxBid;
       console.log("s");         
      return emit( stopAuctionEvent );
         console.log("s");
    
            });


}//end startKthPriceAuction



/**Invoked start the auction, assume auction status is set to finished
 * @param {IN.AC.IIITB.KthPriceAuction.KthPriceAuctionItemSold} itemSold
 * @transaction
 */
function onItemSold( itemSold ) {
  
    var NS = "IN.AC.IIITB.KthPriceAuction";
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
    return  getAssetRegistry( NS + '.KthPriceAuctionItem' )//update auctionItem status
            .then(function ( KthPriceAuctionItemRegistry ) {
                return KthPriceAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.KthPriceAuction' );
            })
           .then(function( KthPriceAuctionRegistry ){
                return KthPriceAuctionRegistry.update( auction );
            });
            
}//end startKthPriceAuction

