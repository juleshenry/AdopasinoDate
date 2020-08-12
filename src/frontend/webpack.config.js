const path = require('path');

module.exports = {
    entry: './client/src/index.js',

    output: {
        path: path.resolve(__dirname, './client/dist'),
        filename: 'bundle.js',
    },

    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            include: [
                path.resolve(__dirname, './client/src')
            ],
        }],
    },
    devServer: {
        contentBase: path.resolve(__dirname, './client/dist'),
        compress: true,
        port: 8000,
        historyApiFallback: {
            rewrites: [
                { from: /^\/app/, to: '/app/index.html' }
            ],
        },
        open: false,
    },
    mode: 'development',
};
