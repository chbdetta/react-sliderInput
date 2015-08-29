var path = require('path');
var CommonsChunkPlugin = require("webpack/lib/optimize/CommonsChunkPlugin");

module.exports = {
  entry: {
    bundle: "./src/index",
    sliderInput: ['sliderInput'],
    vendor: ["react", "lodash"],
  },
  output: {
    path: "./build/",
    filename: "[name].js",
  },
  module: {
    loaders: [
      {test: /\.(js|jsx)$/, exclude: /(node_modules|bower_components)/, loader: "babel-loader"},
      {test: /\.jade$/, exclude: /(node_modules|bower_components)/, loader: "jade-loader"},
      {test: /\.css$/, loader: "style-loader!css-loader"},
      {test: /\.less$/, loader: "style-loader!css-loader!less-loader"},
    ],
  },
  devServer: {
    hot: true,
    inline: true,
    contentBase: "./build",
    colors: true,
  },
  resolve: {
    root: path.resolve(__dirname, './src'),
    modulesDirectories: ['node_modules', 'bower_components']
  },
  plugins: [
    new CommonsChunkPlugin('vendor', '[name].js'),
  ],
}
