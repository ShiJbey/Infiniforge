#! /usr/bin/env node

const colors = require("colors");
const express = require("express");
const bodyParser = require("body-parser");
const process = require("process");
const commander = require("commander");
const infiniforge = require("../dist/cjs/infiniforge");

/**
 * Configure REST routes for express
 */
function configureRoutes(app, options) {
  const VERBOSE_OUTPUT = options && options.verbose ? true : false;

  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  ////////////////////////////////////////////////////////
  //                        API                         //
  ////////////////////////////////////////////////////////

  // Request for a sword mesh
  app.post("/api/forge/sword", (req, res) => {
    const swordGenerator = new infiniforge.SwordGenerator();
    swordGenerator.setVerbose(VERBOSE_OUTPUT);

    const options = req.body;
    // Always export gltf JSON from REST API
    options.output = "gltf";

    swordGenerator
      .generate(options)
      .then((result) => {
        res.status(200).json(result);

        if (VERBOSE_OUTPUT) {
          console.log(`${new Date().toISOString()}> Sword Request Complete`);
        }
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });

        if (VERBOSE_OUTPUT) {
          console.log(`${new Date().toISOString()}> Error:: ${err.message}`);
        }
      });
  });

  // Request for a sword mesh
  app.get("/api/forge/sword/:options?", (req, res) => {
    const swordGenerator = new infiniforge.SwordGenerator();
    swordGenerator.setVerbose(VERBOSE_OUTPUT);

    const options = req.params.options ? JSON.parse(req.params.options) : {};
    // Always export gltf JSON from REST API
    options.output = "gltf";

    swordGenerator
      .generate(options)
      .then((result) => {
        res.status(200).json(result);

        if (VERBOSE_OUTPUT) {
          console.log(`${new Date().toISOString()}> Sword Request Complete`);
        }
      })
      .catch((err) => {
        res.status(400).json({ error: err.message });

        if (VERBOSE_OUTPUT) {
          console.log(`${new Date().toISOString()}> Error:: ${err.message}`);
        }
      });
  });
}

function startServer(options) {
  const PORT = options.port ? options.port : 8080;
  const VERBOSE = options.verbose ? true : false;
  const HOST = "localhost";

  // Configure Express Application
  const app = express();

  app.use(express.json());
  configureRoutes(app, {
    verbose: VERBOSE,
  });

  // Starts the base endpoint
  const server = app.listen(PORT, HOST, () => {
    console.log(
      colors.green(`\nServer listening at`),
      colors.yellow(`http://${HOST}:${PORT}`)
    );
  });

  let lastSocketKey = -1;
  const socketMap = {};
  server.on("connection", (socket) => {
    lastSocketKey++;
    const socketKey = lastSocketKey;
    socketMap[socketKey] = socket;
    socket.on("close", () => {
      delete socketMap[socketKey];
    });
  });

  // Handle Process Signals
  process.on("SIGINT", () => {
    server.emit("shutdown");
  });
  process.on("SIGTERM", () => {
    server.emit("shutdown");
  });
  server.on("shutdown", () => {
    console.log("Shutting down server...");

    for (const socketID in socketMap) {
      socketMap[socketID].destroy();
    }

    server.close((err) => {
      if (err) {
        throw err;
      }
      console.log("Server closed");
      process.exit(0);
    });
  });

  // Handles errors
  app.on("error", console.error);
}

(function main() {
  const program = new commander.Command();

  program
    .name("infiniforge-server")
    .description("Serve infiniforge models via REST API")
    .version("2.2.0")
    .option("-p, --port <port>", "Server port")
    .option("-v, --verbose", "Verbose output")
    .action(startServer);

  program.parse(process.argv);
})();
