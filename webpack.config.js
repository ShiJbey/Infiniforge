var path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
    // Change to your "entry-point".
    entry: './src/SwordGenerator.ts',
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'swordgenerator.bundle.js'
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.json']
    },
    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
            options: {
                presets: [
                    "@babel/preset-env",
                    "@babel/preset-typescript",
                    "minify"
                ],
                plugins: [
                    "@babel/proposal-class-properties",
                    "@babel/proposal-object-rest-spread"
                ]
            }
        }],
    },
    plugins: [
        new MinifyPlugin()
    ]
};