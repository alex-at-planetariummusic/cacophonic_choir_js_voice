import * as Tone from "tone";

import { Speaker } from './speaker';

const stopButton = document.getElementById('stop');
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

let randAmt = 0.5;

randAmtInput.addEventListener('input', function(v) {
    randAmt = randAmtInput.value;
    // console.log('randAmtInput:', randAmtInput.value);
    if (speaker) {
        speaker.randomAmount = Number(randAmt);
    }
});


stopButton.addEventListener('click', function() {
    console.log('stop');
    if (speaker) {
        speaker.stop();
    }
});

crazyButton.addEventListener('click', play)

let speaker;

function play() {
    console.log('play');
    if (!speaker) {
        speaker = new Speaker(randAmt);
    }
    speaker.start();
}