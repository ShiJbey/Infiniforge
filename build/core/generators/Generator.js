"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Generator = void 0;
const seedrandom = require("seedrandom");
class Generator {
    constructor(verbose = false) {
        this._prng = seedrandom();
        this._verbose = verbose;
    }
    setSeed(seed) {
        this._prng = seedrandom(seed);
    }
    setVerbose(verbose) {
        this._verbose = verbose;
    }
    generate(options) {
        return new Promise((resolve, reject) => {
            reject("Generate function is not implemented");
        });
    }
}
exports.Generator = Generator;
exports.default = { Generator };
//# sourceMappingURL=Generator.js.map