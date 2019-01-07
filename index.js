/* This code is responsible for handing Infinforge RESTful API calls.
 * The server is started on port 8080.
 * To access the procedural generation services use the base route '/api/'
 * To display instructions on how to use the api use route '/help/'
 * To use the web version use rout '/sandbox/'
 */

// Modules obtained from node_modules/
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serveStatic = require('serve-static');

// Source code included with this project
const logger = require('./logmanager');
const weaponTemplates = require('./weapontemplates');
const SwordGenerator = require('./build/swordgenerator');

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

// Allow Express to serve static files like a http server
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
        var seed = new Date().toString();

        // Create a new sword Generator for this request
        var generator = new SwordGenerator.SwordGenerator(seed);
        var sword = generator.generateSword(templateData, SwordGenerator.DEFAULT_GEN_PARAMS);

        // Temporary print strings
        console.log("====FORGE REQUEST====\n" +
                    `\tFrom: ${req.ip}\n` +
                    `\tWeapon Type: ${req.params.weaponType}\n` +
                    `\tWeapon Style: ${req.params.weaponStyle}\n` +
                    `\tGenerated Seed: ${seed}`);
        console.log("====FORGE REQUEST SATISFIED====");
        sword.export_to_gltf().then((result) => {
            res.status(200).json(result);
        },
        (err) => {
            res.status(400).json({Error: "Error during generation"});
        });
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
        var generator = new SwordGenerator.SwordGenerator(req.params.seed);
        var sword = generator.generateSword(templateData, SwordGenerator.DEFAULT_GEN_PARAMS);

        // Temporary print strings
        console.log("====FORGE REQUEST====\n" +
                    `\tFrom: ${req.ip}\n` +
                    `\tWeapon Type: ${req.params.weaponType}\n` +
                    `\tWeapon Style: ${req.params.weaponStyle}\n` +
                    `\tSeed: ${req.params.seed}`);

        sword.export_to_gltf().then((result) => {
            res.status(200).json(result);
        },
        (err) => {
            res.status(400).json({Error: "Error during generation"});
        });

        console.log("====FORGE REQUEST SATISFIED====");

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
