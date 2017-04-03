import wavesurfer from './init.js'
import * as Region from 'wavesurfer-regions';
import wavesBasicControllers from 'waves-basic-controllers'; //wavesBasicControllers is an alias in webpack.config.json

//Hardcoded defaults
var GrainDefs = {
    posvar: 0.018,
    period: 0.08,
    duration: 0.353,
    speed: 1,
    resamp: 0,
    resvar: 0
}

var selectedRegion = null;

var GLOBAL_ACTIONS = {
    'play': function () {
        wavesurfer.playPause();
        if (selectedRegion != null) {
            wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);
        }
    },

    'back': function () {
        wavesurfer.skipBackward();
    },

    'forth': function () {
        wavesurfer.skipForward();
    },

    'toggle-mute': function () {
        wavesurfer.toggleMute();
    }
};


/* _MD_
// Handle Regions
*/
wavesurfer.on('region-update-end', function(region) {
    wavesurfer.drawer.un('click');

    if (selectedRegion != null) {
        //console.log(selectedRegion)
        //Unhighligt old selection
        selectedRegion.update({
            color: 'rgba(0, 255, 0, 0.1)'
        });
    }

    //region.start = Math.floor( region.start*44100 / 4096 ) * 4096 / 44100
    //region.end = Math.floor( region.end*44100 / 4096 ) * 4096 / 44100
    console.log("REGION LOOP MOD" + ((region.end - region.start) * 44100) % 4096);
    selectedRegion = region;
    // Hack: Click-to-seek
    wavesurfer.drawer.on('click', function(e, progress) {
        setTimeout(function() {

            var seekpos = progress * wavesurfer.getDuration();

            if (selectedRegion != null) {

                //Check if clicked outside last selected region...
                if (seekpos < selectedRegion.start || seekpos > selectedRegion.end) {
                    //Unhighlight region
                    selectedRegion.update({
                        color: 'rgba(0, 255, 0, 0.1)'
                    });
                    selectedRegion = null;


                    wavesurfer.backend.seekTo(seekpos);
                } else { // end if seekpos...




                    selectedRegion.update({
                        color: 'rgba(255, 0, 0, 0.25)'
                    });
                    selectedRegion = region;



                    wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);
                }
            } else { // end if selectedRegion..
                wavesurfer.backend.seekTo(seekpos);
            }

            wavesurfer.drawer.progress(wavesurfer.backend.getPlayedPercents());
            //region.playLoop();





        }, 0);
    });






});

wavesurfer.on('region-dblclick', function(region) {
    wavesurfer.drawer.un('click');
    // Click-to-seek
    wavesurfer.drawer.on('click', function(e, progress) {
        setTimeout(function() {
            //wavesurfer.seekTo(progress);
            wavesurfer.seekTo(); //this will stop audio from looping
        }, 0);
    });



    setTimeout(function() {
        wavesurfer.zoomTo(selectedRegion.start, selectedRegion.end);
        selectedRegion.updateRender();
        //wavesurfer.seekTo(wavesurfer.backend.getPlayedPercents());
        //region.remove();
        //selectedRegion = null;
    }, 0);
});



wavesurfer.on('region-click', function(region) {
    wavesurfer.drawer.un('click');

    if (selectedRegion != null) {
        //Unhighligt old selection
        selectedRegion.update({
            color: 'rgba(0, 255, 0, 0.1)'
        });
    }

    selectedRegion = region;
    // Hack: Click-to-seek
    wavesurfer.drawer.on('click', function(e, progress) {
        setTimeout(function() {

            var seekpos = progress * wavesurfer.getDuration();

            if (selectedRegion != null) {

                //Check if clicked outside last selected region...
                if (seekpos < selectedRegion.start || seekpos > selectedRegion.end) {
                    //Unhighlight region
                    selectedRegion.update({
                        color: 'rgba(0, 255, 0, 0.1)'
                    });
                    selectedRegion = null;


                    wavesurfer.backend.seekTo(seekpos);
                } else { // end if seekpos...




                    selectedRegion.update({
                        color: 'rgba(255, 0, 0, 0.25)'
                    });
                    selectedRegion = region;

                    wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);
                }
            } else { // end if selectedRegion..
                wavesurfer.backend.seekTo(seekpos);
            }

            wavesurfer.drawer.progress(wavesurfer.backend.getPlayedPercents());
            //region.playLoop();





        }, 0);
    });



});


