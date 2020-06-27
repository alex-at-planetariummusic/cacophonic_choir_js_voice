import * as Tone from "tone";

import { Speaker } from './speaker';

const stopButton = document.getElementById('stop');
const distanceInput = document.getElementById('distance');
const randAmtInput = document.getElementById('randAmt');
const crazyButton = document.getElementById('doCrazy');
const listenerX = document.getElementById('listenerX');
const listenerY = document.getElementById('listenerY');

function getRandomAmount() {
    return distance / 100;
}

function setListenerPosition() {
    console.log('setting listener position', listenerX.value, listenerY.value);
    // not sure if casting to Number is necessary
    // Tone.Listener.positionX.targetRampTo(Number(listenerX.value), 10);
    Tone.Listener.setPosition(Number(listenerX.value/1), Number(listenerY.value * 10), 0.1);
    console.log(Tone.Listener.positionX);
}
listenerX.addEventListener('input', setListenerPosition);
listenerY.addEventListener('input', setListenerPosition);


let distance = 30;
// just for debugging; can probably read distanceInput.value directly
distanceInput.addEventListener('input', function(v) {
    distance = distanceInput.value;
    console.log('distance:', distanceInput.value);
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