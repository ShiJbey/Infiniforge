# Weapon Forge

Weapon Forge is designed to be a NodeJS RESTful API that returns JSON
representations of 3D procedurally generated sword meshes using Blender.

## Dependencies when not using Docker
* Node 6.9.4 or newer
* Blender 2.76 install and added to your PATH
* You may choose to install the included ThreeJS blender exporter, or you may
install the most updated one from ThreeJS : [Here](https://github.com/mrdoob/three.js/).
Warning: latest ThreeJS exporter may not work if ThreeJS makes large changes from the
version that is included in this repo.

## How to install and run (not using Docker)
1. Clone this repo and ```$ cd WeaponForge```
2. ```$ cd node```
3. ```$ npm install```
3. ```$ npm start``` or ```$ node index.js```

## How to build image and run container (Docker)
1. ```$ sudo docker build -t weaponforge .```
2. ```$ sudo docker run -dti -p 8080:8080 weaponforge```

## What this project contains
* Code for a NodeJs server that handles web requests and connects to Blender
* ThreeJS blender json exporter addon
* A script for connecting to the API and importing meshes into Unity

This project was originally made as part of the August Reddit procedural generation challenge
Found here: [Reddit Challenge](https://www.reddit.com/r/proceduralgeneration/comments/4wubjy/monthly_challenge_9_august_2016_procedural_weapons/)
