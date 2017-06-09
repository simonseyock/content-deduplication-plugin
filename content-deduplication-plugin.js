const path = require('path');

"use strict";

class ContentDeduplicationPlugin {
  constructor(options) {
    if (options !== undefined && typeof options !== "object" || Array.isArray(options)) {
      throw new Error("Argument should be an options object. To use defaults, pass in nothing.\nFor more info on options, see https://webpack.js.org/plugins/");
    }
    options = options || {};

    // be careful with the exclude option, as excluding does not propagate to parents.
    // i.e. if a parent is not excluded the file might still get removed if the parent gets removed.
    this.exclude = options.exclude === undefined ? []
      : (Array.isArray(options.exclude) ? options.exclude : [options.exclude])
        .map(r => new RegExp(r));

    this.include = options.include === undefined ? []
      : (Array.isArray(options.include) ? options.include : [options.include])
        .map(r => new RegExp(r));

    this.choose = options.choose || (arr => arr[0]);
  }

  apply(compiler) {
    const hashTable = {};
    const exclude = this.exclude;
    const include = this.include;
    const choose = this.choose;

    compiler.plugin("compilation", (compilation) => {
      compilation.plugin("succeed-module", (module) => {
        if (!exclude.some(e => e.test(module.request)) && include.every(i => i.test(module.request))) {
          const hash = module.getHashDigest();

          if (hashTable[hash] !== undefined) {
            hashTable[hash].push(module);
          }
          else {
            hashTable[hash] = [module];
          }
        }
      });
      compilation.plugin("finish-modules", (modules) => {
        for (let hash of Object.keys(hashTable)) {
          let duplicates = hashTable[hash];
          if (duplicates.length > 1) {
            let replacement = choose(duplicates);
            for (let mod of modules) {
              for (let dep of mod.dependencies) {
                if (duplicates.some(d => d === dep.module)) {
                  // let request = path.relative(mod.context, duplicates[0].request).replace('\\', '/');
                  // if (request[0] !== '.') {
                  //   request = './' + request;
                  // }
                  dep.module = replacement;
                  // dep.request = request;
                  // dep.userRequest = request;
                }
              }
            }
          }
        }

      });
    });
  }
}

module.exports = ContentDeduplicationPlugin;
