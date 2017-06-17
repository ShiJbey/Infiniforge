/* This code is responsible for servicing Infinforge RESTful API calls.
 * The server is started on port 8080.
 * To access the procedural generation services use the base route '/api/'
 * to display instructions on how to use the api
 */
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const weaponTemplates = require('./weapontemplates.js');
const SwordGen = require('./swordgen.js');
const logger = require('./logmanager.js');
const EventEmitter = require('events');

let app = express();
let server;
const API_PORT = 8080;
const API_BASE_ROUTE = '/api/';

app.use('/api/sandbox/', express.static(__dirname));
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));


function StartRESTAPI() {

    // Sends the html file outlining how to use the API
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname + '/index.html'));
        console.log("Help page served...");
    });
    
    // Sends the html file outlining how to use the API
    app.get(API_BASE_ROUTE, (req, res) => {
        res.sendFile(path.join(__dirname + '/index.html'));
        console.log("Help page served...");
    });

    // Sends the html file outlining how to use the API
    app.get(API_BASE_ROUTE + 'sandbox', (req, res) => {
        res.sendFile(path.join(__dirname + '/forge.html'));
        console.log("Sandbox page served...");
    });

	// Request for a weapon mesh without providing a seed value
    app.get(API_BASE_ROUTE + 'forge/:weaponType/:weaponStyle/', (req, res) => {
        // Load in the template data
        var templateData = weaponTemplates.getWeaponTemplate(req.params.weaponType,req.params.weaponStyle)
        
        // Return an error if no template was found
        if (templateData == null) {
            res.status(500).send("Invalid weapon type and/or style");
        }

        // No seed was given so we pass the current time
        var cd = new Date();
        seedVal = cd.toString();

        // Create a new sword Generator for this request
        var generator = new SwordGen.SwordGenerator(seedVal, req.params.weaponStyle, templateData);
        var sword = generator.generateSword();
        
        // Temporary print strings
        console.log("====FORGE REQUEST====\n" +
                    `From: ${req.ip}\n` +
                    `Weapon Type: ${req.params.weaponType}\n` +
                    `Weapon Style: ${req.params.weaponStyle}\n` +
                    `Generated Seed: ${seedVal}`);

        
        res.json(sword.toJSON());
        console.log("====FORGE REQUEST SATISFIED====");   
    });

    
    // Request for a weapon mesh, providing a seed value
    app.get(API_BASE_ROUTE + 'forge/:weaponType/:weaponStyle/:seed/', (req, res) => {
        // Load in the template data
        var templateData = weaponTemplates.getWeaponTemplate(req.params.weaponType,req.params.weaponStyle)
        
        // Return an error if no template was found
        if (templateData == null) {
            res.status(500).send("Invalid weapon type and/or style");
        }

        // Create a new sword Generator for this request
        var generator = new SwordGen.SwordGenerator(req.params.seed, req.params.weaponStyle, templateData);
        var sword = generator.generateSword();

        // Temporary print strings
        console.log("====FORGE REQUEST====\n" +
                    `From: ${req.ip}\n` +
                    `Weapon Type: ${req.params.weaponType}\n` +
                    `Weapon Style: ${req.params.weaponStyle}\n` +
                    `Seed: ${req.params.seed}`);

        res.json(sword.toJSON());
        console.log("====FORGE REQUEST SATISFIED====");  
    });
    
    // Handles errors
    app.on('error', (err) => {
        logger.writeToLog(__dirname + "log.txt", err);
    });
    
    // Starts the base endpoint
    server = app.listen(API_PORT, () => {
        console.log(colors.green(`\nREST API started on port ${API_PORT}. Access using ${API_BASE_ROUTE}.`));
    });
}

StartRESTAPI();
