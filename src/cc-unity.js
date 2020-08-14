import * as Tone from "tone";

import { Speaker } from './speaker';
import { nextWord, initialize } from './wordpicker';

const speakers = [];
const AGENT_HEIGHT = 7.5;

// for debugging;
window.Tone = Tone;

let playing = false;


window.setListenerPosition = function(x, y, orientationDegrees) {
    // console.log('POSITION:', x, y, orientationDegrees);
    // if (previousOrientation === orientationDegrees) {
    //     return;
    // }
    // previousOrientation = orientationDegrees;
    // console.log('new orientation:', orientationDegrees);

    // Tone.Listener.setPosition(x, y, 0.1);
    Tone.Listener.setPosition(x, AGENT_HEIGHT, y);

    const radians = 2 * Math.PI * (orientationDegrees / 360);
    const xOrientation = -Math.sin(radians);
    const zOrientation = -Math.cos(radians);
    // console.log('orientation (x,z):', xOrientation, zOrientation)
    Tone.Listener.setOrientation(
        xOrientation,
        0,
        zOrientation,
        0,
        1,
        0
    );
}

async function play() {
    if (!playing) {
        console.log('play!!!');
        playing = true;
        toggleAudioButton.textContent = "Pause audio";
        await Tone.start();
        speakers.forEach(s => s.start());
    }
}

function stop() {
    playing = false;

    toggleAudioButton.textContent = "Start audio";
    speakers.forEach(s => s.stop());
}

// for debugging
window.play = play;

async function initializeSpeakers() {
    await initialize();
    const distance_between_agents = 40;
    // assumption: center is 0,0

    let speakerId = 0;

    // test with only the center speaker
    // speakers.push(new Speaker(function(level) {
    //     return nextWord(speakerId, level);
    // }, distance_between_agents, distance_between_agents));
    // return;

    for(let x = -distance_between_agents; x <= distance_between_agents; x = x + distance_between_agents) {
        for(let y = -distance_between_agents; y <= distance_between_agents; y = y + distance_between_agents) {
            const id = speakerId++;

            const nextWordCallback = function(level) {
                const word = nextWord(id, level);
                return word;
            }
            console.log('coords: ', x, y);
            speakers.push(new Speaker(nextWordCallback, x, y));
        }
    }
}
initializeSpeakers();

let toggleAudioButton;

document.addEventListener("DOMContentLoaded", function(){
    // attach to <button id="play">play</button>
    // document.getElementById('play').addEventListener('click', play);
    // attach to  <button id="stop">stop</button>
    // document.getElementById('stop').addEventListener('click', stop);

    // attach to  <button id="stop">stop</button>
    toggleAudioButton = document.getElementById('toggleAudio');
    toggleAudioButton.addEventListener('click', function() {
        playing ? stop() : play();
    });
});

window.stats = function() {
    console.log('Listener position: ', Tone.Listener.positionX, Tone.Listener.positionY, Tone.Listener.positionZ);
    console.log('active speakers: ' + speakers.filter(s => s._isPlaying).length);
    console.log('speaker:', speakers[0]);
}