'use strict';

// Create an instance
//FIXME: Works, but dont now if this is correct way to do it?!

//import * as WaveSurfer from 'wavesurfer'; 
// _MD_ Don't now if this is correct way to do it?!
import WaveSurferES6 from './webaudio_ircam.js';var WaveSurfer = WaveSurferES6.WaveSurfer;
import {EQ_PERCUSSION as EQ} from './defs.js'
import * as Region from 'wavesurfer-regions';
import * as ELAN from 'wavesurfer-elan';
import * as WaveSegment from 'wavesurfer-elan-wave-segment';
import * as InputStream from './wavesurfer.inputstream.js';

//console.log(EQ);

console.log(WaveSurfer);

var wavesurfer = Object.create(WaveSurfer);

// Init & load audio file
document.addEventListener('DOMContentLoaded', function() {
    /*var options = {
        container: document.querySelector('#waveform'),
        waveColor: 'violet',
        progressColor: 'purple',
        backend: 'WebAudio',
        cursorColor: 'navy'
    };*/
    var options = {
        container     : '#waveform',
        waveColor     : 'navy',
        progressColor : 'blue',
        loaderColor   : 'purple',
        cursorColor   : 'navy',
        selectionColor: '#d0e9c6',
        backend: 'WebAudio',
        normalize: false,
        barWidth: 2,
        loopSelection : false,
        renderer: 'Canvas',
        waveSegmentRenderer: 'Canvas',
        waveSegmentHeight: 50,
        height: 100,
    };


    if (location.search.match('scroll')) {
        options.minPxPerSec = 100;
        options.scrollParent = true;
    }

    // Init
    wavesurfer.init(options);
    // Load audio from URL
    //wavesurfer.load('assets/demo.wav');
    //wavesurfer.load('https://upload.wikimedia.org/wikipedia/commons/4/43/JOHN_MICHEL_CELLO-J_S_BACH_CELLO_SUITE_1_in_G_Prelude.ogg');
//    var leftVideo = document.getElementById('single-song');
//    wavesurfer.load(leftVideo);
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
    var dropMessage = document.querySelector('#dropmessage');
    var waveForm = document.querySelector('#waveform');


    var showProgress = function(percent) {
        waveForm.style.visibility = 'visible';
        waveForm.style.display = 'block';

        progressDiv.style.display = 'block';
        progressDiv.style.visibility = 'visible';

        progressBar.style.width = percent + '%';
    };

    var showMessage = function(percent) {
        waveForm.style.visibility = 'hidden';
        waveForm.style.display = 'none';


        dropMessage.style.display = 'block';
        dropMessage.style.visibility = 'visible';

    };


    var hideProgress = function() {
        progressDiv.style.display = 'none';
        progressDiv.style.visibility = 'hidden';
    };

    var hideMessage = function() {
        dropMessage.style.display = 'none';
        dropMessage.style.visibility = 'hidden';
    };

    wavesurfer.on('loading', showProgress);
    wavesurfer.on('loading', hideMessage);
    wavesurfer.on('ready', hideProgress);
    wavesurfer.on('ready', hideMessage);
    wavesurfer.on('destroy', hideProgress);
    wavesurfer.on('destroy', showMessage);
    wavesurfer.on('error', hideProgress);
    wavesurfer.on('error', showMessage);

    hideProgress();
    showMessage();
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