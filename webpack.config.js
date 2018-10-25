const path = require('path')
const webpack = require('webpack')
const TerserPlugin = require('terser-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const InterpolateHtmlPlugin = require('interpolate-html-plugin')
const Dotenv = require('dotenv-webpack')
const xenv = require('dotenv').config({ path: `${__dirname}/.env` })
const CaseSensitivePathsPlugin = require('case-sensitive-paths-webpack-plugin')
const WatchMissingNodeModulesPlugin = require('react-dev-utils/WatchMissingNodeModulesPlugin')
const ModuleNotFoundPlugin = require('react-dev-utils/ModuleNotFoundPlugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const ErrorOverlayPlugin = require('error-overlay-webpack-plugin')
const DashboardPlugin = require('webpack-dashboard/plugin')
const DuplicatePackageCheckerPlugin = require('duplicate-package-checker-webpack-plugin')

module.exports = (env, argv) => {
    const devMode = argv.mode !== 'production'
    return {
        entry: path.resolve(__dirname, 'src/index.js'),
        resolve: {
            extensions: ['*', '.js', '.jsx'],
        },
        output: {
            filename: '[name].bundle.js',
            chunkFilename: '[name].bundle.js',
            path: path.resolve(__dirname, 'dist'),
        },
        optimization: {
            minimizer: [
                new TerserPlugin({
                    cache: true,
                    parallel: true,
                    terserOptions: {
                        compress: false,
                        ecma: 6,
                        mangle: true,
                    },
                    sourceMap: true,
                }),
                new OptimizeCSSAssetsPlugin({
                    assetNameRegExp: /\.optimize\.css$/g,
                    cssProcessor: require('cssnano'),
                    cssProcessorPluginOptions: {
                        preset: ['default', { discardComments: { removeAll: true } }],
                    },
                    canPrint: true,
                }),
            ],
        },
        devServer: {
            open: false,
            port: 4000,
            compress: true,
            hot: true,
            inline: true,
            historyApiFallback: true,
            // stats: { colors: true },
            stats: 'errors-only',
            contentBase: path.resolve(__dirname, 'public'),
        },
        module: {
            strictExportPresence: true,
            rules: [
                {
                    test: /\.(js|jsx)$/,
                    enforce: 'pre',
                    exclude: /(node_modules|bower_components)/,
                    loader: 'eslint-loader',
                },
                {
                    oneOf: [
                        {
                            test: /\.(js|jsx)$/,
                            exclude: /node_modules/,
                            use: {
                                loader: 'babel-loader',
                            },
                        },
                        {
                            test: /\.html$/,
                            use: [
                                {
                                    loader: 'html-loader',
                                    options: { minimize: true },
                                },
                            ],
                        },
                        {
                            test: /\.(sa|sc|c)ss$/,
                            use: [
                                devMode
                                    ? {
                                        loader: 'style-loader',
                                        options: {
                                            singleton: true,
                                        },
                                    }
                                    : MiniCssExtractPlugin.loader,
                                'css-loader',
                                'postcss-loader',
                                'resolve-url-loader',
                                {
                                    loader: 'sass-loader',
                                    options: {
                                        sourceMap: true,
                                        sourceMapContents: false,
                                    },
                                },
                            ],
                        },
                    ],
                },
            ],
        },
        plugins: [
            new WebpackCleanupPlugin(),
            new Dotenv({
                path: path.resolve(__dirname, '.env'), // Path to .env file (this is the default)
                safe: true, // load '.env.example' to verify the '.env' variables are all set. Can also be a string to a different file.
            }),
            new CaseSensitivePathsPlugin({ debug: false }),
            // This gives some necessary context to module not found errors, such as
            // the requesting resource.
            new ModuleNotFoundPlugin('.'),
            // If you require a missing module and then `npm install` it, you still have
            // to restart the development server for Webpack to discover it. This plugin
            // makes the discovery automatic so you don't have to restart.
            // See https://github.com/facebook/create-react-app/issues/186
            new WatchMissingNodeModulesPlugin(path.resolve('node_modules')),
            // Moment.js is an extremely popular library that bundles large locale files
            // by default due to how Webpack interprets its code. This is a practical
            // solution that requires the user to opt into importing specific locales.
            // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
            // You can remove this if you don't use Moment.js:
            new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
            new HtmlWebpackPlugin({
                template: path.resolve(__dirname, 'public/index.html'),
                filename: './index.html',
            }),
            new MiniCssExtractPlugin({
                filename: devMode ? '[name].css' : '[name].[hash].css',
                chunkFilename: devMode ? '[id].css' : '[id].[hash].css',
            }),
            new InterpolateHtmlPlugin({
                PROJECT_NAME: xenv.parsed.PROJECT_NAME,
            }),
            new webpack.HotModuleReplacementPlugin(),
            new ManifestPlugin({
                fileName: 'asset-manifest.json',
                publicPath: '/',
            }),
            new ErrorOverlayPlugin(),
            new DashboardPlugin(),
            new DuplicatePackageCheckerPlugin(),
        ],
        devtool: devMode ? 'source-map' : 'hidden-source-map', // REQUIRED FOR ErrorOverlayPlugin TO WORK
    }
}
