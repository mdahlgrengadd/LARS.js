'use strict';

//Hardcoded defaults
export const RangeValues = {
    speed: { min: 0.5,max: 4},
    periodAbs: { min: 0.001,max: 1},
    periodRel: { min: 0,max: 1},
    periodVar: { min: 0,max: 1},
    position: { min: 0,max: 1},
    positionVar: { min: 0,max: 1},
    durationAbs: { min: 0,max: 1},
    durationRel: { min: 0,max: 1},
    attackAbs: { min: 0,max: 1},
    attackRel: { min: 0,max: 1},
    releaseAbs: { min: 0,max: 1},
    releaseRel: { min: 0,max: 1},
    expRampOffset: { min: 0,max: 1},
    resampling: { min: -2400,max: 2400},
    resamplingVar: { min: -2400,max: 2400},
    gain: { min: 0,max: 1} 
}

//good at speed around 0.75
// set durationAbs = releaseAbs,
// for best results
export const GrainDefs_Piano96k = {
    periodAbs: 0.02,
    periodRel: 0.35,
    periodVar: 0.03,
    position: 1.0,
    positionVar: 0.0,
    durationAbs: 0.15,
    durationRel: 1.0,
    attackAbs: 1.0,
    attackRel: 0.84,
    releaseAbs: 0.15,
    releaseRel: 1.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.29,
    centered: true,
    cyclic: true,
}


export const GrainDefs_Piano96k_downsampled44k = {
    periodAbs: 0.01,
    periodRel: 0.02,
    periodVar: 0.00,
    position: 1.0,
    positionVar: 0.01,
    durationAbs: 1.0,
    durationRel: 0.0,
    attackAbs: 0.91,
    attackRel: 0.69,
    releaseAbs: 0.76,
    releaseRel: 1.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 1200,
    gain: 0.29,
    centered: true,
    cyclic: true,
}

/* Burkig. men minskar när durationRel (150->) ökar.
samtidigt måste periodAbs minska, annars
blir ljudet tyst.*/
export const GrainDefs_EXFUCKINGSTREAM = {
    speed: 0.5,
    periodAbs: 0.001,
    periodRel: 0.0,
    periodVar: 0.0,
    position: 1.0,
    positionVar: 0.01,
    durationAbs: 0.001,
    durationRel: 140,/*!!!!!!!!!!!*/
    attackAbs: 0.12,
    attackRel: 4.0,
    releaseAbs: 1.0,
    releaseRel: 0.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.005,
    centered: true,
    cyclic: true,
}

/* Nice 0.75-> */
/* Smearing percussions when too slow */
export const GrainDefs_OkDefault = {
    speed: 0.5,
    periodAbs: 0.011,
    periodRel: 0.0,
    periodVar: 0.0,
    position: 0.0,
    positionVar: 0.01,
    durationAbs: 0.04,
    durationRel: 8,/*!!!!!!!!!!!*/
    attackAbs: 0.0,
    attackRel: 10.0,
    releaseAbs: 4.0,
    releaseRel: 0.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.005,
    centered: true,
    cyclic: true,
}

/* Nice 0.5-> */
/* sharp drums */
export const GrainDefs_OkSlow = {
    speed: 0.5,
    periodAbs: 0.005,
    periodRel: 0.0,
    periodVar: 0.0,
    position: 1.0,
    positionVar: 0.005,
    durationAbs: 0.00,
    durationRel: 20,/*!!!!!!!!!!!*/
    attackAbs: 30.0,
    attackRel: 1.0,
    releaseAbs: 8.0,
    releaseRel: 0.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.005,
    centered: true,
    cyclic: true,
}


