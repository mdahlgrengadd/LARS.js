'use strict';

// Create an instance
//FIXME: Works, but dont now if this is correct way to do it?!
import WaveSurfer from './webaudio_ircam.js';
console.log(WaveSurfer.WaveSurfer);

var wavesurfer = Object.create(WaveSurfer.WaveSurfer);


// Init & load audio file
document.addEventListener('DOMContentLoaded', function() {
    var options = {
        container: document.querySelector('#waveform'),
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio',
        cursorColor: 'navy'
    };

    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    // Init
    wavesurfer.init(options);
    // Load audio from URL
    wavesurfer.load('assets/demo.wav');

    wavesurfer.on('ready', function() {
        var reverbGain;
        var audioContext = wavesurfer.backend.getAudioContext();
        reverbjs.extend(audioContext);
        // 2) Load the impulse response; upon load, connect it to the audio output.
        //var reverbUrl = "http://reverbjs.org/Library/KinoullAisle.m4a";
        var reverbUrl = "http://reverbjs.org/Library/AbernyteGrainSilo.m4a";
        var reverbNode = audioContext.createReverbFromUrl(reverbUrl, function() {
            reverbGain = wavesurfer.backend.ac.createGain();
            reverbGain.gain.value = 0.05;

            reverbGain.connect(audioContext.destination);
            reverbNode.connect(reverbGain);
            wavesurfer.backend.gainNode.connect(reverbNode);


        });

        /* EQ
         */

        var EQ = [{
            f: 32,
            type: 'lowshelf'
        }, {
            f: 64,
            type: 'peaking'
        }, {
            f: 125,
            type: 'peaking'
        }, {
            f: 250,
            type: 'peaking'
        }, {
            f: 500,
            type: 'peaking'
        }, {
            f: 1000,
            type: 'peaking'
        }, {
            f: 2000,
            type: 'peaking'
        }, {
            f: 4000,
            type: 'peaking'
        }, {
            f: 8000,
            type: 'peaking'
        }, {
            f: 16000,
            type: 'highshelf'
        }];

        // Create filters
        var filters = EQ.map(function(band) {
            var filter = wavesurfer.backend.ac.createBiquadFilter();
            filter.type = band.type;
            filter.gain.value = 0;
            filter.Q.value = 1;
            filter.frequency.value = band.f;
            return filter;
        });

        // Connect filters to wavesurfer
        wavesurfer.backend.setFilters(filters);

        // Bind filters to vertical range sliders
        var container = document.querySelector('#granular-engine-pitch-container');
        filters.forEach(function (filter) {
            var input = document.createElement('input');
            wavesurfer.util.extend(input, {
                type: 'range',
                min: -40,
                max: 40,
                value: 0,
                title: filter.frequency.value
            });
            input.style.display = 'inline-block';
            input.setAttribute('orient', 'vertical');
            wavesurfer.drawer.style(input, {
                'webkitAppearance': 'slider-vertical',
                width: '50px',
                height: '150px'
            });
            container.appendChild(input);

            var onChange = function (e) {
                filter.gain.value = ~~e.target.value;
            };

            input.addEventListener('input', onChange);
            input.addEventListener('change', onChange);
        });

        // For debugging
        wavesurfer.filters = filters;

    });

});
// Report errors
wavesurfer.on('error', function(err) {
    console.error(err);
});

// Do something when the clip is over
wavesurfer.on('finish', function() {
    console.log('Finished playing');
});


/* Progress bar */
document.addEventListener('DOMContentLoaded', function() {
    var progressDiv = document.querySelector('#progress-bar');
    var progressBar = progressDiv.querySelector('.progress-bar');

    var showProgress = function(percent) {
        progressDiv.style.display = 'block';
        progressBar.style.width = percent + '%';
    };

    var hideProgress = function() {
        progressDiv.style.display = 'none';
    };

    wavesurfer.on('loading', showProgress);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('error', hideProgress);
});


// Drag'n'drop
document.addEventListener('DOMContentLoaded', function() {
    var toggleActive = function(e, toggle) {
        e.stopPropagation();
        e.preventDefault();
        toggle ? e.target.classList.add('wavesurfer-dragover') :
            e.target.classList.remove('wavesurfer-dragover');
    };

    var handlers = {
        // Drop event
        drop: function(e) {
            toggleActive(e, false);

            // Load the file into wavesurfer
            if (e.dataTransfer.files.length) {
                wavesurfer.loadBlob(e.dataTransfer.files[0]);
            } else {
                wavesurfer.fireEvent('error', 'Not a file');
            }
        },

        // Drag-over event
        dragover: function(e) {
            toggleActive(e, true);
        },

        // Drag-leave event
        dragleave: function(e) {
            toggleActive(e, false);
        }
    };

    var dropTarget = document.querySelector('#drop');
    Object.keys(handlers).forEach(function(event) {
        dropTarget.addEventListener(event, handlers[event]);
    });
});

export default wavesurfer;