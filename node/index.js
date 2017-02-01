/* This code is responsible for servicing Infinforge RESTful API calls.
 * The server is started on port 8080 and to access the application use
 * The base route '/api/'
 */
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const blenderConnect = require('./blenderConnect.js');
const weaponTemplates = require('./weapontemplates.js');

let app = express();
let server;
const API_PORT = 8080;
const API_BASE_ROUTE = '/api/';

app.use( express.static('./www') );

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Given the filename for a json file,
// it returns the JSON string to be sent back to
// the requester
function GenerateJSONResponse(filename, weaponType, weaponStyle) {
    var contents = fs.readFileSync("./json/" + filename);

    var jsonContent = JSON.parse(contents);
    jsonContent.weapon_type = weaponType;
    jsonContent.weapon_style = weaponStyle;
    jsonContent.scale = ( jsonContent.scale !== undefined ) ? 1.0 / json.scale : 1.0;
    
    return JSON.stringify(jsonContent);
}

// Generates a unique filename Given
// an Ip address
function GenerateFileName(ip) {
    // Get the ip of the system that made the request
    // and replace the periods with dashes
    var requestingIp = ip.replace(".","-").replace(":","-");
    // Get the current time as a string
    var d = new Date();
    var timeString = d.toISOString().replace(":","-");
    // Concatenate the two to make a unique filename
    var filename = requestingIp + timeString + ".json";

    return filename;
}

function StartRESTAPI() {    
    
    // Set up base endpoint
    app.get(API_BASE_ROUTE, (req, res) => {
        res.send('Welcome to the Infiniforge RESTful API!\n' + 
                'Here you can issue requests for information\n');
    });

	// Request for a weapon mesh without providing a seed value
    app.get(API_BASE_ROUTE + 'forge/:weaponType/:weaponStyle/', (req, res) => {
        console.log(req.ip);
        console.log(req.params);
        var templateData = weaponTemplates.getWeaponTemplate(req.params.weaponType,req.params.weaponStyle)
        if (templateData == null) {
            res.status(500).send("Invalid weapon type and/or style");
        }
        var filename = GenerateFileName(req.ip);

        var reqFilePath = blenderConnect.issueRenderRequest(filename, "", templateData);

        var respJson = GenerateJSONResponse(filename,req.params.weaponType,req.params.weaponStyle);
				
        res.json(respJson);
    });

    // Request for a weapon mesh, providing a seed value
    app.get(API_BASE_ROUTE + 'forge/:weaponType/:weaponStyle/:seed/', (req, res) => {
        console.log(req.params);
        var templateData = weaponTemplates.getWeaponTemplate(req.params.weaponType,req.params.weaponStyle)
        if (templateData == null) {
            res.status(500).send("Invalid weapon type and/or style");
        }

        var filename = GenerateFileName(req.ip);

        var reqFilePath = blenderConnect.issueRenderRequest(filename, seed, templateData);

        var respJson = GenerateJSONResponse(filename,req.params.weaponType,req.params.weaponStyle);
				
        res.json(respJson);
    });
    
    // Handles errors
    app.on('error', () => {    });
    
    // Starts the base endpoint
    server = app.listen(API_PORT, () => {
        console.log(colors.green(`\nREST API started on port ${API_PORT}. Access using ${API_BASE_ROUTE}.`));
    });
}

StartRESTAPI();
