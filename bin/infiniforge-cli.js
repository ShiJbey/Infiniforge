#! /usr/bin/env node

const fs = require("fs");
const commander = require("commander");
const infiniforge = require("../dist/cjs/infiniforge");

(function main() {
  const program = new commander.Command();

  program
    .name("infiniforge")
    .description("Generate a new sword using config params")
    .version("2.2.0")
    .argument("<config>", "path to a JSON file ")
    .option(
      "-o, --output <path>",
      "path to output the generated sword",
      "sword.gltf"
    )
    .action(async (config, options) => {
      const swordGenerator = new infiniforge.SwordGenerator();

      const params = {
        ...JSON.parse(fs.readFileSync(config, { encoding: "utf8", flag: "r" })),
        output: "gltf",
      };

      try {
        const sword = await swordGenerator.generate(params);
        fs.writeFileSync(options.output, JSON.stringify(sword));
      } catch (error) {
        console.error(error);
      }
    });

  program.parse(process.argv);
})();
