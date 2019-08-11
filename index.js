/* This code is responsible for handing Infiniforge REST API calls.
 * Supported Routes:
 * '/api' - Access the procedural generation services use the base route
 * '/help' - Display instructions on how to use the api
 * '/sandbox' - Returns a webpage for intereacting with current build
 * '/crosssection' - Retrieve and modify cross section json data
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
var infiniforge = require('./build/Infiniforge');

// Include configuration file for the server
const infiniforgeConfig = require('./infiniforge-config.json');

// Configure the Express Application
let server;
const app = express();
const API_PORT = infiniforgeConfig["server"]["port"];

// Configure routes to static files
app.use('/sandbox/', express.static(path.join(__dirname, 'build')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'js')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'style')));
app.use('/sandbox/', express.static(path.join(__dirname, 'www', 'views')));
app.use('/sandbox/', express.static(path.join(__dirname, 'node_modules', 'three', 'build')));
app.use('/sandbox/', express.static(path.join(__dirname, 'node_modules', 'three', 'examples', 'js','exporters')));
app.use('/sandbox/', express.static(path.join(__dirname, 'node_modules', 'three', 'examples', 'js','loaders')));

// Configure Express Middleware
app.use(bodyParser.json());         // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// Allow Express to serve static files like a http server
app.use(serveStatic(path.join(__dirname, 'www', 'views'), { 'index' : ['help.html']}));

/**
 * Compare the json in the source and build folders and
 * warn the user that they should rebuild the project
 * to get the latest templates and cross sections
 */
function checkForJsonUpdates() {
    var nonBuiltCrossSections = JSON.parse(fs.readFileSync("./src/json/cross-sections.json"));
    var builtCrossSections = JSON.parse(fs.readFileSync("./build/json/cross-sections.json"));
    if (JSON.stringify(nonBuiltCrossSections) !== JSON.stringify(builtCrossSections)) {
        console.log(colors.blue("Updates have been made to the cross sections json.\nRebuild with 'npm run build' to get latest changes."));
    }

    var nonBuiltCrossSections = JSON.parse(fs.readFileSync("./src/json/sword-templates.json"));
    var builtCrossSections = JSON.parse(fs.readFileSync("./build/json/sword-templates.json"));
    if (JSON.stringify(nonBuiltCrossSections) !== JSON.stringify(builtCrossSections)) {
        console.log(colors.blue("Updates have been made to the sword templates json.\nRebuild with 'npm run build' to get latest changes."));
    }
}

