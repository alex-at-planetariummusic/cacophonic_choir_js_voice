const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',

    devServer: {
        clientLogLevel: 'debug'
    },

    entry: {
        app: './src/index.js',
        'cc-unity': './src/cc-unity.js'
    },

    output: {
        // filename: 'bundle.js',
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist')
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.ejs',
            chunks: ['app']
        })
    ],

    devtool: 'source-map',

    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: 'file-loader'
            },
            {
                test: /\.js$/,
                enforce: 'pre',
                use: ['source-map-loader'],
            }
        ],
    },
    stats: {
        warningsFilter: [/Failed to parse source map/],
    },
};