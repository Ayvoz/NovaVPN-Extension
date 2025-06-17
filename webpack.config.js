const path = require('path');

module.exports = {
  mode: 'development', // or 'production'
  entry: {
    popup: './js/popup.js',
    // background: './js/background.js', // If you have a background script to bundle
    // content: './js/content.js', // If you have a content script to bundle
  },
  output: {
    filename: '[name].bundle.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
  devtool: 'cheap-module-source-map', // For better debugging in development
  optimization: {
    minimize: false, // Set to true for production build
  },
}; 