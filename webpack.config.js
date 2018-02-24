const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const config = {
  entry: "./src/main.ts",
  output: {
    path: path.resolve(__dirname, "build"),
    filename: "bundle.js"
  },
  resolve: {
    extensions: [".ts", ".js", ".json"]
  },
  module: {
    rules: [
      { test: /pixi\.js$/, use: "expose-loader?PIXI" },
      { test: /p2\.js$/, use: "expose-loader?p2" },
      { test: /phaser\.js$/, use: "expose-loader?Phaser" },
      { test: /\.tsx?$/, use: "ts-loader", exclude: /node_modules/ }
    ]
  },
  plugins: [new HtmlWebpackPlugin({template: 'src/index.html'})]
};

module.exports = config