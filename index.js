/* This code is responsible for handing Infinforge RESTful API calls.
 * The server is started on port 8080.
 * To access the procedural generation services use the base route '/api/'
 * To display instructions on how to use the api use route '/help/'
 * To use the web version use rout '/sandbox/'
 */

const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const logger = require('./logmanager.js');
const serveStatic = require('serve-static');
const weaponTemplates = require('weapontemplates');

// Configure the Express Application
const app = express();
const API_PORT = 8080;

// Configure routes to static files
app.use('/sandbox/', express.static(path.join(__dirname, 'www')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'js')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'style')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'views')));

// Configure Express Middleware
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.use(serveStatic(path.join(__dirname, 'www', 'views'), { 'index' : ['help.html']}));

function StartRESTAPI() {

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

    app.get('/help/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

    app.get('/sandbox/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'sandbox.html'));
        console.log("Sandox page served...");
    });

    app.get('/api/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

	// Request for a weapon mesh without providing a seed value
    app.get('/api/forge/:weaponType/:weaponStyle/', (req, res) => {
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
        //var generator = new SwordGen.SwordGenerator(seedVal, req.params.weaponStyle, templateData);
        //var sword = generator.generateSword();

        // Temporary print strings
        console.log("====FORGE REQUEST====\n" +
                    `From: ${req.ip}\n` +
                    `Weapon Type: ${req.params.weaponType}\n` +
                    `Weapon Style: ${req.params.weaponStyle}\n` +
                    `Generated Seed: ${seedVal}`);
        console.log("====FORGE REQUEST SATISFIED====");
        res.write("Request Handled");
        //res.json(sword.toJSON());

    });

    // Request for a weapon mesh, providing a seed value
    app.get('/api/forge/:weaponType/:weaponStyle/:seed/', (req, res) => {
        // Load in the template data
        var templateData = weaponTemplates.getWeaponTemplate(req.params.weaponType,req.params.weaponStyle)

        // Return an error if no template was found
        if (templateData == null) {
            res.status(500).send("Invalid weapon type and/or style");
        }

        // Create a new sword Generator for this request
        //var generator = new SwordGen.SwordGenerator(req.params.seed, req.params.weaponStyle, templateData);
        //var sword = generator.generateSword();

        // Temporary print strings
        console.log("====FORGE REQUEST====\n" +
                    `From: ${req.ip}\n` +
                    `Weapon Type: ${req.params.weaponType}\n` +
                    `Weapon Style: ${req.params.weaponStyle}\n` +
                    `Seed: ${req.params.seed}`);
        console.log("====FORGE REQUEST SATISFIED====");
        res.write("Request Handled");
    });

    // Handles errors
    app.on('error', (err) => {
        logger.writeToLog(path.join(__dirname, 'log.txt'), err);
    });

    // Starts the base endpoint
    server = app.listen(API_PORT, () => {
        console.log(colors.green(`\nREST API started on port ${API_PORT}. For help use route '/help/'.`));
    });

}

StartRESTAPI();
