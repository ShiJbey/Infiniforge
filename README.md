# Weapon Forge

Weapon Forge is designed to be a RESTful API that returns JSON
representations of 3D procedurally generated sword meshes.

## Dependencies
* If you do not plan to run this application in Docker, then you
will need to make sure that you have Blender installed and make
sure that Blender is added to your PATH.
* (If not using Docker) Install threejs's blender exporter: [Here](https://github.com/mrdoob/three.js/)
* Node 6.9.4 or newer installed

## To-Do
* Complete the dockerfile
* Tweak generation process
* Clean up index.js

## How to install and run (not using Docker)
1. ```$ cd node```
2. ```$ npm install```
3. ```$ npm start``` or ```$ node index.js```

## How to install and run (using Docker)
1. ```$ docker build -t .```
2. ```$ docker run ...```

## What this project contains
* Code for a NodeJs server that handles web requests and connects to Blender
* A script for connecting to the API and importing meshes into Unity

This project was originally made as part of the August Reddit procedural generation challenge
Found here: [Reddit Challenge](https://www.reddit.com/r/proceduralgeneration/comments/4wubjy/monthly_challenge_9_august_2016_procedural_weapons/)
