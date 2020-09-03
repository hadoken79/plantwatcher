const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

module.exports = env => {
    console.log('///////////////////////// Webpack-Mode ' + env.mode);
    return {
        mode: env.mode,
        entry: './source/js/main.js',
        output: {
            path: path.resolve(__dirname, 'dist/'),
            filename: '[name].[contenthash].js'
        },
        module: {
            rules: [
                {
                    test: /\.s[ac]ss$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        'css-loader',
                        'sass-loader'
                    ]
                },
                {
                    test: /\.(woff(2)?|ttf|eot|svg)(\?v=\d+\.\d+\.\d+)?$/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[name].[ext]',
                                outputPath: 'assets/',
                                publicPath: '/', //is handled by express-static
                            },
                        },
                    ],
                },
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                title: 'Plantwatcher',
                appMountId: 'app',
                filename: 'index.html',
                template: path.resolve(__dirname, 'views/dashboard.html')
            }),
            new MiniCssExtractPlugin(),
            new CleanWebpackPlugin(),
            new FaviconsWebpackPlugin(path.resolve(__dirname, 'favicon.png'))
        ],
        optimization: {
            runtimeChunk: 'single',
            splitChunks: {
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all'
                    }
                }
            }
        }
    }
};
