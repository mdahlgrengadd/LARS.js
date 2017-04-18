'use strict';

// Create an instance
//FIXME: Works, but dont now if this is correct way to do it?!

//import * as WaveSurfer from 'wavesurfer'; 
// _MD_ Don't now if this is correct way to do it?!
import WaveSurferES6 from './webaudio_ircam.js';
var WaveSurfer = WaveSurferES6.WaveSurfer;
import {
    EQ_PERCUSSION as EQ
} from './defs.js'
import * as Region from 'wavesurfer-regions';
import * as ELAN from './wavesurfer-elan.json.js';
import * as WaveSegment from 'wavesurfer-elan-wave-segment';
import * as InputStream from './wavesurfer.inputstream.js';

var selectedRegion = null;

var wavesurfer = Object.create(WaveSurfer);

// Zoom slider
var slider;


var GLOBAL_ACTIONS = {
    'play': function() {
        wavesurfer.playPause();
        if (selectedRegion != null) {
            wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);
        }
    },

    'back': function() {
        wavesurfer.skipBackward();
    },

    'forth': function() {
        wavesurfer.skipForward();
    },

    'toggle-mute': function() {
        wavesurfer.toggleMute();
    },
};

// Init & load audio file
document.addEventListener('DOMContentLoaded', function() {
    var options = {
        container: '#waveform',
        waveColor: '#3498db',
        progressColor: '#7f8c8d',
        loaderColor: 'purple',
        cursorColor: 'navy',
        selectionColor: '#d0e9c6',
        backend: 'WebAudio',
        normalize: false,
        barWidth: 1,
        loopSelection: false,
        renderer: 'MultiCanvas',
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
    wavesurfer.load('assets/demo.wav');

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

    wavesurfer.on('region-dblclick', regionDblClicked);
    wavesurfer.on('region-click', regionClicked);
    wavesurfer.on('region-update-end', regionUpdated);

    // Report errors
    wavesurfer.on('error', function(err) {
        console.error(err);
    });

    // Do something when the clip is over
    wavesurfer.on('finish', function() {
        console.log('Finished playing');
    });

    // Add function to zoom into selection
    wavesurfer.zoomTo = zoomTo;

    //Slider
    slider = document.querySelector('[data-action="zoom"]');
    slider.value = wavesurfer.params.minPxPerSec;
    slider.min = 1;


    slider.addEventListener('input', function() {
        var zoomLevel = Number(slider.value);
        wavesurfer.zoom(zoomLevel);
    });

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

// Zoom in to selection
function zoomTo(start, end) {
    var parentWidth = this.drawer.getWidth();

    var pxPerSec = parentWidth / ((end - start));

    this.params.minPxPerSec = pxPerSec;

    this.params.scrollParent = true;

    this.drawBuffer();

    this.seekAndCenter(((end + start) / 2) / this.getDuration());

    this.fireEvent('zoom', pxPerSec);
}


//Remove selection
function unselectRegion(region) {
    utilRemoveRegion(wavesurfer, region.id);
}

//Unhighligt old selection
function unhighlightRegion(region) {
    region.update({
        color: 'rgba(0, 255, 0, 0.1)'
    });
}

/* _MD_
// Override Wavesurfer click so when click on region, that region gets selected.
// Note that the SeekTo function in my overridden backend sets up looping.
// wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);
*/
function clickOverride(region) {
    wavesurfer.drawer.on('click', function(e, progress) {
        //setTimeout(function() {
        var seekpos = progress * wavesurfer.getDuration();

        if (selectedRegion != null) {

            //Check if clicked outside last selected region...
            if (seekpos < selectedRegion.start || seekpos > selectedRegion.end) {
                unselectRegion(selectedRegion);
                selectedRegion = null;
                wavesurfer.backend.seekTo(seekpos);
            } else { // end if seekpos...

                selectedRegion.update({
                    color: 'rgba(41, 128, 185, 0.25)'
                });
                selectedRegion = region;
                wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);
            }
        } else { // end if selectedRegion..
            wavesurfer.backend.seekTo(seekpos);
        }

        wavesurfer.drawer.progress(wavesurfer.backend.getPlayedPercents());
        //}, 0);
    });
}

function regionClicked(region) {
    wavesurfer.drawer.un('click');

    selectedRegion = region;

    clickOverride(region);
}

function regionDblClicked(region) {
    wavesurfer.drawer.un('click');

    wavesurfer.drawer.on('click', function(e, progress) {
        setTimeout(function() {
            wavesurfer.seekTo(); //this will stop audio from looping
        }, 0);
    });
    setTimeout(function() {
        wavesurfer.zoomTo(selectedRegion.start, selectedRegion.end);
        selectedRegion.updateRender();
        slider.value = wavesurfer.params.minPxPerSec;
    }, 0);
}

function regionUpdated(region) {

    if (selectedRegion == region) {
        return;
    }

    if (selectedRegion != null) {
        unselectRegion(selectedRegion);
    }

    selectedRegion = region;
    regionClicked(region);

}

// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('keydown', function(e) {
        var map = {
            32: 'play', // space
            37: 'back', // left
            39: 'forth' // right
        };
        var action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target) {
                e.preventDefault();
            }
            GLOBAL_ACTIONS[action](e);
        }
    });

    [].forEach.call(document.querySelectorAll('[data-action]'), function(el) {
        el.addEventListener('click', function(e) {
            var action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
});

function utilRemoveRegion(ws, region_id) {
    if (ws.regions.list == undefined) return;
    Object.keys(ws.regions.list).forEach(function(item_id) {
        var item = ws.regions.list[item_id];

        if (region_id == item_id) {
            item.remove();
        }
    }, ws.Region);
}



// Misc
document.addEventListener('DOMContentLoaded', function() {
    // Web Audio not supported
    if (!window.AudioContext && !window.webkitAudioContext) {
        var demo = document.querySelector('#demo');
        if (demo) {
            demo.innerHTML = '<img src="/example/screenshot.png" />';
        }
    }


    // Navbar links
    var ul = document.querySelector('.nav-pills');
    var pills = ul.querySelectorAll('li');
    var active = pills[0];
    if (location.search) {
        var first = location.search.split('&')[0];
        var link = ul.querySelector('a[href="' + first + '"]');
        if (link) {
            active = link.parentNode;
        }
    }
    active && active.classList.add('active');
});

export default wavesurfer;
export var selectedRegion;