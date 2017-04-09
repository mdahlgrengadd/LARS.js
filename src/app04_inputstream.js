import wavesurfer from './init.js';
import {
    EQ_CELLO,
    EQ_PERCUSSION,
    GrainDefs_Perc,
    GrainDefs_Cello,
    RangeValues
} from './defs.js'

import wavesBasicControllers from 'waves-basic-controllers'; //wavesBasicControllers is an alias in webpack.config.json

const GRAIN_DEFAULT = GrainDefs_Cello;
const EQ_DEFAULT = EQ_CELLO;

var selectedRegion = null;


// Create elan instance
var elan = Object.create(wavesurfer.ELAN);

// Create Elan Wave Segment instance
var elanWaveSegment = Object.create(wavesurfer.ELANWaveSegment);







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
    }
};

/* _MD_
// Handle Regions
// Yes!! This is a horrible HACK!
//
// Note that the SeekTo function in my overridden backend sets up looping.
// wavesurfer.backend.seekTo(selectedRegion.start, selectedRegion.end);
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
    console.log("REGION LOOP MOD: " + ((region.end - region.start) * 44100) % 4096);
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

var setupGrain = function(GrainDefs) {
    var container = document.querySelector('#granular-engine-container');
    container.innerHTML = "";

    var self = wavesurfer.backend;

    /* Initialize granular engine and draw slider */
    for (var k in GrainDefs) {
        //console.log(RangeValues[k]);
        if (typeof RangeValues[k] !== 'undefined') {
            //console.log("Key: " + k);
            var value = GrainDefs[k];
            self.transportedGranularEngine[k] = value;

            // Curry function. Probably better ways to
            // setup up the granular sliders, but can't 
            // figure it out at the moment.
            var sliderFactory = function(k) {
                return function(val) {
                    new wavesBasicControllers.Slider(k, RangeValues[k].min, RangeValues[k].max, 0.01, value, "", '', container, function(val) {
                        self.transportedGranularEngine[k] = val;
                        //console.log("Key is " + k + ", value is " + val);
                    });

                };
            };

            var makeSlider = sliderFactory(k);
            makeSlider(value);


            //console.log("Key is " + k + ", value is" + self.transportedGranularEngine[k]);
        }
    }


    /*

    self.transportedGranularEngine.speed = GrainDefs.speed;
    self.transportedGranularEngine.positionVar = GrainDefs.posvar;
    self.transportedGranularEngine.periodAbs = GrainDefs.period;
    self.transportedGranularEngine.durationAbs = GrainDefs.duration;
    self.transportedGranularEngine.resampling = GrainDefs.resamp;
    self.transportedGranularEngine.resamplingVar = GrainDefs.resvar;


    new wavesBasicControllers.Slider("Position Var", 0, 0.200, 0.001, GrainDefs.posvar, "sec", '', container, function(value) {
        //self.scheduledGranularEngine.positionVar = value;
        self.transportedGranularEngine.positionVar = value;
    });

    new wavesBasicControllers.Slider("Period", 0.001, 0.500, 0.001, GrainDefs.period, "sec", '', container, function(value) {
        //self.scheduledGranularEngine.periodAbs = value;
        self.transportedGranularEngine.periodAbs = value;
    });

    new wavesBasicControllers.Slider("Duration", 0.010, 0.500, 0.001, GrainDefs.duration, "sec", '', container, function(value) {
        //self.scheduledGranularEngine.durationAbs = value;
        self.transportedGranularEngine.durationAbs = value;
    });

    new wavesBasicControllers.Slider("Resampling", -2400, 2400, 1, GrainDefs.resamp, "cent", '', container, function(value) {
        //self.scheduledGranularEngine.resampling = value;
        self.transportedGranularEngine.resampling = value;
    });

    new wavesBasicControllers.Slider("Resampling Var", 0, 1200, 1, GrainDefs.resvar, "cent", '', container, function(value) {
        //self.scheduledGranularEngine.resamplingVar = value;
        self.transportedGranularEngine.resamplingVar = value;
        //self.scheduledGranularEngine.positionVar = value;
        self.transportedGranularEngine.positionVar = value;
    });

    */
}

