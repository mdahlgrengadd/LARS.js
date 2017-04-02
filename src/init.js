'use strict';

// Create an instance
//FIXME: Works, but dont now if this is correct way to do it?!
import WaveSurfer from './webaudio_ircam.js';
console.log(WaveSurfer.WaveSurfer);

var wavesurfer = Object.create(WaveSurfer.WaveSurfer);


// Init & load audio file
document.addEventListener('DOMContentLoaded', function () {
    var options = {
        container     : document.querySelector('#waveform'),
        waveColor     : 'violet',
        progressColor : 'purple',
        backend       : 'WebAudio',
        cursorColor   : 'navy'
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    // Init
    wavesurfer.init(options);
    // Load audio from URL
    wavesurfer.load('assets/demo.wav');

    wavesurfer.on('ready', function () {
        wavesurfer.addRegion({
            start: 0,
            end: 5,
            color: 'hsla(400, 100%, 30%, 0.1)'
        });

        wavesurfer.addRegion({
            start: 10,
            end: 100,
            color: 'hsla(200, 50%, 70%, 0.1)'
        });
    });
    // Zoom slider
    var slider = document.querySelector('[data-action="zoom"]');

    slider.value = 1000;//wavesurfer.params.minPxPerSec;
    slider.min = wavesurfer.params.minPxPerSec;

    slider.addEventListener('input', function () {
        //wavesurfer.zoom(Number(this.value));
        wavesurfer.setPlaybackRate(Number(this.value)/1000);
    });

});
// Report errors
wavesurfer.on('error', function (err) {
    console.error(err);
});

// Do something when the clip is over
wavesurfer.on('finish', function () {
    console.log('Finished playing');
});


/* Progress bar */
document.addEventListener('DOMContentLoaded', function () {
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');

    var showProgress = function (percent) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    };

    var hideProgress = function () {
        progressDiv.style.display = 'none';
    };

    wavesurfer.on('loading', showProgress);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('error', hideProgress);
});


// Drag'n'drop
document.addEventListener('DOMContentLoaded', function () {
    var toggleActive = function (e, toggle) {
        e.stopPropagation();
        e.preventDefault();
        toggle ? e.target.classList.add('wavesurfer-dragover') :
            e.target.classList.remove('wavesurfer-dragover');
    };

    var handlers = {
        // Drop event
        drop: function (e) {
            toggleActive(e, false);

            // Load the file into wavesurfer
            if (e.dataTransfer.files.length) {
                wavesurfer.loadBlob(e.dataTransfer.files[0]);
            } else {
                wavesurfer.fireEvent('error', 'Not a file');
            }
        },

        // Drag-over event
        dragover: function (e) {
            toggleActive(e, true);
        },

        // Drag-leave event
        dragleave: function (e) {
            toggleActive(e, false);
        }
    };

    var dropTarget = document.querySelector('#drop');
    Object.keys(handlers).forEach(function (event) {
        dropTarget.addEventListener(event, handlers[event]);
    });
});

export default wavesurfer;
