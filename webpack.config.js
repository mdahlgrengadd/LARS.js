    var path = require('path');
    module.exports = {
        devtool: "cheap-module-eval-source-map",
        resolve: {
            alias: {
              'wavesurfer': path.resolve(__dirname, './node_modules/wavesurfer.js/dist/wavesurfer.js'),
              'wavesurfer-regions': path.resolve(__dirname, './node_modules/wavesurfer.js/dist/plugin/wavesurfer.regions.min.js')
            }
          },
        module: {
            rules: [
                { test: path.join(__dirname, 'example'),
                  loader: 'babel-loader' }
            ]
        },
        entry: path.join(__dirname, 'src/app.js'),
        output: {
            path: __dirname,
            filename: 'app_bundle.js'
        },
        module: {
            rules: [
                { test: path.join(__dirname, 'src'),
                  loader: 'babel-loader' }
            ]
        }
    };