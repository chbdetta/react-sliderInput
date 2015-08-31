var path = require('path');
var UglifyJsPlugin = require('webpack/lib/optimize/UglifyJsPlugin');

module.exports = {
  entry: {
    'slider-input': ['sliderInput'],
  },
  output: {
    path: "./build/",
    filename: "[name].js",
    libraryTarget: 'commonjs',
    library: 'slider-input'
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
    colors: true,
  },
  resolve: {
    root: path.resolve(__dirname, './src'),
    modulesDirectories: ['node_modules', 'bower_components']
  },
  externals: {
    react: true,
    'lodash/object/assign': true
  },
  // plugins: [
  //   new UglifyJsPlugin({
  //     compress: {
  //       warnings: false
  //     }
  //   })
  // ]
}