var setupEQ = function(EQ) {
    // Create filters
    var filters = EQ.map(function(band) {
        var filter = wavesurfer.backend.ac.createBiquadFilter();
        filter.type = band.type;
        filter.gain.value = band.value;
        filter.Q.value = 1;
        filter.frequency.value = band.f;
        return filter;
    });

    // Bind filters to vertical range sliders
    var container = document.querySelector('#granular-engine-pitch-container');
    container.innerHTML = "";
    filters.forEach(function(filter, index) {
        var input = document.createElement('input');
        wavesurfer.util.extend(input, {
            type: 'range',
            min: -40,
            max: 40,
            value: filter.gain.value,
            title: filter.frequency.value
        });
        input.style.display = 'inline-block';
        input.setAttribute('orient', 'vertical');
        wavesurfer.drawer.style(input, {
            'webkitAppearance': 'slider-vertical',
            width: '40px',
            height: '150px'
        });

        var div = document.createElement('div');
        div.style.display = 'inline-block';
        div.innerHTML = '<p style="width:18px;max-width:8px;" id="EQ_' + index + '_title">' + filter.frequency.value + '</p>';
        var div2 = document.createElement('div');
        //div2.style.display = 'inline-block';
        div2.innerHTML = '<p style="width:18px;max-width:8px;" id="EQ_' + index + '">' + filter.gain.value + '</p>';

        div.appendChild(input);
        div.appendChild(div2);
        container.appendChild(div);

        var onChange = function(e) {
            filter.gain.value = ~~e.target.value;
            var el = document.querySelector('#EQ_' + index);
            el.innerHTML = filter.gain.value;

        };

        input.addEventListener('input', onChange);
        input.addEventListener('change', onChange);
    });

    /* LIMITER */
    var hardLimiter = wavesurfer.backend.ac.createDynamicsCompressor();
    hardLimiter.threshold.value = -10.0; // this is the pitfall, leave some headroom
    hardLimiter.knee.value = 0.0; // brute force
    hardLimiter.ratio.value = 20.0; // max compression
    hardLimiter.attack.value = 0.005; // 5ms attack
    hardLimiter.release.value = 0.50; // 50ms release

    filters.push(hardLimiter);
    // Connect filters to wavesurfer
    wavesurfer.backend.setFilters(filters);

    // For debugging
    wavesurfer.filters = filters;

}

var setupDropdowns = function(e) {
    $("#EQ_string_preset").click(function(e) {
        //do something
        console.log("Loading string preset...");
        setupEQ(EQ_CELLO);

        e.preventDefault();
    });

    $("#EQ_percussion_preset").click(function(e) {
        //do something
        console.log("Loading percussion preset...");
        setupEQ(EQ_PERCUSSION);
        e.preventDefault();
    });

    $("#Grain_string_preset").click(function(e) {
        //do something
        console.log("Loading string preset...");

        setupGrain(GrainDefs_Cello);
        e.preventDefault();
    });

    $("#Grain_percussion_preset").click(function(e) {
        //do something
        console.log("Loading percussion preset...");
        setupGrain(GrainDefs_Perc);
        e.preventDefault();
    });

    $("#Load_John_Michael").click(function(e) {
        //do something
        wavesurfer.load('http://hz.imslp.info/files/imglnks/usimg/c/cc/IMSLP310846-PMLP164351-bach_bwv1009_carr.mp3');
        setupEQ(EQ_CELLO);
        setupGrain(GrainDefs_Cello);
        e.preventDefault();
    });

    $("#Load_Some_Percussion").click(function(e) {
        //do something
        console.log("Loading some percussion ...");
        wavesurfer.load('http://petrucci.mus.auth.gr/imglnks/usimg/e/ea/IMSLP310845-PMLP164349-bach_cellosuiteno1_carr.mp3');
        setupEQ(EQ_PERCUSSION);
        setupGrain(GrainDefs_Perc);
        e.preventDefault();
    });

}

