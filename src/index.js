// import * as Tone from "tone";
import AUDIO_CONTEXT from "./audio_context";

// import {Speaker} from './speaker';
import {nextWord, initialize} from './wordpicker';
import WebaudioSpeaker from "./webaudio-speaker";

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

// // Initialize the listener
// Tone.Listener.set({
//     positionX: 0,
//     positionY: 0,
//     positionZ: 0.1
// });

const listener = AUDIO_CONTEXT.listener


if (listener.forwardX) {
    // listener.forwardX.setValueAtTime(0, audioCtx.currentTime);
    // listener.forwardY.setValueAtTime(0, audioCtx.currentTime);
    // listener.forwardZ.setValueAtTime(-1, audioCtx.currentTime);
    // listener.upX.setValueAtTime(0, audioCtx.currentTime);
    // listener.upY.setValueAtTime(1, audioCtx.currentTime);
    // listener.upZ.setValueAtTime(0, audioCtx.currentTime);
    listener.positionX.value = 0
    listener.positionY.value = 0
    listener.positionZ.value = 0.1
} else { // firefox only supports this deprecated way of setting listener position
    listener.setOrientation(0, 0, -1, 0, 1, 0);
}

function setListenerPosition() {
    // console.log('setting listener position', listenerX.value, listenerY.value);
    // not sure if casting to Number is necessary
    // Tone.Listener.positionX.targetRampTo(Number(listenerX.value), 10);
    // Tone.Listener.setPosition(Number(listenerX.value), Number(listenerY.value), 0.1);
    const positionX = Number(listenerX.value)
    const positionZ = Number(listenerZ.value)
    // Tone.Listener.set({
    //     positionX: Number(listenerX.value),
    //     positionY: Number(listenerY.value),
    //     positionZ: 0.1
    // });
    console.log('position', positionX, positionZ)

    listener.positionX.value = positionX
    listener.positionZ.value = positionZ
}

listenerX.addEventListener('input', setListenerPosition);
listenerZ.addEventListener('input', setListenerPosition);

listenerOrientation.addEventListener('input', function () {
    const radians = 2 * Math.PI * (listenerOrientation.value / 360);
    const forwardX = Math.cos(radians)
    const forwardY = Math.sin(radians)

    // Tone.Listener.set({
    //     forwardX: forwardX,
    //     forwardY: forwardY
    // })

    listener.forwardX.value = forwardX
    listener.forwardY.value = forwardY
})

let randAmt = 0.5;

randAmtInput.addEventListener('input', function (v) {
    randAmt = randAmtInput.value;
    // console.log('randAmtInput:', randAmtInput.value);
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
    // await Tone.start();
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
