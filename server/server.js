#! /usr/bin/env node

const colors = require('colors');
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const fs = require('fs');
const process = require('process');
const favicon = require('serve-favicon');
const commander = require('commander');
const Infiniforge = require('../build/Infiniforge');

// Define Generators
const swordGenerator = new Infiniforge.SwordGenerator();


/**
 * Configure Express app to serve static files like a http server
 *
 * @param {express.Application} app
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
 * Configure REST routes for express
 *
 * @param {express.Application} app
 * @param {any} options
 */
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
    //                        API                         //
    ////////////////////////////////////////////////////////

    app.post('/api/crosssection/:name/', (req, res) => {
        var crossSection = JSON.parse(req.body);
        var allCrossSections = JSON.parse(fs.readFileSync("./src/json/cross-sections.json", "utf-8"));
        res.send({result: "done"});
        allCrossSections[crossSection.name] = crossSection;
        fs.writeFileSync("./src/json/cross-sections.json", JSON.stringify(allCrossSections));
        console.log("Saved cross section");
    });

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

    app.post('/test', (req, res) => {
        res.status(200).json(req.body);
    });

    // Request for a sword mesh
    app.post('/api/forge/sword', (req, res) => {

        let options = req.body

        // Always export gltf JSON from REST API
        options.output = "gltf"

        swordGenerator.generate(options)
            .then((result) => {
                res.status(200).json(result);

                if (VERBOSE_OUTPUT) {
                    console.log(`${new Date().toISOString()}> Request Satisfied`);
                }
            })
            .catch((err) => {
                res.status(400).json({ "error": err });

                if (VERBOSE_OUTPUT) {
                    console.log(`${new Date().toISOString()} > Error`);
                }
            });
    });
}

async function startServer(options) {

    const PORT = (options.port != undefined) ? options.port : 8080;
    const API_ONLY = (options.api_only != undefined) ? true : false;
    const VERBOSE = (options.verbose != undefined) ? true : false;
    const HOST = '0.0.0.0';

    // Configure Express Application
    let app = express();

    app.use(express.json());
    configureStaticAssets(app);
    configureRoutes(app, {
        "verbose": VERBOSE
    });

    // Starts the base endpoint
    let server = app.listen(PORT, HOST, () => {
        console.log(colors.green(`\nServer started at`), colors.yellow(`http://${HOST}:${PORT}`),
        colors.green(`\nFor help use route`), colors.yellow(`http://${HOST}:${PORT}/help`));
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
