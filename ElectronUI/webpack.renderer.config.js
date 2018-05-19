const path              = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    module: {
        rules: [
            ...require('./webpack.rules'),
            {test: /\.css$/,
             use: [{loader: 'style-loader'},
                   {loader: 'css-loader'  }]},
            {test: /\.png$/,
             use:  [{loader: 'file-loader'}]}
        ]
    },
    plugins: [
        new CopyWebpackPlugin({patterns: [
            // These files are built at `npm install`. They need to be in .webpack.
            {from: path.join('node_modules', 'electron-edge-js', 'build', 'Release'),
             to:   path.join('build', 'Release')},
            // Put this where preload.js can access it as bin/CKAN.dll
            {from: path.join('..', '_build', 'out', 'CKAN', 'Release', 'bin', 'net45'),
             to:   path.join('main_window', 'bin')}
        ]})
    ]
};