/* Increase durationRel as high as CPU tolerates */
/* Burkljudet försvinner med öakt durationRel */
export const GrainDefs_Allround = {
    speed: 0.5,
    periodAbs: 0.005,
    periodRel: 0.01,
    periodVar: 0.0,
    position: 0.0,
    positionVar: 0.01,
    durationAbs: 0.00,
    durationRel: 70,/*!!!!!!!!!!!*/
    attackAbs: 1.0,
    attackRel: 2.0,
    releaseAbs: 4.0,
    releaseRel: 0.01,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.005,
    centered: true,
    cyclic: true,
}

export const GrainDefs_SuperCleanHalfSpeed = {
    speed: 0.5,
    periodAbs: 0.0003,
    periodRel: 10,
    periodVar: 0.0,
    position: 0.0,
    positionVar: 0.001,
    durationAbs: 0.005,
    durationRel: 20,/*!!!!!!!!!!!*/
    attackAbs: 0.01,
    attackRel: 0.0,
    releaseAbs: 0.0,
    releaseRel: 1.00,
    releaseShape: 'lin',
    expRampOffset: 0.0000,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.23,
    centered: true,
    cyclic: true,
}




//PlayAtSpeed 2.0
export const GrainDefs_Piano192k_downsampled44k2 = {
    speed: 2.0,
    periodAbs: 0.011,
    periodRel: 0.022,
    periodVar: 0.0,
    position: 1.0,
    positionVar: 0.0,
    durationAbs: 1.0,
    durationRel: 0.0,
    attackAbs: 0.91,
    attackRel: 0.69,
    releaseAbs: 0.76,
    releaseRel: 1.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 1200,
    resamplingVar: 0,
    gain: 0.03,
    centered: true,
    cyclic: true,
}

//PlayAtSpeed 2.0
export const GrainDefs_Piano192k_downsampled44k2b = {
    speed: 2.0,
    periodAbs: 0.061,
    periodRel: 0.0,
    periodVar: 0.013,
    position: 1.0,
    positionVar: 0.0,
    durationAbs: 0.36,
    durationRel: 2.0,
    attackAbs: 0.73,
    attackRel: 0.69,
    releaseAbs: 2.0,
    releaseRel: 1.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.06,
    centered: true,
    cyclic: true,
}

//PlayAtSpeed 2.0
export const GrainDefs_Piano192k_downsampled44k = {
    speed: 2.0,
    periodAbs: 0.061,
    periodRel: 0.0,
    periodVar: 0.013,
    position: 1.0,
    positionVar: 0.0,
    durationAbs: 0.1,
    durationRel: 2.0,
    attackAbs: 0.73,
    attackRel: 0.69,
    releaseAbs: 2.0,
    releaseRel: 1.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.06,
    centered: true,
    cyclic: true,
}



export const GrainDefs_Strings = {
    periodAbs: 0.05,
    periodRel: 0,
    periodVar: 0,
    position: 0,
    positionVar: 0.04,
    durationAbs: 0.233,
    durationRel: 0,
    attackAbs: 0,
    attackRel: 0.5,
    releaseAbs: 0,
    releaseRel: 0.5,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 1,
    centered: true,
    cyclic: true,
}

export const GrainDefs_Cello2 = {
    periodAbs: 0.075,
    periodRel: 0,
    periodVar: 0,
    position: 0.26,
    positionVar: 0.025,
    durationAbs: 0.353,
    durationRel: 0.84,
    attackAbs: 0.95,
    attackRel: 0.5,
    releaseAbs: 0.85,
    releaseRel: 0.14,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 1,
    centered: true,
    cyclic: true,
}

export const GrainDefs_Cello1 = {
    periodAbs: 0.09,
    periodRel: 0,
    periodVar: 0,
    position: 0.0,
    positionVar: 0.0,
    durationAbs: 0.15,
    durationRel: 0.99,
    attackAbs: 0.79,
    attackRel: 1.0,
    releaseAbs: 0.82,
    releaseRel: 0.4,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.31,
    centered: true,
    cyclic: true,
}

