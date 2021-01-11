# ![](server/www/anvil.png) Infiniforge 2.0

![screenshot](screenshot.png)

InfiniForge is a NodeJS REST API that returns JSON
representations of procedurally generated 3D fanstasy swords.


This project was originally made as part of the August 2016 Reddit procedural generation challenge
Found here: [Reddit Challenge](https://www.reddit.com/r/proceduralgeneration/comments/4wubjy/monthly_challenge_9_august_2016_procedural_weapons/)

## Whats New

Infiniforge 2.0 features a revamped generation process that
is much easier to maintain, and has the ability to produce
a wider array of weapons.

## How to run Infiniforge server

1. ```$ git clone https://github.com/ShiJbey/Infiniforge```
2. ```$ cd Infiniforge```
3. ```$ npm install```
4. ```$ npm run build```
5. ```$ npm start```
6. Open your web browser and go to ```localhost:8080```

## Building the Documentation

The documentation is generated using [Typedoc](https://typedoc.org)
 ```$ npm run typedoc``

## Example Usage

```javascript
// NodeJs Example using Javascript

const Infiniforge = require('infiniforge');

const swordGenerator = Infiniforge.SwordGenerator();

swordGenerator.generate({

    "output": "gltf",
    "style": "long"

}).then((sword) => {

        console.log(sword);

}).catch(console.error);

```

## How are models exported

The server exports 3D meshes as JSON in the
glTF 2.0 (GL Transmisssion Format ) by Khronos Group. It is a royalty-free
specification for the efficient transmission and loading of 3D scenes and
models by applications. The spec is available [here](https://www.khronos.org/gltf/ "glTF Overview").
This application uses a modified version of the GLTFExporter provided
with [ThreeJS](https://threejs.org/docs/#examples/exporters/GLTFExporter).

## What can I do with this

Infiniforge output can be saved as a *.gltf file and used in a multitude of projects. Various importers are
available from [Khronos Group](https://www.khronos.org/gltf/). For example, one could use this
in a unity game by taking advantage of the [UnityGLTF plugin](https://github.com/KhronosGroup/UnityGLTF). Also, glTF files can also be opened on windows 10 using the 3D Viewer application.

## References

* https://en.wikipedia.org/wiki/Longsword

* http://www.lordsandladies.org/middle-ages-weapons.htm

* https://www.medievalswordsworld.com/
