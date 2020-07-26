import * as Tone from "tone";

import { Speaker } from './speaker';
import { nextWord } from './wordpicker'

window.nextWord = nextWord;

const stopButton = document.getElementById('stop');
const randAmtInput = document.getElementById('randAmt');
const playButton = document.getElementById('play');
const listenerX = document.getElementById('listenerX');
const listenerY = document.getElementById('listenerY');
const wordLevelInput = document.getElementById('wordLevel');

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

playButton.addEventListener('click', play);

let speaker;

function play() {
    console.log('play');
    if (!speaker) {
        const nextWordCallback = function() {
            const wordLevel = wordLevelInput.value;
            const word = nextWord(1, wordLevel);

            console.log('next word: ' + word + '; level: ' + wordLevel);

            return word;

        }
        speaker = new Speaker(randAmt, nextWordCallback);
    }
    speaker.start();
}