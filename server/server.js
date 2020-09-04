#! /usr/bin/env node

const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const serveStatic = require('serve-static');
const fs = require('fs');
const process = require('process');
const favicon = require('serve-favicon');
const commander = require('commander');
const Infiniforge = require('../build/Infiniforge');


/**
 * Configure Express app to serve static files like a http server
 * @param app
 */
function configureStaticAssets(app) {
    app.use(serveStatic(path.join(__dirname, 'www', 'views'), { 'index' : ['help.html']}));
    app.use(favicon(path.join(__dirname, 'www','anvil.ico')));
    app.use('/', express.static(path.join(__dirname, 'www')));
    app.use('/', express.static(path.join(__dirname, 'www', 'views')));
    app.use('/js', express.static(path.join(__dirname, 'www', 'js')));
    app.use('/style', express.static(path.join(__dirname, 'www', 'style')));
    app.use('/build', express.static(path.join(__dirname, '..', 'build')));
    app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'build')));
    app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'examples', 'jsm','exporters')));
    app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'examples', 'jsm','loaders')));
    app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'examples', 'jsm','libs')));
    app.use('/node_modules', express.static(path.join(__dirname, '..', 'node_modules', 'jquery', 'dist')));
}

/**
 * Configure express app to use body parser
 *
 * @param app
 */
function configureBodyParser(app) {
    app.use(bodyParser.json());         // to support JSON-encoded bodies
    app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
      extended: true
    }));
}



/**
 * Compare the json in the source and build folders and
 * warn the user that they should rebuild the project
 * to get the latest templates and cross sections
 */
function checkForJsonUpdates() {
    var nonBuiltCrossSections = JSON.parse(fs.readFileSync("./src/json/cross-sections.json", "utf-8"));
    // var builtCrossSections = JSON.parse(fs.readFileSync("./build/json/cross-sections.json", "utf-8"));
    if (JSON.stringify(nonBuiltCrossSections) !== JSON.stringify(builtCrossSections)) {
        console.log(colors.blue("Updates have been made to the cross sections json.\nRebuild with 'npm run build' to get latest changes."));
    }

    var nonBuiltCrossSections = JSON.parse(fs.readFileSync("./src/json/sword-templates.json", "utf-8"));
    var builtCrossSections = JSON.parse(fs.readFileSync("./build/json/sword-templates.json", "utf-8"));
    if (JSON.stringify(nonBuiltCrossSections) !== JSON.stringify(builtCrossSections)) {
        console.log(colors.blue("Updates have been made to the sword templates json.\nRebuild with 'npm run build' to get latest changes."));
    }
}

