'use strict';

// the granularEngine is used for pitch tracking
// FIXME: For now globbaly declared. Find better solution!
import * as WaveSurfer from 'wavesurfer'; // _MD_ Don't now if this is correct way to do it?!

WaveSurfer.WebAudio = {
    scriptBufferSize: 256,
    PLAYING_STATE: 0,
    PAUSED_STATE: 1,
    FINISHED_STATE: 2,

    supportsWebAudio: function() {
        return !!(window.AudioContext || window.webkitAudioContext);

    },

    getAudioContext: function() {
        if (!WaveSurfer.WebAudio.audioContext) {
            this.wavesAudio = require('waves-audio'); // _MD_
            this.wavesLoaders = require('waves-loaders');
            // _MD_ // WaveSurfer.WebAudio.audioContext = new (
            // _MD_ //    window.AudioContext || window.webkitAudioContext
            // _MD_ //);
            //console.log("getAudioContext: " + this.wavesAudio.audioContext); // _MD_
            WaveSurfer.WebAudio.audioContext = this.wavesAudio.audioContext; // _MD_
        }

        return WaveSurfer.WebAudio.audioContext;
    },

    getOfflineAudioContext: function(sampleRate) {
        if (!WaveSurfer.WebAudio.offlineAudioContext) {
            WaveSurfer.WebAudio.offlineAudioContext = new(
                window.OfflineAudioContext || window.webkitOfflineAudioContext
            )(1, 2, sampleRate);
        }
        return WaveSurfer.WebAudio.offlineAudioContext;
    },

    init: function(params) {
        this.params = params;
        this.ac = params.audioContext || this.getAudioContext();

        this.lastPlay = this.ac.currentTime;
        this.startPosition = 0;
        this.scheduledPause = null;

        this.states = [
            Object.create(WaveSurfer.WebAudio.state.playing),
            Object.create(WaveSurfer.WebAudio.state.paused),
            Object.create(WaveSurfer.WebAudio.state.finished)
        ];

        this.createVolumeNode();
        this.createScriptNode();
        this.createAnalyserNode();

        this.setState(this.PAUSED_STATE);
        this.setPlaybackRate(this.params.audioRate);
        this.setLength(0);
    },

    disconnectFilters: function() {
        if (this.filters) {
            this.filters.forEach(function(filter) {
                filter && filter.disconnect();
            });
            this.filters = null;
            // Reconnect direct path
            this.analyser.connect(this.gainNode);
        }
    },

    setState: function(state) {
        if (this.state !== this.states[state]) {
            this.state = this.states[state];
            this.state.init.call(this);
        }
    },

    // Unpacked filters
    setFilter: function() {
        this.setFilters([].slice.call(arguments));
    },

    /**
     * @param {Array} filters Packed ilters array
     */
    setFilters: function(filters) {
        // Remove existing filters
        this.disconnectFilters();

        // Insert filters if filter array not empty
        if (filters && filters.length) {
            this.filters = filters;

            // Disconnect direct path before inserting filters
            this.analyser.disconnect();

            // Connect each filter in turn
            filters.reduce(function(prev, curr) {
                prev.connect(curr);
                return curr;
            }, this.analyser).connect(this.gainNode);
        }

    },

    createScriptNode: function() {
        if (this.ac.createScriptProcessor) {
            this.scriptNode = this.ac.createScriptProcessor(this.scriptBufferSize);
        } else {
            this.scriptNode = this.ac.createJavaScriptNode(this.scriptBufferSize);
        }

        this.scriptNode.connect(this.ac.destination);
    },

    _MD_ORIG_addOnAudioProcess: function() {
        var my = this;

        this.scriptNode.onaudioprocess = function() {
            var time = my.getCurrentTime();

            if (time >= my.getDuration()) {
                my.setState(my.FINISHED_STATE);
                my.fireEvent('pause');
            } else if (time >= my.scheduledPause) {
                my.pause();
            } else if (my.state === my.states[my.PLAYING_STATE]) {
                my.fireEvent('audioprocess', time);
            }
        };
    },
    addOnAudioProcess: function() {
        var my = this;

        this.scriptNode.onaudioprocess = function(e) {
            var time = my.getCurrentTime();

            if (time >= my.getDuration() || time < 0) {
                my.setState(my.FINISHED_STATE);
                my.fireEvent('pause');
            } else if (time >= my.scheduledPause && my.playControl && !my.playControl.loop) {
                my.setState(my.PAUSED_STATE);
                my.fireEvent('pause');
            } else if (my.state === my.states[my.PLAYING_STATE]) {
                my.fireEvent('audioprocess', time);
            }

        };
    },

    removeOnAudioProcess: function() {
        this.scriptNode.onaudioprocess = null;
    },

    createAnalyserNode: function() {
        this.analyser = this.ac.createAnalyser();
        this.analyser.connect(this.gainNode);
    },

    /**
     * Create the gain node needed to control the playback volume.
     */
    createVolumeNode: function() {
        // Create gain node using the AudioContext
        if (this.ac.createGain) {
            this.gainNode = this.ac.createGain();
        } else {
            this.gainNode = this.ac.createGainNode();
        }
        // Add the gain node to the graph
        this.gainNode.connect(this.ac.destination);
    },

    /**
     * Set the gain to a new value.
     *
     * @param {Number} newGain The new gain, a floating point value
     * between 0 and 1. 0 being no gain and 1 being maximum gain.
     */
    setVolume: function(newGain) {
        this.gainNode.gain.value = newGain;
    },

    /**
     * Get the current gain.
     *
     * @returns {Number} The current gain, a floating point value
     * between 0 and 1. 0 being no gain and 1 being maximum gain.
     */
    getVolume: function() {
        return this.gainNode.gain.value;
    },

    decodeArrayBuffer: function(arraybuffer, callback, errback) {
        if (!this.offlineAc) {
            this.offlineAc = this.getOfflineAudioContext(this.ac ? this.ac.sampleRate : 44100);
        }
        this.offlineAc.decodeAudioData(arraybuffer, (function(data) {
            callback(data);
        }).bind(this), errback);
    },

    /**
     * Set pre-decoded peaks.
     */
    setPeaks: function(peaks) {
        this.peaks = peaks;
    },

    /**
     * Set the rendered length (different from the length of the audio).
     */
    setLength: function(length) {
        // No resize, we can preserve the cached peaks.
        if (this.mergedPeaks && length == ((2 * this.mergedPeaks.length - 1) + 2)) {
            return;
        }

        this.splitPeaks = [];
        this.mergedPeaks = [];
        // Set the last element of the sparse array so the peak arrays are
        // appropriately sized for other calculations.
        var channels = this.buffer ? this.buffer.numberOfChannels : 1;
        for (var c = 0; c < channels; c++) {
            this.splitPeaks[c] = [];
            this.splitPeaks[c][2 * (length - 1)] = 0;
            this.splitPeaks[c][2 * (length - 1) + 1] = 0;
        }
        this.mergedPeaks[2 * (length - 1)] = 0;
        this.mergedPeaks[2 * (length - 1) + 1] = 0;
    },

    /**
     * Compute the max and min value of the waveform when broken into
     * <length> subranges.
     * @param {Number} length How many subranges to break the waveform into.
     * @param {Number} first First sample in the required range.
     * @param {Number} last Last sample in the required range.
     * @returns {Array} Array of 2*<length> peaks or array of arrays
     * of peaks consisting of (max, min) values for each subrange.
     */
    getPeaks: function(length, first, last) {
        if (this.peaks) {
            return this.peaks;
        }

        this.setLength(length);

        var sampleSize = this.buffer.length / length;
        var sampleStep = ~~(sampleSize / 10) || 1;
        var channels = this.buffer.numberOfChannels;

        for (var c = 0; c < channels; c++) {
            var peaks = this.splitPeaks[c];
            var chan = this.buffer.getChannelData(c);

            for (var i = first; i <= last; i++) {
                var start = ~~(i * sampleSize);
                var end = ~~(start + sampleSize);
                var min = 0;
                var max = 0;

                for (var j = start; j < end; j += sampleStep) {
                    var value = chan[j];

                    if (value > max) {
                        max = value;
                    }

                    if (value < min) {
                        min = value;
                    }
                }

                peaks[2 * i] = max;
                peaks[2 * i + 1] = min;

                if (c == 0 || max > this.mergedPeaks[2 * i]) {
                    this.mergedPeaks[2 * i] = max;
                }

                if (c == 0 || min < this.mergedPeaks[2 * i + 1]) {
                    this.mergedPeaks[2 * i + 1] = min;
                }
            }
        }

        return this.params.splitChannels ? this.splitPeaks : this.mergedPeaks;
    },

    getPlayedPercents: function() {
        return this.state.getPlayedPercents.call(this);
    },

    disconnectSource: function() {
        if (this.source) {
            this.source.disconnect();
        }
    },

    destroy: function() {
        if (!this.isPaused()) {
            this.pause();
        }
        this.unAll();
        this.buffer = null;
        this.disconnectFilters();
        this.disconnectSource();
        this.gainNode.disconnect();
        this.scriptNode.disconnect();
        this.analyser.disconnect();
        // close the audioContext if closeAudioContext option is set to true
        if (this.params.closeAudioContext) {
            // check if browser supports AudioContext.close()
            if (typeof this.ac.close === 'function' && this.ac.state != 'closed') {
                this.ac.close();
            }
            // clear the reference to the audiocontext
            this.ac = null;
            // clear the actual audiocontext, either passed as param or the
            // global singleton
            if (!this.params.audioContext) {
                WaveSurfer.WebAudio.audioContext = null;
            } else {
                this.params.audioContext = null;
            }
            // clear the offlineAudioContext
            WaveSurfer.WebAudio.offlineAudioContext = null;
        }
    },

    load: function(buffer) {
        this.startPosition = 0;
        this.lastPlay = this.ac.currentTime;
        this.buffer = buffer;
        this.createSource();
    },

    createSource: function() {
        var self = this;
/*
        function setupSegmentPlayer() {

            var audioContext = self.wavesAudio.audioContext;
            var loader = new self.wavesLoaders.SuperLoader(); // instantiate loader

            var assets = [
                "./assets/3_4_Guitar30bpm96khz32bit.wav",
                "./assets/3_4_guitar-loop.json"
            ];

            // load audio and marker files
            loader.load(assets).then(function(loaded) {
                var audioBuffer = loaded[0];
                var markerBuffer = loaded[1];

                self.scheduledSegmentEngine.connect(WaveSurfer.WebAudio.audioContext.destination);

                // create transport with play control and transported segment engine
                var _chord = markerBuffer.VI;
                var loopstart = _chord[0];
                var loopend = _chord[_chord.length - 1];

                self.transportedSegmentEngine = new self.wavesAudio.SegmentEngine({
                    buffer: audioBuffer,
                    positionArray: _chord,
                    durationArray: markerBuffer.duration,
                    offsetArray: markerBuffer.offset,
                    durationRel: 0.95,
                    releaseAbs: 0.005,
                    releaseRel: 0.005,
                    cyclic: true,

                });

                self.transportedSegmentEngine.connect(WaveSurfer.WebAudio.audioContext.destination);
                //self.transport.add(self.transportedSegmentEngine);


                var playControl = new self.wavesAudio.PlayControl(self.transportedSegmentEngine);

                console.log(loopend);
                playControl.setLoopBoundaries(loopstart, loopend);
                playControl.loop = true;


                playControl.speed = 1.0 * 2.0;
                playControl.seek(loopstart);
                
                playControl.start();
            });


        }
*/
/*
        function setupMetronome() {
            self.metronome = new self.wavesAudio.Metronome();
            self.metronome.period = 60 / 86.49997514133682;
            self.metronome.clickFreq = 666;
            self.metronome.phase = 0;
            self.metronome.gain = 0;
            self.metronome.connect(WaveSurfer.WebAudio.audioContext.destination);
        }
*/
        function setupGranular() {

            // get scheduler and create scheduled granular engine
            self.scheduler = self.wavesAudio.getScheduler();
            self.scheduledGranularEngine = new self.wavesAudio.GranularEngine({
                buffer: self.source.buffer
            });
            self.scheduledGranularEngine.connect(self.analyser);

            // create transport with play control and transported granular engine
            //console.log(self.transportedGranularEngine);
            self.transportedGranularEngine = new self.wavesAudio.GranularEngine({
                buffer: self.source.buffer,
                cyclic: true
            });



            //self.transportedGranularEngine.connect(self.analyser);
            //self.transport.add(self.transportedGranularEngine);

            self.scheduler.add(self.scheduledGranularEngine);



        }

        this.disconnectSource();
        this.source = this.ac.createBufferSource();

        //adjust for old browsers.
        this.source.start = this.source.start || this.source.noteGrainOn;
        this.source.stop = this.source.stop || this.source.noteOff;

        this.source.playbackRate.value = this.playbackRate;
        this.source.buffer = this.buffer;
        // _MD_ // this.source.connect(this.analyser);


        // create transport and add engines
        this.transport = new this.wavesAudio.Transport();

        setupGranular();
        //setupMetronome();
        //setupSegmentPlayer();



        //this.transport.add(this.metronome);

        var scheduler = this.wavesAudio.getScheduler();
        //scheduler.add(this.metronome);


        // create play control
        this.playControl = new this.wavesAudio.PlayControl(this.transport);

    },

    isPaused: function() {
        return this.state !== this.states[this.PLAYING_STATE];
    },

    getDuration: function() {
        if (!this.buffer) {
            return 0;
        }
        return this.buffer.duration;
    },

    ORIGseekTo: function(start, end) {
        if (!this.buffer) {
            return;
        }

        this.scheduledPause = null;

        if (start == null) {
            start = this.getCurrentTime();
            if (start >= this.getDuration()) {
                start = 0;
            }
        }
        if (end == null) {
            end = this.getDuration();
        }

        this.startPosition = start;
        this.lastPlay = this.ac.currentTime;

        if (this.state === this.states[this.FINISHED_STATE]) {
            this.setState(this.PAUSED_STATE);
        }

        return {
            start: start,
            end: end
        };
    },
    seekTo: function(start, end) {
        var doLoop = true;

        if (start == null) {
            start = this.getCurrentTime();
            if (start >= this.getDuration()) {
                start = 0;
            }
        }
        if (end == null) {
            end = this.getDuration();
            doLoop = false;
        }
        //this.startPosition = start; 
        this.startPosition = 0;
        this.lastPlay = this.ac.currentTime;

        if (this.state === this.states[this.FINISHED_STATE]) {
            this.setState(this.PAUSED_STATE);
        }
        // When loop is true, an undesired behavior makes seeking 
        // beyond loopEnd change the position so that it fits inside 
        // loop region. This ugly fix turns off looping when seeking
        // outside loop region. (Also when playing in reverse (speed < 0), 
        // the same happens at loopStart).
        if (!doLoop) {
            this.playControl.setLoopBoundaries(0, this.getDuration());
        } else {
            this.playControl.setLoopBoundaries(start, end);
        }


        this.playControl.seek(start);
        this.playControl.loop = doLoop;

        this.scheduledPause = end;

        //console.log("start: " + start + " end: " + end);   

        return {
            start: start,
            end: end
        };
    },

    ORIGgetPlayedTime: function() {
        return (this.ac.currentTime - this.lastPlay) * this.playbackRate;
    },
    getPlayedTime: function() {
        //console.log(this.playControl.currentPosition);
        this.scheduledGranularEngine.position = this.playControl.currentPosition;
        return (this.playControl.currentPosition); //.mod(this.getDuration());
        //return (this.ac.currentTime - this.lastPlay) * this.playbackRate * this.playControl.speed;
    },

    /**
     * Plays the loaded audio region.
     *
     * @param {Number} start Start offset in seconds,
     * relative to the beginning of a clip.
     * @param {Number} end When to stop
     * relative to the beginning of a clip.
     */
    ORIGplay: function(start, end) {
        if (!this.buffer) {
            return;
        }

        // need to re-create source on each playback
        this.createSource();

        var adjustedTime = this.seekTo(start, end);

        start = adjustedTime.start;
        end = adjustedTime.end;

        this.scheduledPause = end;

        this.source.start(0, start, end - start);

        if (this.ac.state == 'suspended') {
            this.ac.resume && this.ac.resume();
        }

        this.setState(this.PLAYING_STATE);

        this.fireEvent('play');
    },
    play: function(start, end) {
        // need to re-create source on each playback
        //this.createSource();

        var adjustedTime = this.seekTo(start, end);

        start = adjustedTime.start;
        end = adjustedTime.end;

        this.scheduledPause = end;

        //this.source.start(0, start, end - start);
        //play();

        //scheduler.add(this.transportedGranularEngine);

        this.playControl.start();
        this.playControl.seek(start);

        //console.log(start);

        this.setState(this.PLAYING_STATE);

        this.fireEvent('play');
    },


    /**
     * Pauses the loaded audio.
     */
    ORIGpause: function() {
        this.scheduledPause = null;

        this.startPosition += this.getPlayedTime();
        this.source && this.source.stop(0);

        this.setState(this.PAUSED_STATE);

        this.fireEvent('pause');
    },
    pause: function() {
        this.scheduledPause = null;

        this.startPosition += this.getPlayedTime();
        //this.source && this.source.stop(0);

        this.playControl.pause();
        //scheduler.remove(this.transportedGranularEngine);


        this.setState(this.PAUSED_STATE);

        this.fireEvent('pause');
    },

    /**
     *   Returns the current time in seconds relative to the audioclip's duration.
     */
    getCurrentTime: function() {
        return this.state.getCurrentTime.call(this);
    },

    /**
     *   Returns the current playback rate.
     */
    getPlaybackRate: function() {
        return this.playbackRate;
    },

    /**
     * Set the audio source playback rate.
     */
    ORIGsetPlaybackRate: function(value) {
        value = value || 1;
        if (this.isPaused()) {
            this.playbackRate = value;
        } else {
            this.pause();
            this.playbackRate = value;
            this.play();
        }
    },
    setPlaybackRate: function(value) {
        value = value || 1;

        if (this.playControl) {
            this.playControl.speed = value;
        }

        if (this.isPaused()) {
            this.playbackRate = value;
        } else {
            //this.pause();
            this.playbackRate = value;
            //this.play();
        }
    }/*,
    setMetronome: function(tempo, phase) {
        if (tempo > 0) this.metronome.period = (60 / tempo) / this.playbackRate;
        console.log("met: " + this.metronome.period + " - playbackRate: " + this.playbackRate);
        //self.metronome.clickFreq = 666;
        //if(phase != null) this.metronome.phase = phase;
        //console.log(this.metronome);
        this.metronome.resetTime();
    }*/
};

