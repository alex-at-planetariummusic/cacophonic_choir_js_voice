import * as Tone from "tone";

const playButton = document.getElementById('play');
const stopButton = document.getElementById('stop');
const distanceInput = document.getElementById('distance');
const grainSizeInput = document.getElementById('grainSize');
const text = document.getElementById('text');
const crazyButton = document.getElementById('doCrazy');

const context = new Tone.Context();


/**
 * Play unmodified when closer than this
 */
const START_SOUND_PROCESSING_AT_DISTANCE = 30;

function getRandomAmount() {
    return distance / 100;
}

playButton.addEventListener('click', function () {
    console.log('PLAY PRESSED');

    const word = getWord()

    if (word) {
        playBuffer(word);
    } else {
        console.log('no word');
    }

    //create a synth and connect it to the master output (your speakers)
    // const synth = new Tone.Synth().toMaster();

    //play a middle 'C' for the duration of an 8th note
    // new Tone.Synth().toMaster().triggerAttackRelease("C4", "8n");
    // new Tone.Synth().toMaster().triggerAttackRelease("E5", "8n");

});

crazyButton.addEventListener('click', function() {

})

let distance = 100;
// just for debugging; can probably read distanceInput.value directly
distanceInput.addEventListener('input', function(v) {
    distance = distanceInput.value;
    console.log('distance:', distanceInput.value);
});

let grainSize = 0.3;
grainSizeInput.addEventListener('input', function() {
    grainSize = grainSizeInput.value;
    console.log('grainSize:', grainSizeInput.value);
});

stopButton.addEventListener('click', function() {
    console.log('stop');
    if (grainPlayer) {
        grainPlayer.stop();
    }
});

let grainPlayer;
function playBuffer(word) {
    loadBuffer(word, function (buffer) {
        grainPlayer = new Tone.GrainPlayer(buffer).toMaster();

        grainPlayer.playbackRate = 0.5;
        grainPlayer.grainSize = 0.05;
        grainPlayer.overlap = grainPlayer.grainSize / 2;
        grainPlayer.loop = true;

        grainPlayer.start();

        // const player = new Tone.Player(buffer.get()).toMaster();
        // player.start();
    })
}

crazyButton.addEventListener('click', playCrazy)

function playCrazy() {
    loadBuffer(getWord(), function(buffer) {
        console.log('duration:', buffer.duration);
        let position = 0;


        let grainSize = 0.10;

        playGrain(buffer, 0, grainSize);
        
        // context.setTimeout(function() {
        //     const sample = new Tone.Player(buffer.get())
        //         .start();


        // }, 0.0010);

    });
}
// let playing = false;

function playGrain(buffer, time, length) {
    const BASE_RATE = 0.00
    let randAmt = getRandomAmount()

    let rand = Math.random();

    let grainLength;
    let nextTime;

    // TODO: randomize length
    // TODO: scale repeat (don't always repeat at randAmt==1)
    if (rand < randAmt) {
        //repeat
        console.log('repeat');
        grainLength = length;
        nextTime = time;
    } else {
        // fixed for now
        console.log('norepeat');
        grainLength = length;
        nextTime = time + 0.1
    }

    if (nextTime + grainLength > buffer.duration) {
        // TODO: call callback to play next word
        console.log('end');
        return;
    }


    const ampEnv = new Tone.AmplitudeEnvelope({
        "attack": 0.01,
        "decay": 0,
        "sustain": 1.0,
        "release": 0.1
    }).toMaster();

    const sample = new Tone.Player(buffer.get())
        .connect(ampEnv)
        .start(undefined, time, 0.2);

    ampEnv.triggerAttackRelease(grainLength);

    context.setTimeout(function () {
        playGrain(buffer, nextTime, grainLength);
    }, grainLength);
}


// TODO: add error callback probably. 
function loadBuffer(word, callback) {
    const buffer = new Tone.Buffer(`./assets/sounds/${word}.mp3`, 
        function() {
            console.log(`Loaded "${word}"`);
            callback(buffer);
        },
        function(e) {
            console.error('could not load file', e);
        });
}

function getWord() {
    return getWords()[0];
}

function getWords() {
    const words = text.value.split(/\s+/);
    console.log('words:', words);
    return words
}

// var clock = new Tone.Clock(function(time){
// 	console.log(time);
// }, 1);
// clock.start();