var setupReverb = function() {
    var reverbGain;
    var audioContext = wavesurfer.backend.getAudioContext();
    reverbjs.extend(audioContext);
    // 2) Load the impulse response; upon load, connect it to the audio output.
    //var reverbUrl = "http://reverbjs.org/Library/KinoullAisle.m4a";
    var reverbUrl = "http://reverbjs.org/Library/AbernyteGrainSilo.m4a";
    var reverbNode = audioContext.createReverbFromUrl(reverbUrl, function() {
        reverbGain = wavesurfer.backend.ac.createGain();
        reverbGain.gain.value = 0.08;

        reverbGain.connect(audioContext.destination);
        reverbNode.connect(reverbGain);
        wavesurfer.backend.gainNode.connect(reverbNode);
    });
}

//wavesurfer.on('ready', function() {
document.addEventListener('DOMContentLoaded', function() {

    /* ELAN */
    /*elan.on('select', function(start, end) {
        wavesurfer.backend.play(start, end);
    });

    //set up listener for when elan is done
    elan.on('ready', function(data) {
        //go load the wave form
        wavesurfer.load('./transcripts/001z.mp3');

        //add some styling to elan table
        var classList = elan.container.querySelector('table').classList;
        ['table', 'table-striped', 'table-hover'].forEach(function(cl) {
            classList.add(cl);
        });
    });

    //init elan
    elan.init({
        url: './transcripts/001z.xml',
        container: '#annotations',
        tiers: {
            Text: true,
            Comments: true
        }
    });*/


        /* InputStream */

        var microphone = Object.create(wavesurfer.InputStream);

        microphone.init({
            wavesurfer: wavesurfer
        });

        microphone.on('deviceReady', function(stream) {
            console.log('InputStream ready!', stream);
        });
        microphone.on('deviceError', function(code) {
            console.warn('InputStream error: ' + code);
        });

        // start the microphone
        microphone.start();


    wavesurfer.on('ready', function() {
        /* Options for elan wavesegment */
        var options = {
            container: '#waveform',
            waveColor: 'navy',
            progressColor: 'blue',
            loaderColor: 'purple',
            cursorColor: 'navy',
            selectionColor: '#d0e9c6',
            backend: 'WebAudio',
            normalize: true,
            loopSelection: false,
            renderer: 'Canvas',
            waveSegmentRenderer: 'Canvas',
            waveSegmentHeight: 50,
            height: 100,
            plotTimeEnd: wavesurfer.backend.getDuration(),
            wavesurfer: wavesurfer,
            ELAN: elan,
            scrollParent: false
        };


        //elanWaveSegment.init(options);

        /*

        //console.log(wavesurfer);
        // Add some more GUI components for setting different options....
        var selectedRegion = null;

        // Regions
        if (wavesurfer.enableDragSelection) {
            wavesurfer.enableDragSelection({
                color: 'rgba(0, 255, 0, 0.1)'
            });
        }

        // Tempo slider
        var slider = document.querySelector('[data-action="zoom"]');

        slider.value = 500; //wavesurfer.params.minPxPerSec;
        slider.min = 250;

        slider.addEventListener('input', function() {
            wavesurfer.setPlaybackRate(Number(this.value * 2) / 1000); //Range from 0 - 2.
        });

        //Setup some basic hooks
        //setupDropdowns();
        //setupGrain(GRAIN_DEFAULT);
        //setupEQ(EQ_DEFAULT);
        //setupReverb();
  */
    });

/*

    var prevAnnotation, prevRow, region;
    var onProgress = function(time) {
        elanWaveSegment.onProgress(time);
        var annotation = elan.getRenderedAnnotation(time);

        if (prevAnnotation != annotation) {
            prevAnnotation = annotation;

            region && region.remove();
            region = null;

            if (annotation) {
                // Highlight annotation table row
                var row = elan.getAnnotationNode(annotation);
                prevRow && prevRow.classList.remove('success');
                prevRow = row;
                row.classList.add('success');
                var before = row.previousSibling;
                if (before) {
                    elan.container.scrollTop = before.offsetTop;
                }

                // Region
                region = wavesurfer.addRegion({
                    start: annotation.start,
                    end: annotation.end,
                    resize: false,
                    color: 'rgba(223, 240, 216, 0.7)'
                });
            }
        }
    };

    wavesurfer.on('audioprocess', onProgress);
*/

});


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

function utilRemoveRegion(ws, id) {
    if (ws.Regions.list == undefined) return;
    Object.keys(ws.Regions.list).forEach(function(id) {
        var item = ws.Regions.list[id];
        if (item.id == id) {
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