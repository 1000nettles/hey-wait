const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
  name: 'hey-wait',
  mode: 'development',
  devtool: 'source-map',
  entry: './src/hey-wait.js',
  output: {
    filename: 'hey-wait.js',
    path: path.resolve(__dirname, 'dist'),
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        { from: './module.json', to: './' },
        { from: './lang/*', to: './' },
        { from: './img/*', to: './' },
      ],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader', 'eslint-loader'],
      },
    ],
  },
};
