import * as Tone from "tone";

import { Speaker } from './speaker';

const stopButton = document.getElementById('stop');
const distanceInput = document.getElementById('distance');
const randAmtInput = document.getElementById('randAmt');
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


let distance = 30;
// just for debugging; can probably read distanceInput.value directly
distanceInput.addEventListener('input', function(v) {
    distance = distanceInput.value;
    console.log('distance:', distanceInput.value);
    // if (speaker) {
    //     speaker.randomAmount = getRandomAmount()
    // }
});


let randAmt = 0.5;

randAmtInput.addEventListener('input', function(v) {
    randAmt = randAmtInput.value;
    console.log('randAmtInput:', randAmtInput.value);
    if (speaker) {
        speaker.randomAmount = randAmt
    }
});


stopButton.addEventListener('click', function() {
    console.log('stop');
    if (speaker) {
        speaker.stop();
    }
});

crazyButton.addEventListener('click', playCrazy)

let speaker;

function playCrazy() {
    console.log('playCrazy');
    if (!speaker) {
        speaker = new Speaker(getRandomAmount());
    }
    speaker.start();
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