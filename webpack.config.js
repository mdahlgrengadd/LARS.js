    var path = require('path');
    module.exports = {
        entry: './src/webaudio_myengine.js',
        output: {
            path: './src',
            filename: 'webaudio_bundle.js'
        },
        module: {
            loaders: [
                { test: path.join(__dirname, 'example'),
                  loader: 'babel-loader' }
            ]
        }
    };
