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
        { from: './src/lang/*', to: './' },
        { from: './src/img/*', to: './' },
        { from: './src/templates/*', to: './' },
        { from: './sounds/*', to: './' },
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
