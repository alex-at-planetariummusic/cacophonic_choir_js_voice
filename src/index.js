import * as Tone from "tone";

import { Speaker } from './speaker';
import { nextWord } from './wordpicker'

window.nextWord = nextWord;

const stopButton = document.getElementById('stop');
const randAmtInput = document.getElementById('randAmt');
const distanceInput = document.getElementById('distance');
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


wordLevelInput .addEventListener('input', function(v) {
    if (speaker) {
        speaker.wordLevel = Math.floor(Number(wordLevelInput.value));
    }
});

distanceInput .addEventListener('input', function(v) {
    if (speaker) {
        speaker.setDistance(distanceInput.value);
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

async function play() {
    console.log('play');
    await Tone.start();
    if (!speaker) {
        const nextWordCallback = function(level) {
            const wordLevel = wordLevelInput.value;
            const word = nextWord(1, level);
            console.log('next word: ' + word + '; level: ' + level);
            return word;
        }
        speaker = new Speaker(randAmt, nextWordCallback);
    }
    speaker.start();
}