const
    path = require('path'),
    CleanWebpackPlugin = require('clean-webpack-plugin'),
    webpack = require('webpack'),
    ExtractTextPlugin = require('extract-text-webpack-plugin'),
    FaviconsWebpackPlugin = require('favicons-webpack-plugin'),
    HtmlWebpackPlugin = require('html-webpack-plugin');


module.exports = {
    entry: {
        polyfills: './src/polyfills.js',
        index: './src/index.js',
    },
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
    plugins: [
        new FaviconsWebpackPlugin('./src/images/logo.png'),
        new ExtractTextPlugin('./bundle.css'),
        new HtmlWebpackPlugin({
            title: 'Coucool 2018',
            template: './src/index.html',
        }),
        new webpack.ProvidePlugin({
            _: 'lodash',
            Velocity: 'velocity-animate',
        }),
        new CleanWebpackPlugin(['./dist']),
    ],
    module: {
        rules: [
            {
                test: /\.(eot|svg|ttf|woff|woff2)$/,
                use: [
                    'url-loader',
                ],
            },
            {
                test: /\.(png|svg|jpg|gif)$/,
                use: [
                    'file-loader',
                ],
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['babel-preset-env', {
                            targets: {
                                browsers: ['> 0.1%'],
                            },
                        }]],
                    },
                },
                exclude: path.resolve(__dirname, 'node_modules'),
            },
            {
                test: /\.css$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                            options: {
                                importLoaders: 1,
                            },
                        },
                        'postcss-loader',
                    ],
                }),
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
    },
};
