var path = require("path");
var ContentDeduplicationPlugin = require("./ContentDeduplicationPlugin");

module.exports = {
  entry: {
    main: "./src/main"
  },
  output: {
    path: path.join(__dirname, "js"),
    filename: "[name].bundle.js",
    chunkFilename: "[id].chunk.js"
  },
  plugins: [
    new ContentDeduplicationPlugin({
      exclude: /fileB/, // this does not do anything, as ./fileA gets removed
      choose: (modules) => modules.find(m => m.request.match(/dir/)) // this might be useful for sourcemaps
    })
  ]
};