wavesurfer.on('ready', function() {
    // Add some more GUI components for setting different options....
    var selectedRegion = null;
    var containerId = 'granular-engine-container';
    var pitchContainerId = 'granular-engine-pitch-container';
    // Regions
    if (wavesurfer.enableDragSelection) {
        wavesurfer.enableDragSelection({
                color: 'rgba(0, 255, 0, 0.1)'
            });
        }

    // Zoom slider
    var slider = document.querySelector('[data-action="zoom"]');

    slider.value = 500;//wavesurfer.params.minPxPerSec;
    slider.min = wavesurfer.params.minPxPerSec;

    slider.addEventListener('input', function () {
        //wavesurfer.zoom(Number(this.value));
        wavesurfer.setPlaybackRate(Number(this.value*2)/1000); //Range from 0 - 2.
    });

    // Clear Area so we can insert new sliders
    document.getElementById(containerId).innerHTML = "";
    document.getElementById(pitchContainerId).innerHTML = "";
    pitchContainerId = "#" + pitchContainerId;
    containerId = "#" + containerId;

    var self = wavesurfer.backend;

    // create GUI elements
    new wavesBasicControllers.Title("Equalizer", pitchContainerId);

    //new wavesBasicControllers.Title("Live Performance Controls", containerId);
    //var speedSlider = new wavesBasicControllers.Slider("Speed", -1, 8, 0.01, 1, "", '', containerId, function(value) {
    //    //self.playControl.speed = value;
    //    self.setPlaybackRate(value);
    //    speedSlider.value = value;
    //});

    new wavesBasicControllers.Title("Granular Parameters", containerId);

    new wavesBasicControllers.Slider("Position Var", 0, 0.200, 0.001, GrainDefs.posvar, "sec", '', containerId, function(value) {
        //self.scheduledGranularEngine.positionVar = value;
        self.transportedGranularEngine.positionVar = value;
    });

    new wavesBasicControllers.Slider("Period", 0.001, 0.500, 0.001, GrainDefs.period, "sec", '', containerId, function(value) {
        //self.scheduledGranularEngine.periodAbs = value;
        self.transportedGranularEngine.periodAbs = value;
    });

    new wavesBasicControllers.Slider("Duration", 0.010, 0.500, 0.001, GrainDefs.duration, "sec", '', containerId, function(value) {
        //self.scheduledGranularEngine.durationAbs = value;
        self.transportedGranularEngine.durationAbs = value;
    });

    new wavesBasicControllers.Slider("Resampling", -2400, 2400, 1, GrainDefs.resamp, "cent", '', containerId, function(value) {
        //self.scheduledGranularEngine.resampling = value;
        self.transportedGranularEngine.resampling = value;
    });

    new wavesBasicControllers.Slider("Resampling Var", 0, 1200, 1, GrainDefs.resvar, "cent", '', containerId, function(value) {
        //self.scheduledGranularEngine.resamplingVar = value;
        self.transportedGranularEngine.resamplingVar = value;
                //self.scheduledGranularEngine.positionVar = value;
        self.transportedGranularEngine.positionVar = value;
    });

    //Initial settings
    self.transportedGranularEngine.speed = GrainDefs.speed;
    self.transportedGranularEngine.positionVar = GrainDefs.posvar;
    self.transportedGranularEngine.periodAbs = GrainDefs.period;
    self.transportedGranularEngine.durationAbs = GrainDefs.duration;
    self.transportedGranularEngine.resampling = GrainDefs.resamp;
    self.transportedGranularEngine.resamplingVar = GrainDefs.resvar;

});


// Bind actions to buttons and keypresses
document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keydown', function (e) {
        var map = {
            32: 'play',       // space
            37: 'back',       // left
            39: 'forth'       // right
        };
        var action = map[e.keyCode];
        if (action in GLOBAL_ACTIONS) {
            if (document == e.target || document.body == e.target) {
                e.preventDefault();
            }
            GLOBAL_ACTIONS[action](e);
        }
    });

    [].forEach.call(document.querySelectorAll('[data-action]'), function (el) {
        el.addEventListener('click', function (e) {
            var action = e.currentTarget.dataset.action;
            if (action in GLOBAL_ACTIONS) {
                e.preventDefault();
                GLOBAL_ACTIONS[action](e);
            }
        });
    });
});

function utilRemoveRegion(ws, id) {
        if(ws.Regions.list==undefined) return;
        Object.keys(ws.Regions.list).forEach(function (id) {
            var item = ws.Regions.list[id];
            if(item.id == id) {item.remove();}
        }, ws.Region);
}



// Misc
document.addEventListener('DOMContentLoaded', function () {
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
            active =  link.parentNode;
        }
    }
    active && active.classList.add('active');
});
