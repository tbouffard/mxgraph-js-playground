const path = require('path');
const dist = path.resolve(__dirname, 'dist');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackHarddiskPlugin = require('html-webpack-harddisk-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  watch: true,
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
        options: {
          configFile: 'tsconfig.json',
        },
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: dist,
  },
  devServer: {
    contentBase: dist,
    compress: true,
    port: 5005,
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Demo visu BPMN',
      filename: 'index.html',
      template: 'src/index.html',
      alwaysWriteToDisk: true,
      minify: false,
    }),
    new HtmlWebpackHarddiskPlugin({
      outputPath: path.resolve(__dirname, 'dist'),
    }),
    new CopyWebpackPlugin([
      {
        from: 'src/static',
        to: dist,
      },
    ]),
  ],
};
