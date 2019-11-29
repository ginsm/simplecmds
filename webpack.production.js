const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');

module.exports = {
  mode: 'production',
  entry: {
    main: './src/simplecmds.js',
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'simplecmds.js',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  target: 'node',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        output: {
          comments: /@description/i,
        },
      },
      extractComments: true,
    })],
  },
  plugins: [new CleanWebpackPlugin()],
};
