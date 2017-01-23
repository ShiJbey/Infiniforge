# Weapon Forge

Weapon Forge is designed to be a RESTful API that returns JSON
representations of 3D procedurally generated sword meshes.

## Dependencies
* If you do not plan to run this application in Docker, then you
will need to make sure that you have Blender installed and make
sure that Blender is added to your PATH.
* You will also need to have Node installed

## To-Do
* Dockerfile is not complete so it will not build properly
* Create a new script for the sword proc gen
* Clean up index.js

## How to install and run (not using Docker)
1) ```$ cd node```
2) ```$ npm install```
3) ```$ npm start``` or ```$ node index.js```

## How to install and run (using Docker)
1) ```$ docker build -t .```

## What this project contains
* Code for a NodeJs server that handles web requests and connects to Blender
* Code for the Blender add-on that needs to be installed prior to running server

This project was made as part of the August Reddit procedural generation challenge
Found here: [Reddit Challenge](https://www.reddit.com/r/proceduralgeneration/comments/4wubjy/monthly_challenge_9_august_2016_procedural_weapons/)
