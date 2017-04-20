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
import * as TimeLine from 'wavesurfer-timeline'
import * as ELAN from './wavesurfer-elan.json.js';
import * as WaveSegment from 'wavesurfer-elan-wave-segment';
import * as InputStream from './wavesurfer.inputstream.js';

var selectedRegion = null;
var _regionFlag = false; // Seems to be needed to be able to decide if a region was clicked, or not.

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
        autoCenter: false,
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
    //wavesurfer.load('https://api.soundcloud.com/tracks/220790381/stream?client_id=0b4984c1ad516406425dab7232f983f3');

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

    // What to show when: 
    // 1) no waveform is loaded
    // 2) when loading and 
    // 3) when waveform is loaded
    wavesurfer.on('loading', function() {
        showProgress();
        hideMessage();
    });
    wavesurfer.on('ready', function() {
        hideProgress();
        hideMessage();
        var timeline = Object.create(WaveSurfer.Timeline);

        timeline.init({
            wavesurfer: wavesurfer,
            container: "#wave-timeline"
        });
        wavesurfer.drawer.un('click');
        wavesurfer.drawer.on('click', clickOverride);
    });

    wavesurfer.on('destroy', function() {
        hideProgress();
        showMessage();
    });
    wavesurfer.on('error', function() {
        hideProgress();
        showMessage();
        console.error(err);
    });

    // Setup click handling on the waveform
    wavesurfer.on('region-dblclick', regionDblClicked);
    wavesurfer.on('region-click', regionClicked);
    wavesurfer.on('region-update-end', regionUpdated);
    wavesurfer.drawer.on('click', clickOverride);// Override Wavesurfer.Drawer's click handler.

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

// Override Wavesurfer.Drawer's click handler.
// Because if you select/update a region, the click event will 
// still be triggered after, and the default is to seek to "click" position.
// That will also deselect a selection, which in this applicaton case is unwanted.
function clickOverride(event, progress) {

    if (_regionFlag) {
        // A region was clicked
        wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);

    } else {
        // Click happened "outside" a region
        // Unselect old selected region
        if (selectedRegion != null) {
            unselectRegion(selectedRegion);
            selectedRegion = null;
        }
        wavesurfer.backend.seekTo(progress * wavesurfer.getDuration());
        wavesurfer.drawer.progress(wavesurfer.backend.getPlayedPercents());
    }
    _regionFlag = false;
}

function regionClicked(region) {
    _regionFlag = true;
    selectedRegion = region;
}

function regionDblClicked(region) {
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

    // Unselect old selected region
    if (selectedRegion != null) {
        unselectRegion(selectedRegion);
    }

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