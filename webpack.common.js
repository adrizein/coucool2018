const
    path = require('path'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    entry: ['babel-polyfill', './src/index.js'],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new HtmlWebpackPlugin({
            title: 'Coucool 2018',
            template: './src/index.html',
        }),
        new webpack.ProvidePlugin({
            Promise: 'bluebird',
            $: 'jquery',
        }),
        new CleanWebpackPlugin(['./dist']),
    ],
    module: {
        rules: [
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['babel-preset-env'],
                    },
                },
                exclude: path.resolve(__dirname, 'node_modules'),
            },
            {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
};
