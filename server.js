var express = require('express');
var mongo = require('mongodb');
var mongoose = require('mongoose');

var dns = require('dns');
var shortid = require('shortid');


var cors = require('cors');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));


/** this project needs a db !! **/ 
mongoose.connect(
  process.env.MONGOLAB_URI, 
    {useCreateIndex: true,useNewUrlParser: true,useUnifiedTopology: true },
     function(err, db) {  
    if (err) {
        console.log('Unable to connect to the server. Please start the server. Error1:', err);
    } else {
        console.log('Connected to Server successfully!');
    }
});

      var UrlShortenSchema = new mongoose.Schema({
        url:{
          type: String,
          unique: true
        },
        short_url_val: {
          type: String,
          unique: true
        },
         сreation_date: {
          type: Date,
          // `Date.now()` returns the current unix timestamp as a number
          default: Date.now
        }
      }
      );
       var UrlShortenModel = mongoose.model('UrlShortenModel',UrlShortenSchema);

// Basic Configuration 
var port = process.env.PORT || 3000;


app.use(cors());

/** this project needs to parse POST bodies **/
// you should mount the body-parser here

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

 
// your first API endpoint... 
app.post("/api/shorturl/new", function (req, res) {
  var url=req.body.url;
  //lets remove http of https to 
  //check if url invalid
  var bare_url=url.replace(/(^\w+:|^)\/\//, '');
  console.log('bare_url '+bare_url);
   dns.lookup(bare_url, function (err, addresses, family) {
      console.log('addresses'+addresses);
      console.log('err'+err);
     if(err!==''&&err!==null) {
         res.json({"error":"invalid URL"});
     } else {
       //connect to db     



      UrlShortenModel.findOne({url: url}, function(err,obj) { 
        if(obj==null) {
          //create show var
          var short_url_var_gen=shortid.generate();
          UrlShortenModel.create({ url: url,short_url_val:short_url_var_gen}, function (err, small) {
        if (err) return err;
        // saved!
      });
           res.json({"original_url":req.body.url,"short_url":short_url_var_gen});
        } else {
           res.json({"original_url":req.body.url,"short_url":obj.short_url_val});
        }
        //console.log("--"+obj+"--");console.log(obj); 
      });

      
     }
  });
  
});

app.get('/api/shorturl/:generated_url', function (req, res) {
  var short_url_var_gen = req.params.generated_url;
  
  //lets check if this `short_url_var_gen` is in DB
     
        UrlShortenModel.findOne({short_url_val:short_url_var_gen}, function(err,obj) { 
        if(obj==null) {
          //create show var         
           res.json({"error":"No short url found for given input"});
        } else {
          res.redirect(obj.url);
        }
      });
  //
})

app.listen(port, function () {
  console.log('Node.js listening ...');
});

