/* This code is responsible for servicing Infinforge RESTful API calls.
 * The server is started on port 8080 and to access the application use
 * The base route '/api/'
 */
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const blenderConnect = require('./blenderConnect.js');

let app = express();
let server;
const API_PORT = 8080;
const API_BASE_ROUTE = '/api/';

app.use( express.static('./www') );

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

function StartRESTAPI() {    
    
    // Set up base endpoint
    app.get(API_BASE_ROUTE, (req, res) => {
        res.send('Welcome to the Infiniforge RESTful API!\n' + 
                'Here you can issue requests for information\n');
    });

	// Request for a weapon mesh without providing a seed value
    app.get(API_BASE_ROUTE + 'forge/:weaponType/:weaponStyle/', (req, res) => {
        
        console.log(req.params);
        
        var reqFilePath = blenderConnect.issueRenderRequest(req.params);
				
		var contents = fs.readFileSync("./json/" + reqFilePath);
        //var contents = fs.readFileSync("./json/plane.json");
        //var contents = fs.readFileSync("./src/rest-api/longsword.json");

        var jsonContent = JSON.parse(contents);
        jsonContent.weapon_type = req.params.weaponType;
        jsonContent.weapon_style = req.params.weaponStyle;
        jsonContent.scale = ( jsonContent.scale !== undefined ) ? 1.0 / json.scale : 1.0;
        var jsonString = JSON.stringify(jsonContent);
        res.json(jsonContent);
    });

// Request for a weapon mesh, providing a seed value
    app.get(API_BASE_ROUTE + 'forge/:weaponType/:weaponStyle/:seed/', (req, res) => {
        
        console.log(req.params);

        var reqFilePath = blenderConnect.issueRenderRequest(req.params);

        var contents = fs.readFileSync("./json/" + reqFilePath);
        //var contents = fs.readFileSync("./src/rest-api/plane.json");
        //var contents = fs.readFileSync("./json/bustersword.json");

        var jsonContent = JSON.parse(contents);
        jsonContent.weapon_type = req.params.weaponType;
        jsonContent.weapon_style = req.params.weaponStyle;
        jsonContent.scale = ( jsonContent.scale !== undefined ) ? 1.0 / json.scale : 1.0;
        var jsonString = JSON.stringify(jsonContent);
        res.json(jsonContent);
    });
    
    app.on('error', () => {    });
    
    // Starts the base endpoint
    server = app.listen(API_PORT, () => {
        console.log(colors.green(`\nREST API started on port ${API_PORT}. Access using ${API_BASE_ROUTE}.`));
    });
}

StartRESTAPI();
