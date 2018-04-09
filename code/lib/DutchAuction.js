/**
 * Business Logic For Dutch Auction
 */
'use strict';

var DutchAuctiontimeoutInterval = 1000;


/**Invoked start the auction
 * @param {IN.AC.IIITB.DutchAuction.StartDutchAuction} startAuction
 * @transaction
 */
function onDutchAuctionStart( startAuction ) {
  
    var NS = "IN.AC.IIITB.DutchAuction";
    var auction = startAuction.auction;

    if( auction.status == "FINISHED" ){
        console.log("Auction is Already Over");
        return "Auction is Already Over...!";
    }
    else if( auction.status == "IN_PROGRESS" ){
        console.log("Auction is Already Running");
        return "Auction is Already Running...!";
    }

    auction.status = "IN_PROGRESS";
    auction.auctionStartTime = startAuction.timestamp;
    auction.currentprice = 10 * auction.auctionItem.basePrice; 

    //auction.auctionItem.auctionStartTime = startAuction.timestamp;//remove it later
    auction.auctionItem.status = "AUCTIONING";

    //emit event 
    
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



/**Invoked when an Dutch auction bid is accepts
 * @param {IN.AC.IIITB.DutchAuction.AcceptDutchAuctionBid} acceptTransaction
 * @transaction
 */

function onDutchAuctionAccept( acceptTransaction ) {
    console.log("onDutchAuctionBidaccepted", acceptTransaction);
    var NS = "IN.AC.IIITB.DutchAuction"; 
    var bid = acceptTransaction.bid; 
    //  var itemcount = bid.itemcount;
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
 
    var now = acceptTransaction.timestamp;
    var timeoutTime = new Date( auction.auctionStartTime) ;
       timeoutTime.setMinutes( timeoutTime.getMinutes() + 10 );

     
    if( auction.lastBidTimestamp ){
        console.log("your bid has not accepted !!! someone placed a early bid");
        throw new Error("your bid has not accepted !!! someone placed a early bid");
        
    }
    else if ( now > timeoutTime ) {  //no bid & times up
        console.log(" bid not accepted !!! auction has finished");
      	console.log(now," -> ",timeoutTime );
      	console.log("auction",auction);
          throw new Error(" bid not accepted !!! auction has finished");
     }
        
    
    //  bid accepted and item is sold   
    
    console.log("bid recieved !! ");
    
              auction.lastBidTimestamp = now;
              auction.currentMaxBid.bidValue = bidValue;
              auction.bids.push( bid );
              auctionItem.status = "SOLD";
              auction.winnerBid = bidValue;
              auction.status = "FINISHED";
              
           
              return  getAssetRegistry( NS + '.DutchAuctionItem' )//update auctionItem status
              .then(function ( DutchAuctionItemRegistry ) {
                  return DutchAuctionItemRegistry.update( auctionItem );
              })
              .then(function(){
                  return getAssetRegistry( NS + '.DutchAuction' );
              })
             .then(function( DutchAuctionRegistry ){
                  return DutchAuctionRegistry.update( auction );
              })
              .then(function ( ) {//emt event about update asset
  
                  var factory = getFactory();
                  var stopAuctionEvent = factory.newEvent( NS , 'DutchAuctionStopEvent');
                  stopAuctionEvent.auction = auction;
                  stopAuctionEvent.winnerBid = auction.currentMaxBid;
                  return emit( stopAuctionEvent );
      
              });

        }
    
    









/**Invoked stop the auction
 * @param {IN.AC.IIITB.DutchAuction.StopDutchAuction} stopAuction
 * @transaction
 */
function stopDutchAuction( stopAuction ) {
  
    var NS = "IN.AC.IIITB.DutchAuction";
    var auction = stopAuction.auction;
    var auctionItem = auction.auctionItem;    

    if( auction.status == "FINISHED" ){
        throw new Error ( "Auction is Already Over...!");
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

    return  getAssetRegistry( NS + '.DutchAuctionItem' )//update auctionItem status
            .then(function ( DutchAuctionItemRegistry ) {
                return DutchAuctionItemRegistry.update( auctionItem );
            })
            .then(function(){
                return getAssetRegistry( NS + '.DutchAuction' );
            })
           .then(function( DutchAuctionRegistry ){
                return DutchAuctionRegistry.update( auction );
            })
            .then(function ( ) {//emt event about update asset

                var factory = getFactory();
                var stopAuctionEvent = factory.newEvent( NS , 'DutchAuctionStopEvent');
                stopAuctionEvent.auction = auction;
                stopAuctionEvent.winnerBid = auction.currentMaxBid;
                return emit( stopAuctionEvent );
    
            });

}//end stopDutchAuction









/**Invoked status of auction currentprice
 * @param {IN.AC.IIITB.DutchAuction.GetCurrentStatusDutch} currentstatus
 * @transaction
 */
function CurrentStatus ( currentstatus ) {
  
    var NS = "IN.AC.IIITB.DutchAuction";
    var auction = currentstatus.auction; 


    if( auction.status == "FINISHED" ){
        throw new Error ( "Auction is Already Over...!");
    }
    else if( auction.status == "CREATED" ){
        throw new Error ( "Auction is Not Started Yet...!" );
    }
  // the logic i want to give to dutch auction

    var starttime = new Date( auction.auctionStartTime);
    var currenttime= new Date(currentstatus.timestamp);
    var diff = getminutes(currenttime -starttime);
    
    var currentprice = (10-diff)* auction.basePrice;
    auction.currentprice = currentprice;

    //logic end 


           return getAssetRegistry( NS + '.DutchAuction' )
           .then(function( DutchAuctionRegistry ){
                return DutchAuctionRegistry.update( auction );
            })
            .then(function ( ) {//emt event about update asset
                
                    var factory = getFactory();
                    var statusUpdateEvent = factory.newEvent( NS , 'DutchAuctionStatusUpdate');
                    statusUpdateEvent.currentprice = auction.currentprice;
                    statusUpdateEvent.auction = auction;          
                    return emit( statusUpdateEvent );
            });

}//end currentstatusDutch

