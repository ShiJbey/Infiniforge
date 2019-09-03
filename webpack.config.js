'use strict';

var path = require('path');
const MinifyPlugin = require('babel-minify-webpack-plugin');

module.exports = {

    // I think I can get away with just specifying the
    // file name without the extension
    entry: './src/Infiniforge',

    output: {
        path: path.resolve(__dirname, 'build', 'web'),
        filename: 'infiniforge.bundle.js',
        libraryTarget: 'var',
        library: 'Infiniforge'
    },

    module: {
        rules: [{
            // Include ts, tsx, js, and jsx files.
            test: /\.(ts|js)x?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',

        }],
    },

    resolve: {
        modules: [
            'node_modules'
        ],
        extensions: ['.ts', '.tsx', '.js', '.json']
    },

    target: 'web',

    plugins: [
        new MinifyPlugin()
    ]

};