WaveSurfer.WebAudio.state = {};

WaveSurfer.WebAudio.state.playing = {
    init: function() {
        this.addOnAudioProcess();
    },
    getPlayedPercents: function() {
        var duration = this.getDuration();
        return (this.getCurrentTime() / duration) || 0;
    },
    getCurrentTime: function() {
        //_MD_ //return this.startPosition + this.getPlayedTime();
        return this.getPlayedTime();
    }
};

WaveSurfer.WebAudio.state.paused = {
    ORIGinit: function() {
        this.removeOnAudioProcess();
    },
    /* _MD_ */
    init: function() {
        this.removeOnAudioProcess();
        if (this.playControl) {
            this.playControl.pause();
        }


    },
    /* _MD_ */
    getPlayedPercents: function() {
        var duration = this.getDuration();
        return (this.getCurrentTime() / duration) || 0;
    },
    getCurrentTime: function() {
        //_MD_//return this.startPosition;
        return this.getPlayedTime(); //_MD__
    }
};

WaveSurfer.WebAudio.state.finished = {
    init: function() {
        this.playControl.stop(); // _MD_ //
        this.removeOnAudioProcess();
        this.fireEvent('finish');
    },
    getPlayedPercents: function() {
        return 1;
    },
    getCurrentTime: function() {
        return this.getDuration();
    }
};

WaveSurfer.util.extend(WaveSurfer.WebAudio, WaveSurfer.Observer);

export default {
    WaveSurfer
};