export const GrainDefs_Cello = {
    periodAbs: 0.09,
    periodRel: 0.09,
    periodVar: 0.22,
    position: 0.0,
    positionVar: 0.0,
    durationAbs: 0.15,
    durationRel: 1.0,
    attackAbs: 0.91,
    attackRel: 0.69,
    releaseAbs: 1.0,
    releaseRel: 1.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.29,
    centered: true,
    cyclic: true,
}

export const GrainDefs_Perc2 = {
    periodAbs: 0.004,
    periodRel: 0,
    periodVar: 0,
    position: 0,
    positionVar: 0.001,
    durationAbs: 0.01,
    durationRel: 0,
    attackAbs: 0,
    attackRel: 0.5,
    releaseAbs: 0,
    releaseRel: 0.5,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 1,
    centered: true,
    cyclic: true,
}

export const GrainDefs_Perc1 = {
    periodAbs: 0.001,
    periodRel: 0,
    periodVar: 0.88,
    position: 1,
    positionVar: 0.000,
    durationAbs: 0.13,
    durationRel: 0,
    attackAbs: 1,
    attackRel: 0.15,
    releaseAbs: 0.02,
    releaseRel: 0.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 1,
    centered: true,
    cyclic: true,
}

export const GrainDefs_Perc = {
    periodAbs: 0.09,
    periodRel: 0,
    periodVar: 0.0,
    position: 0,
    positionVar: 0.000,
    durationAbs: 0.10,
    durationRel: 0.82,
    attackAbs: 1,
    attackRel: 0.07,
    releaseAbs: 0.45,
    releaseRel: 0.0,
    releaseShape: 'lin',
    expRampOffset: 0.0001,
    resampling: 0,
    resamplingVar: 0,
    gain: 0.32,
    centered: true,
    cyclic: true,
}

export const EQ_CELLO = [{
    f: 32,
    type: 'lowshelf',
    value: -40
}, {
    f: 64,
    type: 'peaking',
    value: 9
}, {
    f: 125,
    type: 'peaking',
    value: 2
}, {
    f: 250,
    type: 'peaking',
    value: 8
}, {
    f: 500,
    type: 'peaking',
    value: -14
}, {
    f: 1000,
    type: 'peaking',
    value: 8
}, {
    f: 2000,
    type: 'peaking',
    value: -1
}, {
    f: 4000,
    type: 'peaking',
    value: -1
}, {
    f: 8000,
    type: 'peaking',
    value: 12
}, {
    f: 16000,
    type: 'highshelf',
    value: 16
}];

export const EQ_PERCUSSION = [{
    f: 32,
    type: 'lowshelf',
    value: -10
}, {
    f: 64,
    type: 'peaking',
    value: -15
}, {
    f: 125,
    type: 'peaking',
    value: 8
}, {
    f: 250,
    type: 'peaking',
    value: -12
}, {
    f: 500,
    type: 'peaking',
    value: 0
}, {
    f: 1000,
    type: 'peaking',
    value: -8
}, {
    f: 2000,
    type: 'peaking',
    value: 9
}, {
    f: 4000,
    type: 'peaking',
    value: -1
}, {
    f: 8000,
    type: 'peaking',
    value: 1
}, {
    f: 16000,
    type: 'highshelf',
    value: -6
}];


export const EQ_MIX = [{
    f: 32,
    type: 'lowshelf',
    value: 23
}, {
    f: 64,
    type: 'peaking',
    value: 12
}, {
    f: 125,
    type: 'peaking',
    value: 14
}, {
    f: 250,
    type: 'peaking',
    value: 12
}, {
    f: 500,
    type: 'peaking',
    value: 5
}, {
    f: 1000,
    type: 'peaking',
    value: 6
}, {
    f: 2000,
    type: 'peaking',
    value: 7
}, {
    f: 4000,
    type: 'peaking',
    value: 8
}, {
    f: 8000,
    type: 'peaking',
    value: 15
}, {
    f: 16000,
    type: 'highshelf',
    value: 8
}];



