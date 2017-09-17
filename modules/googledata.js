var GoogleSpreadsheet  = require("google-spreadsheet");
var SiteData = {
  imgs: []
};

function getThumbnailUrl(url){
  // var thumbMediaProcessorPrefix = "https://mediaprocessor.websimages.com/width/328/crop/0,0,283x211/";
  var thumbMediaProcessorPrefix = "https://mediaprocessor.websimages.com/width/300/";
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




//-- Add functions

/**
* Function to load the details from the google spreadsheet into the SiteData object
*/
SiteData.loadData = function( callback ) {
  /*
  https://docs.google.com/spreadsheets/d/1aMYaGdm-3XVFPtHNPF49RQknq84ViiT_l1YCv226jck/edit?usp=sharing
  https://spreadsheets.google.com/feeds/list/1aMYaGdm-3XVFPtHNPF49RQknq84ViiT_l1YCv226jck/default/public/values?alt=json
  */
  var docId = "1aMYaGdm-3XVFPtHNPF49RQknq84ViiT_l1YCv226jck";
  var doc = new GoogleSpreadsheet(docId);
  var sheet;

  // var defaultImgUrl = "https://dummyimage.com/283x211/f00/fff";
  var defaultImgUrl = "https://dummyimage.com/300x300/f00/fff";

  doc.getInfo(function(err, info) {
    if (!err){
      console.log('Loaded doc: '+info.title+' by '+info.author.email);

      //-- Image galery details
      sheet = info.worksheets[0];
      console.log('Sheet 1: '+sheet.title+' ['+sheet.rowCount+' x '+sheet.colCount+']');

      sheet.getRows({
        offset: 1,
        orderby: 'id',
        'return-empty': false
      }, function( err, rows ){

        console.log('Read '+rows.length+' rows');
        SiteData.imgs = [];

        rows.forEach(function(row){
          var card = {
              id: row.id,
              title: row.title,
              url: (!row.url ? defaultImgUrl : row.url),
              smUrl: getThumbnailUrl((!row.url ? defaultImgUrl : row.url)),
              width: row.width,
              height: row.height,
              desc: row.desc,
              category: row.category };
          SiteData.imgs.push(card);
        });

        // console.log("Data Initialized.");
        if (callback){
          callback();
        }

      });

    }else{
      console.error(err);
    }

  });

}



//-- Export the SiteData objet
module.exports = SiteData;
