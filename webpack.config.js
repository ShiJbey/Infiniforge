var path = require('path');
const MinifyPlugin = require("babel-minify-webpack-plugin");

module.exports = {
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
            loader: 'babel-loader'
        }],
    },
    plugins: [
        new MinifyPlugin()
    ],

    node: {
        fs: 'empty'
    }
};