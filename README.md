# Infiniforge

TypeScript library for procedurally generating 3D fantasy swords using ThreeJS.

This project was originally made as part of the August 2016 Reddit procedural generation challenge
Found here: [Reddit Challenge](https://www.reddit.com/r/proceduralgeneration/comments/4wubjy/monthly_challenge_9_august_2016_procedural_weapons/)


## Installation

```
npm install infiniforge
```

This package has `three` and `lodash` as peer dependencies.
So, those will need to be installed too.

## Usage

The code below imports the infiniforge library, generates
a new sword model and writes it to local disk as a `*.gltf`
file. The `generate` function takes a `SwordGenerationParams`
object that specifies fields that affect the generator's
behavior. Here we specify that we want the output to be
glTF and we want the style of sword to be a long sword.

Please refer to [this typescript file](https://github.com/ShiJbey/Infiniforge/blob/develop/src/infiniforge/core/generators/sword/SwordGenerationParams.ts)
for the most comprehensive list of generator params.


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

## Building the Documentation

The documentation is generated using [Typedoc](https://typedoc.org):

```
npm run build:docs
```

## Frequently asked questions

### What is glTF?

Infiniforge exports 3D meshes as JSON in the
glTF 2.0 (GL Transmission Format ) by Khronos Group. It is a royalty-free
specification for the efficient transmission and loading of 3D scenes and
models by applications. The spec is available [here](https://www.khronos.org/gltf/ "glTF Overview").
This application uses a modified version of the GLTFExporter provided
with [ThreeJS](https://threejs.org/docs/#examples/exporters/GLTFExporter).

### What can I do with this?

Infiniforge output can be saved as a \*.gltf file and used in a multitude of projects. Various importers are
available from [Khronos Group](https://www.khronos.org/gltf/). For example, one could use this
in a unity game by taking advantage of the [UnityGLTF plugin](https://github.com/KhronosGroup/UnityGLTF). Also, glTF files can also be opened on windows 10 using the 3D Viewer application.

## References

- https://en.wikipedia.org/wiki/Longsword
- http://www.lordsandladies.org/middle-ages-weapons.htm
- https://www.medievalswordsworld.com/
