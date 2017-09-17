var express     = require("express");
var bodyParser  = require("body-parser");
var siteData    = require("./modules/googledata.js")


//-- Initialize App
var app = express();

//-- Activate folder to serve static content
app.use(express.static("public"));


/** bodyParser.urlencoded(options)
 * Parses the text as URL encoded data (which is how browsers tend to send form data from regular forms set to POST)
 * and exposes the resulting object (containing the keys and values) on req.body
 */
app.use(bodyParser.urlencoded({
    extended: true
}));

/**bodyParser.json(options)
 * Parses the text as JSON and exposes the resulting object on req.body.
 */
app.use(bodyParser.json());


//-- Initialize the data for the website from google spreadsheets
console.log("siteData initializing...");
siteData.loadData(function(){
  console.log("siteData initialization completed.");
  console.log(siteData);
});

//-- Set Up the periodic refresh from teh
setInterval(function(){
  console.log("Refresh siteData on Interval...");
  siteData.loadData(function(){
    console.log("siteData refresh on Interval completed.");
    // console.log(siteData);
  });

}, 30000);



//-- Routes
app.get("/", function(req, res){
  res.render("home.ejs", {siteData: siteData});
});


//-----------------------------
//-- Start the app
//-----------------------------
app.listen(process.env.PORT || 3000, process.env.IP, function(){
    console.log("Server listeninig at " + (process.env.PORT || 3000));
});
