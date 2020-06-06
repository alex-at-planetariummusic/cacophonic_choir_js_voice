var path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    mode: 'development',

    devServer: {
        // contentBase: './dist',
        // contentBase: path.join(__dirname, 'assets'),
        // contentBasePublicPath: './assets',
        clientLogLevel: 'debug'
    },

    entry: {
        app: './src/index.js'
    },

    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        // publicPath: path.resolve(__dirname, 'dist')
    },

    plugins: [
        new HtmlWebpackPlugin({
            template: './src/index.ejs'
        }),
        // new CopyWebpackPlugin({
        //     patterns:
        //         [
        //             // path.resolve(__dirname, 'assets'),
        //             {
        //                 context: './',
        //                 // from: path.resolve(__dirname, 'assets'),
        //                 from: './assets/**/*',
        //                 to: './dist/assets',
        //                 // toType: 'dir'
        //             }
        //     ]
        // })
        // new CleanWebpackPlugin()
    ],

    module: {
        rules: [
            {
                test: /\.(png|svg|jpg|gif)$/,
                loader: 'file-loader'
                // options: {
                //     outputPath: './assets/img/',
                //     publicPath: '/'
                // }
            },
            // {
            //     test: /\.mp3$/,
            //     loader: 'file-loader'
            //     // options: {
            //     //     name: '[name].[ext]',
            //     //     outputPath: './assets/sounds/',
            //     //     publicPath: 'sounds/',
            //     //     useRelativePaths: true
            //     // }

            // }
        ],
    }
};