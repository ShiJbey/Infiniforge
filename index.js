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
const GLTFExporter = require('./lib/GLTFExporter');
const fs = require('fs');
const process = require('process');

// Source code included with this project
const logger = require('./logmanager');
const weaponTemplates = require('./weapontemplates');
const SwordGenerator = require('./build/swordgenerator');

// Include JSON
var crossSectionTemplates = require('./json/cross-sections.json');

// Configure the Express Application
const app = express();
const API_PORT = 8080;

// Configure routes to static files
app.use('/sandbox/', express.static(path.join(__dirname, 'www')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'js')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'style')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'views')));
app.use('/sandbox/', express.static(path.join(__dirname, 'node_modules', 'three', 'build')));
app.use('/sandbox/', express.static(path.join(__dirname, 'node_modules', 'three', 'examples', 'js','exporters')));

// Configure Express Middleware
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Allow Express to serve static files like a http server
app.use(serveStatic(path.join(__dirname, 'www', 'views'), { 'index' : ['help.html']}));

function StartRESTAPI() {

    app.post('/crosssection/:name/:jsonData', (req, res) => {
        res.send({result: "done"});
        console.log("Saved cross section");
        var crossSection = JSON.parse(req.params.jsonData);
        var allCrossSections = JSON.parse(fs.readFileSync("./json/cross-sections.json"));
        if (crossSection.name in allCrossSections) {
            allCrossSections[crossSection.name] = crossSection;
        }
        fs.writeFileSync("./json/cross-sections.json", JSON.stringify(allCrossSections));
    });

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

    //app.get('/favicon.ico', (req, res) => sendStatus(204));

    app.get('/help/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

    app.get('/crosssection/tool/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'crosssectiontool.html'));
        console.log("Cross Section Tool page served...");
    });

    app.get('/crosssection/:name/', (req, res) => {
        var allCrossSections = JSON.parse(fs.readFileSync("./json/cross-sections.json"));
        if (req.params.name in allCrossSections) {
            res.send(allCrossSections[req.params.name]);
            console.log("Served cross section.");
        }
        else {
            res.status(404).send("Cant find cross section");
            console.log(`Could not find cross section: ${req.params.name}`);
        }
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
        var templateData = weaponTemplates.getWeaponTemplate(req.params.weaponType,req.params.weaponStyle);

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
        console.log("==== FORGE REQUEST ====\n" +
                    `\tFrom: ${req.ip}\n` +
                    `\tWeapon Type: ${req.params.weaponType}\n` +
                    `\tWeapon Style: ${req.params.weaponStyle}\n` +
                    `\tGenerated Seed: ${seed}`);

        var sword_exporter = new GLTFExporter();

        var options = {

        };

        var swordExportPromise = new Promise ((resolve, reject) => {
            sword_exporter.parse(sword.getMesh(), (gltf) => {
                resolve(gltf);
            },
            options);
        });

        swordExportPromise.then((result) => {
            res.status(200).json(result);
        },
        (err) => {
            res.status(400).json({Error: "Error during generation"});
        });

        console.log("==== FORGE REQUEST SATISFIED ====");
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
        console.log("==== FORGE REQUEST ====\n" +
                    `\tFrom: ${req.ip}\n` +
                    `\tWeapon Type: ${req.params.weaponType}\n` +
                    `\tWeapon Style: ${req.params.weaponStyle}\n` +
                    `\tSeed: ${req.params.seed}`);

        var sword_exporter = new GLTFExporter();

        var options = {

        };

        var swordExportPromise = new Promise ((resolve, reject) => {
            sword_exporter.parse(sword.getMesh(), (gltf) => {
                resolve(gltf);
            },
            options);
        });

        swordExportPromise.then((result) => {
            res.status(200).json(result);
        },
        (err) => {
            res.status(400).json({Error: "Error during generation"});
        });

        console.log("==== FORGE REQUEST SATISFIED ====");

    });

    // Handles errors
    app.on('error', (err) => {
        logger.writeToLog(path.join(__dirname, 'log.txt'), err);
    });

    // Starts the base endpoint
    var server = app.listen(API_PORT, () => {
        console.log(colors.green(`\nREST API started at http://localhost:${API_PORT}. For help use route '/help/'.`));
    });

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    function shutdown() {
        console.log('Closing http server.');
        server.close(() => {
          console.log('Server closed.');
          process.exit(0);
        });
    }
}



StartRESTAPI();
