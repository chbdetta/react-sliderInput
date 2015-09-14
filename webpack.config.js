var path = require('path');

module.exports = {
  entry: {
    'slider-input': ['sliderInput'],
  },
  output: {
    path: "./build/",
    filename: "[name].js",
    libraryTarget: 'var',
    library: 'SliderInput'
  },
  module: {
    loaders: [
      {test: /\.(js|jsx)$/, exclude: /(node_modules|bower_components)/, loader: "babel-loader"},
      {test: /\.jade$/, exclude: /(node_modules|bower_components)/, loader: "jade-loader"},
      {test: /\.css$/, loader: "style-loader!css-loader"},
      {test: /\.less$/, loader: "style-loader!css-loader!less-loader"},
    ],
  },
  resolve: {
    root: path.resolve(__dirname, './src'),
    modulesDirectories: ['node_modules', 'bower_components']
  },
  externals: {
    react: 'var React',
    'lodash/object/assign': false
  }
}
