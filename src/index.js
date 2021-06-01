// import * as Tone from "tone";
import AUDIO_CONTEXT from "./audio_context";

// import {Speaker} from './speaker';
import {nextWord, initialize} from './wordpicker';
import WebaudioSpeaker from "./webaudio-speaker";

import UniversalListener from "./UniversalListener";

window.nextWord = nextWord;

const stopButton = document.getElementById('stop');
const randAmtInput = document.getElementById('randAmt');
const distanceInput = document.getElementById('distance');
const wordLevelInput = document.getElementById('wordLevel');
const playButton = document.getElementById('play');
const playOneButton = document.getElementById('playone');
const listenerX = document.getElementById('listenerX');
const listenerZ = document.getElementById('listenerZ');
const listenerOrientation = document.getElementById('listenerOrientation');

const listenerTest = document.getElementById("testSimpleLoop")

const DISTANCE_BETWEEN_AGENTS = 40;


UniversalListener.setPosition(0, 0, 0.1)


function setListenerPosition() {
    const positionX = Number(listenerX.value)
    const positionZ = Number(listenerZ.value)
    UniversalListener.setPosition(positionX, undefined, positionZ)
}

listenerX.addEventListener('input', setListenerPosition);
listenerZ.addEventListener('input', setListenerPosition);

listenerOrientation.addEventListener('input', function () {
    const radians = 2 * Math.PI * (listenerOrientation.value / 360);
    const forwardX = Math.cos(radians)
    const forwardY = Math.sin(radians)

    UniversalListener.setOrientation(forwardX, forwardY)
})

let randAmt = 0.5;

randAmtInput.addEventListener('input', function (v) {
    randAmt = randAmtInput.value;
    if (speaker) {
        speaker.randomAmount = Number(randAmt);
    }
});


wordLevelInput.addEventListener('input', function (v) {
    if (speaker) {
        speaker.wordLevel = Math.floor(Number(wordLevelInput.value));
    }
});

distanceInput.addEventListener('input', function (v) {
    if (speaker) {
        speaker.setDistance(distanceInput.value);
    }
});


stopButton.addEventListener('click', function () {
    console.log('stop');
    speakers.forEach(s => s.stop());
});

playButton.addEventListener('click', play);


let speaker;

async function play() {
    console.log('PLAY!!!');
    // await Tone.start();
    speakers.forEach(s => s.start());
}

playOneButton.addEventListener('click', playSingleVoice);

async function playSingleVoice() {
    speakers[4].start()
}

const speakers = [];

async function initializeSpeakers() {
    await initialize();
    // assumption: center is 0,0

    let speakerId = 0;
    for (let x = -DISTANCE_BETWEEN_AGENTS; x <= DISTANCE_BETWEEN_AGENTS; x = x + DISTANCE_BETWEEN_AGENTS) {
        for (let y = -DISTANCE_BETWEEN_AGENTS; y <= DISTANCE_BETWEEN_AGENTS; y = y + DISTANCE_BETWEEN_AGENTS) {
            const id = speakerId++;

            const nextWordCallback = function (level) {
                return nextWord(id, level);
            }
            // console.log('coords: ', x, y);
            speakers.push(new WebaudioSpeaker(nextWordCallback, x, y));
        }
    }
}

initializeSpeakers();

////////////////////////////////////////////////////////////////////
///////////////////// WebAudio test stuff
////////////////////////////////////////////////////////////////////
const playWAButton = document.getElementById('playWA');
const waRandomInput = document.getElementById('WARandom');

const waSpeakers = []

playWAButton.addEventListener('click', () => {

    // let speakerId = 0;
    // for (let x = -DISTANCE_BETWEEN_AGENTS; x <= DISTANCE_BETWEEN_AGENTS; x = x + DISTANCE_BETWEEN_AGENTS) {
    //     for (let y = -DISTANCE_BETWEEN_AGENTS; y <= DISTANCE_BETWEEN_AGENTS; y = y + DISTANCE_BETWEEN_AGENTS) {
    //         const id = speakerId++;
    //
    //         const nextWordCallback = (level) => nextWord(id, level);
    //         // const nextWordCallback = function (level) {
    //         //     return nextWord(id, level);
    //         // }
    //         // console.log('coords: ', x, y);
    //         waSpeakers.push(new WebaudioSpeaker(nextWordCallback, x, y));
    //     }
    // }
    waSpeakers.push(new WebaudioSpeaker((level) => nextWord(1, level), 0, 0));

    waSpeakers.forEach(s => s.start())
})

waRandomInput.addEventListener('input', () => {
    const val = Number(Number(waRandomInput.value))
    console.log('Setting randAmount to:', val)
    waSpeakers.forEach(s => {
        s.randomAmount = val
    })

})