function configureRoutes() {

    ////////////////////////////////////////////////////////
    //                     HELP PAGES                     //
    ////////////////////////////////////////////////////////

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

    app.get('/api', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

    app.get('/help', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
        console.log("Help page served...");
    });

    ////////////////////////////////////////////////////////
    //                      TOOLS                         //
    ////////////////////////////////////////////////////////

    // Return the page where users can live test the API without
    // importing the models into an external program
    app.get('/tools/sandbox', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'sandbox.html'));
        console.log("Sandox page served...");
    });

    // Return html GUI for editing cross section JSON
    app.get('/tools/crosssection', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'crosssectiontool.html'));
        console.log("Cross Section Tool page served...");
    });

    ////////////////////////////////////////////////////////
    //                    API (POST)                      //
    ////////////////////////////////////////////////////////

    app.post('/api/crosssection/:name/:jsonData', (req, res) => {
        console.log("Saved cross section");
        var crossSection = JSON.parse(req.params.jsonData);
        var allCrossSections = JSON.parse(fs.readFileSync("./src/json/cross-sections.json"));
        res.send({result: "done"});
        allCrossSections[crossSection.name] = crossSection;
        fs.writeFileSync("./src/json/cross-sections.json", JSON.stringify(allCrossSections));
    });

    ////////////////////////////////////////////////////////
    //                     API (GET)                      //
    ////////////////////////////////////////////////////////

    app.get('/api/crosssection/:name', (req, res) => {
        var allCrossSections = JSON.parse(fs.readFileSync("./src/json/cross-sections.json"));
        if (req.params.name in allCrossSections) {
            res.send(allCrossSections[req.params.name]);
            console.log("Served cross section.");
        }
        else {
            res.status(404).send("Cant find cross section");
            console.log(`Could not find cross section: ${req.params.name}`);
        }
    });

    // Request for a sword mesh without providing a seed value
    app.get('/api/forge/sword/style/:style', (req, res) => {
        var seed = new Date().toDateString();
        var promise = generateAndExportSword(req.params.style, seed, {});

        promise.then((result) => {
                res.status(200).json(result);
            }, (err) => {
                res.status(400).json({Error: "Error during generation"});
        });

        // Temporary print strings
        console.log("==== FORGE REQUEST SATISFIED ====\n" +
                    `\tFrom: ${req.ip}\n` +
                    `\tSword Style: ${req.params.style}\n` +
                    `\tGenerated Seed: ${seed}\n` +
                    "=================================\n");
    });

    // Request for a sword mesh without providing a seed value
    app.get('/api/forge/sword/style/:style/options/:options', (req, res) => {
        try {
            var optionsJson = JSON.parse(req.params.options);
            var seed = new Date().toDateString();
            var promise = generateAndExportSword(req.params.style, seed, optionsJson);

            promise.then((result) => {
                    res.status(200).json(result);
                }, (err) => {
                    res.status(400).json({Error: "Error during generation"});
            });
        } catch (err) {
            res.status(400).json({Error: "options needs to be json format"});
        }


        // Temporary print strings
        console.log("==== FORGE REQUEST SATISFIED ====\n" +
                    `\tFrom: ${req.ip}\n` +
                    `\tSword Style: ${req.params.style}\n` +
                    `\tGenerated Seed: ${seed}\n` +
                    "=================================\n");
    });

    // Request for a sword mesh, providing a seed value
    app.get('/api/forge/sword/style/:style/seed/:seed', (req, res) => {

        var promise = generateAndExportSword(req.params.style, req.params.seed, {});

        promise.then((result) => {
                res.status(200).json(result);
            }, (err) => {
                res.status(400).json({Error: "Error during generation"});
        });

        // Temporary print strings
        // console.log("==== FORGE REQUEST SATISFIED ====\n" +
        //             `\tFrom: ${req.ip}\n` +
        //             `\tSword Style: ${req.params.style}\n` +
        //             `\tGenerated Seed: ${req.params.seed}\n` +
        //             "=================================\n");
    });

    // Request for a sword mesh, providing a seed value
    app.get('/api/forge/sword/style/:style/seed/:seed/options/:options', (req, res) => {
        try {
            var optionsJson = JSON.parse(req.params.options);
            console.log(optionsJson);
            var promise = generateAndExportSword(req.params.style, req.params.seed, optionsJson);

            promise.then((result) => {
                    res.status(200).json(result);
                }, (err) => {

            });

        } catch (err) {
            res.status(404).json({Error: "Options weren't sent as json string"});
        }


        // Temporary print strings
        // console.log("==== FORGE REQUEST SATISFIED ====\n" +
        //             `\tFrom: ${req.ip}\n` +
        //             `\tSword Style: ${req.params.style}\n` +
        //             `\tGenerated Seed: ${req.params.seed}\n` +
        //             "=================================\n");
    });
}

/**
 * Calls the infiniforge module to generate the sword and returns a
 * promise to the GLTFExporter
 *
 * @param {string} style
 * @param {string} seed
 * @param {JSON} options
 * @return
 */
function generateAndExportSword(style, seed, options) {
    // Check optional parameters
    var options = (options !== undefined) ? options : {};
    // Get template
    var template = infiniforge.Templates.getSwordTemplate(style);
    // Create a new sword Generator for this request
    var generator = new infiniforge.Generator.SwordGenerator(infiniforgeConfig["generator"]["verbose"]);
    // Generate the sword using the template, default params and seed
    var sword = generator.generateSword(template, options, seed);
    // Create a new exported
    var sword_exporter = new GLTFExporter();
    // Parse the swords mesh and create a new promise to access the result
    var swordExportPromise = new Promise ((resolve, reject) => {
        sword_exporter.parse(sword.getMesh(), (gltf) => {
            resolve(gltf);
        },{});
    });
    return swordExportPromise;
}

function configureInteruptHandlers() {
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

function StartRESTAPI() {
    configureRoutes();
    configureInteruptHandlers();

    // Starts the base endpoint
    server = app.listen(API_PORT, () => {
        checkForJsonUpdates();
        console.log(colors.green(`\nREST API started at http://localhost:${API_PORT}. For help use route '/help/'.`));
    });

    // Handles errors
    app.on('error', (err) => {
        logger.writeToLog(path.join(__dirname, 'log.txt'), err);
    });
}



StartRESTAPI();
