var path = require('path');

module.exports = {
  entry: './index.js',
  output: {
    filename: "[name].bundle.js"
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
    root: path.resolve(__dirname, '../build'),
    modulesDirectories: ['node_modules', 'bower_components']
  }
  // plugins: [
  //   new UglifyJsPlugin({
  //     compress: {
  //       warnings: false
  //     }
  //   })
  // ]
}
