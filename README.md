# Weapon Forge

Weapon Forge is designed to be a NodeJS RESTful API that returns JSON
representations of procedurally generated 3D sword meshes.

## Dependencies when not using Docker
* Node 6.9.4 or newer

## How to install and run (not using Docker)
1. Clone this repo and ```$ cd WeaponForge```
2. ```$ cd node```
3. ```$ npm install```
4. ```$ npm start``` or ```$ node index.js```
5. Open your web browser and go to localhost:8080/api

## How to build image and run container (Docker)
1. ```$ sudo docker build -t weaponforge .```
2. ```$ sudo docker run -dti -p 8080:8080 weaponforge```
3. Open your web browser and go to <ip of Docker Containter>:8080/api

## What this project contains
* Code for a NodeJs server that handles api requests
* A script for connecting to the API and importing meshes into Unity

## Notes/Warnings:
* Unity currently does not support the importing of 2D arrays from JSON so I converted the 2D array of uv layer values for the mesh from a 2D array to a 1D array.

## To Do:
* Fix sandbox route so that users do not need unity to view swords
* Add a REST param for desired platform so that the JSON may be tailored for a specific importer.

This project was originally made as part of the August Reddit procedural generation challenge
Found here: [Reddit Challenge](https://www.reddit.com/r/proceduralgeneration/comments/4wubjy/monthly_challenge_9_august_2016_procedural_weapons/)
