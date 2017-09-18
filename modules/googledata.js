var GoogleSpreadsheet  = require("google-spreadsheet");
var SiteData = {
  cards: []
};

function getThumbnailUrl(url){
  // var thumbMediaProcessorPrefix = "https://mediaprocessor.websimages.com/width/328/crop/0,0,283x211/";
  var thumbMediaProcessorPrefix = "https://mediaprocessor.websimages.com/width/350/";
  var smImg;

  if ( url.toLowerCase().indexOf("http://") > -1 ) {
    smImg = thumbMediaProcessorPrefix + url.substring("http://".length);
  }else if ( url.toLowerCase().indexOf("https://") > -1 ){
    smImg = thumbMediaProcessorPrefix + url.substring("https://".length);
  } else {
    smImg = url;
  }

  return smImg;
}


/**
* Load the Gallery cards
*/
function loadGaleryDetails(childrenDetails, next){
  console.log('Sheet: ' + SiteData.worksheets[0].title + ' [' + SiteData.worksheets[0].rowCount+' x '+SiteData.worksheets[0].colCount+']');

  SiteData.worksheets[0].getRows({
    offset: 1,
    orderby: 'id',
    'return-empty': false
  }, function( err, rows ){

    console.log('Read '+rows.length+' rows');
    SiteData.cards = [];

    rows.forEach(function(row){
      var card = {
          id: row.id,
          title: row.title,
          url: (!row.url ? defaultImgUrl : row.url),
          smUrl: getThumbnailUrl((!row.url ? defaultImgUrl : row.url)),
          desc: row.desc,
          category: row.category,
          imgs: ((childrenDetails[row.id] && row.category === "Architecture") ? childrenDetails[row.id] : [])
      };

      SiteData.cards.push(card);
    });


    // console.log("Data Initialized.");
    if (next){
      next();
    }

  });

}

/**
* Load the Architecture Project images
*/
function loadGaleryItemDetails(next){
  console.log('Sheet: ' + SiteData.worksheets[1].title+' ['+SiteData.worksheets[1].rowCount+' x '+SiteData.worksheets[1].colCount+']');

  SiteData.worksheets[1].getRows({
    offset: 1,
    orderby: 'parentid',
    'return-empty': false
  }, function( err, rows ){

    console.log('Read '+rows.length+' rows');
    var imgs = [];

    rows.forEach(function(row){
      if (imgs[row.parentid]){
        imgs[row.parentid].push(row.url);
      } else {
        imgs[row.parentid] = [row.url];
      }
    });


    // console.log("Data Initialized.");
    if (next){
      next(imgs, SiteData.notifyEndLoad);
    }

  });
}



//-- Add functions

/**
* Function to load the details from the google spreadsheet into the SiteData object
*/
SiteData.loadData = function( callback ) {

  //-- Save the exit callback as method
  SiteData.notifyEndLoad = callback;
  SiteData.worksheets = [];

  /*
  https://spreadsheets.google.com/feeds/list/1aMYaGdm-3XVFPtHNPF49RQknq84ViiT_l1YCv226jck/default/public/values?alt=json
  */
  var docId = "1aMYaGdm-3XVFPtHNPF49RQknq84ViiT_l1YCv226jck";
  var doc = new GoogleSpreadsheet(docId);
  var sheetGalery;
  var sheetChildren;

  // var defaultImgUrl = "https://dummyimage.com/283x211/f00/fff";
  var defaultImgUrl = "https://dummyimage.com/300x300/f00/fff";

  doc.getInfo(function(err, info) {
    if (!err){
      console.log('Loaded doc: '+info.title+' by '+info.author.email);

      //-- Image galery details
      SiteData.worksheets = info.worksheets;

      //-- Formar the nested data
      loadGaleryItemDetails(loadGaleryDetails, callback);

    }else{
      console.error(err);
    }

  });

}



//-- Export the SiteData objet
module.exports = SiteData;
