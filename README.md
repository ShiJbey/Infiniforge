# ![](server/www/anvil.png) Infiniforge 2.0

Typescript/Javascript library for procedurally generating 3D fantasy swords.

This project was originally made as part of the August 2016 Reddit procedural generation challenge
Found here: [Reddit Challenge](https://www.reddit.com/r/proceduralgeneration/comments/4wubjy/monthly_challenge_9_august_2016_procedural_weapons/)

## Whats New

Infiniforge 2.0 features a revamped generation process that
is much easier to maintain, and has the ability to produce
a wider array of weapons.

## Installation

If you want to use it as a dependency in a project run:
`npm install infiniforge`

However, if you just want to run the server:

1. `$ npm install -g infiniforge`
2. `$ infiniforge-server`

## Development

1. `$ git clone https://github.com/ShiJbey/Infiniforge`
2. `$ cd Infiniforge`
3. `$ npm install`
4. `$ npm run build:all`
5. `$ npm start`
6. Open your web browser and go to `localhost:8080`

## Building the Documentation

The documentation is generated using [Typedoc](https://typedoc.org):

`$ npm run typedoc`

## Example Usage

```javascript
// Generate random sword and write it to a file
const fs = require("fs");
const infiniforge = require("infiniforge");

const swordGenerator = new infiniforge.SwordGenerator();

swordGenerator
  .generate({
    output: "gltf",
    style: "long",
  })
  .then((sword) => {
    try {
      fs.writeFileSync("sword.gltf", JSON.stringify(sword));
    } catch (err) {
      console.error(err);
    }
  })
  .catch(console.error);
```

Or you can generate using the CLI

```json
{
  "output": "gltf",
  "style": "long"
}
```

`npm start ./sample.json -o sample_sword.gltf`

## How are models exported

The server exports 3D meshes as JSON in the
glTF 2.0 (GL Transmission Format ) by Khronos Group. It is a royalty-free
specification for the efficient transmission and loading of 3D scenes and
models by applications. The spec is available [here](https://www.khronos.org/gltf/ "glTF Overview").
This application uses a modified version of the GLTFExporter provided
with [ThreeJS](https://threejs.org/docs/#examples/exporters/GLTFExporter).

## What can I do with this

Infiniforge output can be saved as a \*.gltf file and used in a multitude of projects. Various importers are
available from [Khronos Group](https://www.khronos.org/gltf/). For example, one could use this
in a unity game by taking advantage of the [UnityGLTF plugin](https://github.com/KhronosGroup/UnityGLTF). Also, glTF files can also be opened on windows 10 using the 3D Viewer application.

## References

- https://en.wikipedia.org/wiki/Longsword

- http://www.lordsandladies.org/middle-ages-weapons.htm

- https://www.medievalswordsworld.com/
