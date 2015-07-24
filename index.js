var express = require('express');
var app = express();
var path = require('path');

app.set('port', (process.env.PORT || 8080));

// NPM Includes
var Converter = require("csvtojson").Converter;
var fs = require("fs"); 
var csvFileName = "./listings.csv";

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/listings', function(req, res){

    //new converter instance
    var csvConverter=new Converter();

    // The minimum listing price in dollars.
    var min_price = req.query.min_price;

    // The maximum listing price in dollars.
    var max_price = req.query.max_price;

    // The minimum number of bedrooms.
    var min_bed = req.query.min_bed;

    // The maximum number of bedrooms.
    var max_bed = req.query.max_bed;

    // The minimum number of bathrooms.
    var min_bath = req.query.min_bath;

    // The maximum number of bathrooms. 
    var max_bath = req.query.max_bath;

    //end_parsed will be emitted once parsing finished
    csvConverter.on("end_parsed",function(jsonObj){

        var filteredItems = jsonObj.filter(function(item){
            
            if(min_price > item.price && min_price != undefined){
                return false;
            }else if(max_price < item.price && max_price != undefined){
                return false;
            }else if(min_bed > item.bedrooms && min_bed != undefined){
                return false;
            }else if(max_bed < item.bedrooms && max_bed != undefined){
                return false;
            }else if(min_bath > item.bathrooms && min_bath != undefined){
                return false;
            }else if(max_bath < item.bathrooms && max_bath != undefined){
                return false;
            }else{
                return true;
            }
        });

        var result = {"type":"FeatureCollection", "features":[]};
        for (var i = filteredItems.length - 1; i >= 0; i--) {
            result.features.push({
                "type": "feature",
                "geometry": {"type": "Point", "coordinates":[filteredItems[i].lat, filteredItems[i].lng]},
                "properties": {
                    "id": filteredItems[i].id,
                    "price": filteredItems[i].price,
                    "street": filteredItems[i].street,
                    "bedrooms": filteredItems[i].bedrooms,
                    "bathrooms": filteredItems[i].bathrooms,
                    "sq_ft": filteredItems[i].sq_ft
                }
            });
        }

        res.send(result);

    });

    fs.createReadStream(csvFileName).pipe(csvConverter);
    
});

app.listen(app.get('port'), function(){
    console.log('Node app is running on port', app.get('port'));
});