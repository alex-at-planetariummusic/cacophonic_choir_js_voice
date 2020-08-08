import * as Tone from "tone";

import { Speaker } from './speaker';
import { nextWord, initialize } from './wordpicker'

window.nextWord = nextWord;

const stopButton = document.getElementById('stop');
const randAmtInput = document.getElementById('randAmt');
const distanceInput = document.getElementById('distance');
const wordLevelInput = document.getElementById('wordLevel');
const playButton = document.getElementById('play');
const listenerX = document.getElementById('listenerX');
const listenerY = document.getElementById('listenerY');
const listenerOrientation = document.getElementById('listenerOrientation');


// Initialize the listener
Tone.Listener.setPosition(300, 300, 0);

function setListenerPosition() {
    // console.log('setting listener position', listenerX.value, listenerY.value);
    // not sure if casting to Number is necessary
    // Tone.Listener.positionX.targetRampTo(Number(listenerX.value), 10);
    Tone.Listener.setPosition(Number(listenerX.value), Number(listenerY.value), 0.1);
}
listenerX.addEventListener('input', setListenerPosition);
listenerY.addEventListener('input', setListenerPosition);

listenerOrientation.addEventListener('input', function() {
    const radians = listenerOrientation.value;
    Tone.Listener.setOrientation(
        // Tone.Listener.positionX + Math.cos(radians), // TODO: maybe this is the way to set t?
        // Tone.Listener.positionY + Math.sin(radians),
        Math.cos(radians),
        Math.sin(radians),
        0,
        0,
        0,
        1
    );
})

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
    speakers.forEach(s => s.stop());
});

playButton.addEventListener('click', play);

let speaker;

async function play() {
    console.log('play');
    await Tone.start();
    speakers.forEach(s => s.start());
}

const speakers = [];

async function initializeSpeakers() {
    await initialize();
    const distance_between_agents = 300;

    let speakerId = 0;
    for(let x = 0; x <= 2 * distance_between_agents; x = x + distance_between_agents) {
        for(let y = 0; y <= 2 * distance_between_agents; y = y + distance_between_agents) {
            const id = speakerId++;

            const nextWordCallback = function(level) {
                const word = nextWord(id, level);
                // console.log('next word: ' + word + '; level: ' + level);
                return word;
            }
            speakers.push(new Speaker(nextWordCallback, x, y));
        }
    }

}

initializeSpeakers();