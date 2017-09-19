var GoogleSpreadsheet  = require("google-spreadsheet");
var SiteData = {
  cards: []
};



function getDefaultImage(width, height){
  let defaultImgUrl = "https://dummyimage.com/"+width+"x"+height+"/000/fff";
  return defaultImgUrl;
}


function smallImage(url){
  let size = 350;
  let format = "jpg";
  let quality = 80;
  return resizeImage( (!url ? getDefaultImage(size, size) : url), size, size, format, quality);
}

function fullImage(url){
  let size = 640;
  let format = "jpg";
  let quality = 100;
  return resizeImage( (!url ? getDefaultImage(size, size) : url), size, size, format, quality);
}

function resizeImage(imgUrl, width, height, format, quality){
  let url = "https://zimage.global.ssl.fastly.net/?url="+imgUrl+"&w="+width+"&h="+height+"&format=" + format+"&quality="+quality;
  return url;
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

      if (!err){
        console.log('Read '+rows.length+' rows');
        SiteData.cards = [];

        rows.forEach(function(row){
          var card = {
              id: row.id,
              title: row.title,
              url: fullImage(row.url),
              smUrl: smallImage(row.url),
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

    if (!err){
        console.log('Read '+rows.length+' rows');
        var imgs = [];

        rows.forEach(function(row){
          if (imgs[row.parentid]){
            imgs[row.parentid].push( fullImage(row.url) );
          } else {
            imgs[row.parentid] = [ fullImage(row.url) ];
          }
        });

        // console.log("Data Initialized.");
        if (next){
          next(imgs, SiteData.notifyEndLoad);
        }
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
