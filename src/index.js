import * as Tone from "tone";

import {Speaker} from './speaker';
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
const listenerY = document.getElementById('listenerY');
const listenerOrientation = document.getElementById('listenerOrientation');

const playWAButton = document.getElementById('playWA');

const listenerTest = document.getElementById("testSimpleLoop")


// Initialize the listener
// Tone.Listener.setPosition(0, 0, 0);
Tone.Listener.set({
    positionX: 0,
    positionY: 0,
    positionZ: 0
});

function setListenerPosition() {
    // console.log('setting listener position', listenerX.value, listenerY.value);
    // not sure if casting to Number is necessary
    // Tone.Listener.positionX.targetRampTo(Number(listenerX.value), 10);
    // Tone.Listener.setPosition(Number(listenerX.value), Number(listenerY.value), 0.1);
    Tone.Listener.set({
        positionX: Number(listenerX.value),
        positionY: Number(listenerY.value),
        positionZ: 0.1
    });
}

listenerX.addEventListener('input', setListenerPosition);
listenerY.addEventListener('input', setListenerPosition);

listenerOrientation.addEventListener('input', function () {
    const radians = 2 * Math.PI * (listenerOrientation.value / 360);

    Tone.Listener.set({
        forwardX: Math.cos(radians),
        forwardY: Math.sin(radians)
    })

    // Tone.Listener.setOrientation(
    //     Math.cos(radians),
    //     Math.sin(radians),
    //     0,
    //     0,
    //     0,
    //     1
    // );
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
    await Tone.start();
    speakers.forEach(s => s.start());
}

playOneButton.addEventListener('click', playSingleVoice);

async function playSingleVoice() {
    await Tone.start();
    speakers[4].start()
}

const speakers = [];

async function initializeSpeakers() {
    await initialize();
    const distance_between_agents = 40;
    // assumption: center is 0,0

    let speakerId = 0;
    for (let x = -distance_between_agents; x <= distance_between_agents; x = x + distance_between_agents) {
        for (let y = -distance_between_agents; y <= distance_between_agents; y = y + distance_between_agents) {
            const id = speakerId++;

            const nextWordCallback = function (level) {
                const word = nextWord(id, level);
                return word;
            }
            console.log('coords: ', x, y);
            speakers.push(new Speaker(nextWordCallback, x, y));
        }
    }
}

initializeSpeakers();


const waSpeaker = new WebaudioSpeaker((level) => {
    return nextWord(1, level)
}, 0, 0)
playWAButton.addEventListener('click', () => {
    waSpeaker.start()
})

window.playBuffer = function (buffer) {
    new Tone.Player({
        url: buffer.get(),
        onstop: (p) => {
            // disposing doesn't seem to help with the event leak
            console.log('on stop', p);
            p.stop()
            p.dispose()
        }
    }).toDestination().start()
}

window.buffer = new Tone.Buffer(`./assets/sounds/music.mp3`,
    function () {
        console.log('buffer loaded')
    },
    function (e) {
        // Maybe TODO: keep track of 404s so we don't keep trying to get those words.
        // Not necessary if we make sure our stories and audio files are in sync.
        console.log('FAILED TO LOAD BUFFER:', e);
    }
);


listenerTest.addEventListener('click', testSimpleLoop)

async function testSimpleLoop() {
    Tone.start()
    console.log('testSimpleLoop')

    const context = new Tone.Context();

    const loop = new Tone.Loop((time) => {
        console.log(time);
        playBuffer(buffer)
    }, buffer.duration).start(0);
    Tone.Transport.start();

    function scheduleNext(b, play) {
        // console.trace()
        // console.log(b.duration)
        playBuffer(b)
        setTimeout(() => scheduleNext(b, play), b.duration * 1000)
    }

    // scheduleNext(b, play)

    // context.setTimeout(() => {
    //     play()
    // }, b.duration);
}

window.stats = function () {
    console.log('Listener: ', Tone.Listener.positionX, Tone.Listener.positionY);
    console.log('active speakers: ' + speakers.filter(s => {
        if (s._isPlaying) {
            console.log('playing:', s);
            return true;
        } else {
            return false;
        }
    }).length);
}
