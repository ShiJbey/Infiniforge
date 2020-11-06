#! /usr/bin/env node

const colors = require('colors');
const express = require('express');
const path = require('path');
const serveStatic = require('serve-static');
const process = require('process');
const favicon = require('serve-favicon');
const commander = require('commander');
const Infiniforge = require('../build/Infiniforge');

// Define Generators
const swordGenerator = new Infiniforge.SwordGenerator.SwordGenerator();

/**
 * Configure Express app to serve static files like a http server
 *
 * @param {express.Application} app
 */
function configureStaticAssets(app) {
    app.use(serveStatic(path.join(__dirname, 'www', 'views'), { 'index' : ['help.html']}));
    app.use(favicon(path.join(__dirname, 'www','anvil.png')));
    app.use('/', express.static(path.join(__dirname, 'www')));
    app.use('/', express.static(path.join(__dirname, 'www', 'views')));
    app.use('/js', express.static(path.join(__dirname, 'www', 'js')));
    app.use('/style', express.static(path.join(__dirname, 'www', 'style')));
    app.use('/build', express.static(path.join(__dirname, '..', 'build')));
    app.use('/docs', express.static(path.join(__dirname, '..', 'docs')));
    app.use('/node_modules/three/build', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'build')));
    app.use('/node_modules/three/examples/jsm', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'examples', 'jsm')));
    app.use('/node_modules/three/examples/js', express.static(path.join(__dirname, '..', 'node_modules', 'three', 'examples', 'js')));
}

/**
 * Configure REST routes for express
 *
 * @param {express.Application} app
 * @param {any} options
 */
function configureRoutes(app, options) {

    const VERBOSE_OUTPUT = (options && options.verbose) ? true : false;

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

    ////////////////////////////////////////////////////////
    //                        API                         //
    ////////////////////////////////////////////////////////

    // Request for a sword mesh
    app.post('/api/forge/sword', (req, res) => {

        let options = req.body
        // Always export gltf JSON from REST API
        options.output = "gltf"

        swordGenerator.generate(options)
            .then((result) => {
                res.status(200).json(result);

                if (VERBOSE_OUTPUT) {
                    console.log(`${new Date().toISOString()}> Sword Request Complete`);
                }
            })
            .catch((err) => {
                res.status(400).json({ "error": err.message });

                if (VERBOSE_OUTPUT) {
                    console.log(`${new Date().toISOString()}> Error:: ${err.message}`);
                }
            });
    });
}

async function startServer(options) {

    const PORT = (options.port) ? options.port : 8080;
    const VERBOSE = (options.verbose) ? true : false;
    const HOST = '0.0.0.0';

    // Configure Express Application
    let app = express();

    app.use(express.json());
    configureStaticAssets(app);
    configureRoutes(app, {
        "verbose": VERBOSE
    });

    // Starts the base endpoint
    let server = app.listen(PORT, HOST, (err) => {
        if (err) { throw err }
        let host = server.address().address;
        let port = server.address().port;

        console.log(colors.green(`\nServer listening at`), colors.yellow(`http://${host}:${port}`),
        colors.green(`\nFor help use route`), colors.yellow(`http://${host}:${port}/help`));
    });

    var lastSocketKey = -1;
    var socketMap = {};
    server.on('connection', (socket)=> {
        lastSocketKey++;
        var socketKey = lastSocketKey;
        socketMap[socketKey] = socket;
        socket.on('close', () => {
            delete socketMap[socketKey];
        })
    });

    // Handle Process Signals
    process.on('SIGINT', () => {server.emit("shutdown")});
    process.on('SIGTERM', () => {server.emit("shutdown")});
    server.on("shutdown", () => {
        console.log('Shutting down server...');

        Object.keys(socketMap).forEach((socketKey) => {
            socketMap[socketKey].destroy();
        });


        server.close((err) => {
            if (err) { throw err }
            console.log('Server closed');
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
        .option("-p, --port <port>", "Server port")
        .option("-v, --verbose", "Verbose output")
        .action(startServer);

    commander.parse(process.argv);
}

main();
