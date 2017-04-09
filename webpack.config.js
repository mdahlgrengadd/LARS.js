    var path = require('path');
    module.exports = {
        devtool: "cheap-module-eval-source-map",
        resolve: {
            alias: {
              'wavesurfer': path.resolve(__dirname, './node_modules/wavesurfer.js/dist/wavesurfer.js'),
              'wavesurfer-regions': path.resolve(__dirname, './node_modules/wavesurfer.js/dist/plugin/wavesurfer.regions.min.js'),
              'wavesurfer-elan': path.resolve(__dirname, './node_modules/wavesurfer.js/dist/plugin/wavesurfer.elan.min.js'),
              'wavesurfer-elan-wave-segment': path.resolve(__dirname, './src/wavesurfer.elan-wave-segment.min.js'),
              'waves-basic-controllers': path.resolve(__dirname, './node_modules/waves-ui/examples/assets/waves-basic-controllers.min.js')
            }
          },
        module: {
            rules: [
                { test: path.join(__dirname, 'example'),
                  loader: 'babel-loader' }
            ]
        },
        entry: path.join(__dirname, 'src/app03_elan.js'),
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