function configureRoutes(app, options) {

    const VERBOSE_OUTPUT = (options != undefined && options.verbose != undefined) ? true : false;

    ////////////////////////////////////////////////////////
    //                     HELP PAGES                     //
    ////////////////////////////////////////////////////////

    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
    });

    app.get('/api', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
    });

    app.get('/help', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'help.html'));
    });

    ////////////////////////////////////////////////////////
    //                      TOOLS                         //
    ////////////////////////////////////////////////////////

    // Return the page where users can live test the API without
    // importing the models into an external program
    app.get('/tools/sandbox', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'sandbox.html'));
    });

    // Return html GUI for editing cross section JSON
    app.get('/tools/crosssection', (req, res) => {
        res.sendFile(path.join(__dirname, 'www', 'views', 'crosssectiontool.html'));
    });

    ////////////////////////////////////////////////////////
    //                    API (POST)                      //
    ////////////////////////////////////////////////////////

    app.post('/api/crosssection/:name/:jsonData', (req, res) => {
        var crossSection = JSON.parse(req.params.jsonData);
        var allCrossSections = JSON.parse(fs.readFileSync("./src/json/cross-sections.json", "utf-8"));
        res.send({result: "done"});
        allCrossSections[crossSection.name] = crossSection;
        fs.writeFileSync("./src/json/cross-sections.json", JSON.stringify(allCrossSections));
        console.log("Saved cross section");
    });

    ////////////////////////////////////////////////////////
    //                     API (GET)                      //
    ////////////////////////////////////////////////////////

    app.get('/api/crosssection/:name', (req, res) => {
        var allCrossSections = JSON.parse(fs.readFileSync("./src/json/cross-sections.json", "utf-8"));
        if (req.params.name in allCrossSections) {
            res.send(allCrossSections[req.params.name]);
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

        promise
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((err) => {
                res.status(400).json({Error: err});
            });

        if (VERBOSE_OUTPUT) {
            var now = new Date();
            console.log(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} @ ` +
                `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}` +
                `> Forge Request Satisfied`);
        }
    });

    // Request for a sword mesh without providing a seed value
    app.get('/api/forge/sword/style/:style/options/:options', (req, res) => {
        let options = {}
        try {
            options = JSON.parse(req.params.options);
        } catch(err) {
            res.status(400).json({Error: "Invalid JSON"});
        }

        var seed = new Date().toDateString();

        var promise = generateAndExportSword(req.params.style, seed, options);

        promise
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((err) => {
                res.status(400).json({Error: err});
            });


        if (VERBOSE_OUTPUT) {
            var now = new Date();
            console.log(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} @ ` +
                `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}` +
                `> Forge Request Satisfied`);
        }
    });

    // Request for a sword mesh, providing a seed value
    app.get('/api/forge/sword/style/:style/seed/:seed', (req, res) => {

        var promise = generateAndExportSword(req.params.style, req.params.seed, {});

        promise
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((err) => {
                res.status(400).json({Error: err});
            });

        if (VERBOSE_OUTPUT) {
            var now = new Date();
            console.log(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} @ ` +
                `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}` +
                `> Forge Request Satisfied`);
        }
    });

    // Request for a sword mesh, providing a seed value
    app.get('/api/forge/sword/style/:style/seed/:seed/options/:options', (req, res) => {

        let options = {}
        try {
            options = JSON.parse(req.params.options);
        } catch(err) {
            res.status(400).json({Error: "Invalid JSON"});
        }

        var promise = generateAndExportSword(req.params.style, req.params.seed, options);

        promise
            .then((result) => {
                res.status(200).json(result);
            })
            .catch((err) => {
                res.status(400).json({Error: err});
            });

        if (VERBOSE_OUTPUT) {
            var now = new Date();
            console.log(`${now.getFullYear()}-${now.getMonth()+1}-${now.getDate()} @ ` +
                `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}` +
                `> Forge Request Satisfied`);
        }
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
    var template = Infiniforge.getSwordTemplate(style);

    if (template) {
        // Create a new sword Generator for this request
        var generator = new Infiniforge.SwordGenerator();
        // Generate the sword using the template, default params and seed
        var sword = generator.generateSword(template, options, seed);
        // Create a new exported
        return sword.exportToGltf();
    } else {
        return new Promise((resolve, reject) => {reject(`'${style}' is not a valid sword style`)})
    }
}


async function startServer(options) {

    const PORT = (options.port != undefined) ? options.port : 8080;
    const API_ONLY = (options.api_only != undefined) ? true : false;
    const VERBOSE = (options.verbose != undefined) ? true : false;


    // Configure Express Application
    let app = express();

    configureStaticAssets(app);
    configureBodyParser(app);
    configureRoutes(app);

    // Starts the base endpoint
    let server = app.listen(PORT, () => {
        console.log(colors.green(`\nREST API started at http://localhost:${PORT}. For help use route '/help/'.`));
    });

    // Handle Process Signals
    process.on('SIGINT', () => {server.emit("shutdown")});
    process.on('SIGTERM', () => {server.emit("shutdown")});
    server.on("shutdown", () => {
        console.log('Closing http server.');
        server.close(() => {
          console.log('Server closed.');
          process.exit(0);
        });
    });


    // Handles errors
    app.on('error', console.error);
}

function main() {
    commander.program.version("2.0.0");

    commander
        .description("Serve infiniforge via http server")
        .option("--api-only", "Only serve api")
        .option("-p, --port <port>", "Server port")
        .option("-, --vebose", "Verbose output")
        .action(startServer);

    commander.parse(process.argv);
}

main();
