import * as Tone from "tone";

import { Speaker } from './speaker';
import { nextWord, initialize } from './wordpicker';

const speakers = [];

// for debugging;
window.Tone = Tone;


window.setListenerPosition = function(x, y, orientationDegrees) {
    // console.log('POSITION:', x, y, orientationDegrees);

    Tone.Listener.setPosition(x, y, 0.1);

    const radians = 2 * Math.PI * (orientationDegrees / 360);
    Tone.Listener.setOrientation(
        Math.cos(radians),
        Math.sin(radians),
        0,
        0,
        0,
        1
    );
}

async function play() {
    console.log('play!!!');
    await Tone.start();
    console.log('Tone started!!!');
    speakers.forEach(s => s.start());
}

// for debugging
window.play = play;

async function initializeSpeakers() {
    await initialize();
    const distance_between_agents = 40;
    // assumption: center is 0,0

    let speakerId = 0;
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
    play();
}
initializeSpeakers();

// Add <button id="play">play</button>
document.addEventListener("DOMContentLoaded", function(){
    document.getElementById('play').addEventListener('click', play);
});

window.stats = function() {
    console.log('Listener position: ', Tone.Listener.positionX, Tone.Listener.positionY);
    console.log('active speakers: ' + speakers.filter(s => s._isPlaying).length);
}