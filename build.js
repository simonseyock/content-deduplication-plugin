const webpack = require("webpack");
const config = require("./webpack.config");

webpack(config, (err, stats) => {
  if (err || stats.hasErrors()) {
    // Handle errors here
  }
  // Done processing
});