import Speaker from './webaudio-speaker'
import { nextWord, initialize } from './wordpicker';
import AUDIO_CONTEXT from "./audio_context";

const speakers = [];
const AGENT_HEIGHT = 7.5;

let playing = false;

const LISTENER = AUDIO_CONTEXT.listener
LISTENER.positionY.value = AGENT_HEIGHT
LISTENER.forwardY.value = 0

window.setListenerPosition = function(x, z, orientationDegrees) {
    LISTENER.positionX.value = x;
    LISTENER.positionZ.value = z;

    const radians = 2 * Math.PI * (orientationDegrees / 360);
    const xOrientation = -Math.sin(radians);
    const zOrientation = -Math.cos(radians);
    LISTENER.forwardX.value = xOrientation
    LISTENER.forwardZ.value = zOrientation
}

async function play() {
    if (!playing) {
        console.log('play!!!');
        playing = true;
        toggleAudioButton.textContent = "Pause audio";
        speakers.forEach(s => s.start());
    }
}

/**
 * Play only the middle agent
 */
window.playOne = function() {
    playing = true;
    speakers[5].start();
    toggleAudioButton.textContent = "Pause audio";
}

function stop() {
    playing = false;

    toggleAudioButton.textContent = "Start audio";
    speakers.forEach(s => s.stop());
}

// for debugging
window.play = play;

// Set to true to test with only one speaker
const DEBUG_ONE = false;

async function initializeSpeakers() {
    await initialize();
    const distance_between_agents = 40;
    // center is 0,0

    let speakerId = 0;

    if (DEBUG_ONE) {
        // just one speaker
        speakers.push(new Speaker(function (level) {
            return nextWord(speakerId, level);
        }, distance_between_agents, distance_between_agents));

    } else {
        // all speakers
        for (let x = -distance_between_agents; x <= distance_between_agents; x = x + distance_between_agents) {
            for (let y = -distance_between_agents; y <= distance_between_agents; y = y + distance_between_agents) {
                const id = speakerId++;

                const nextWordCallback = (level) => {
                    return nextWord(id, level);
                }
                console.log('coords: ', x, y);
                speakers.push(new Speaker(nextWordCallback, x, y));
            }
        }
    }
}
initializeSpeakers();

let toggleAudioButton;

document.addEventListener("DOMContentLoaded", function(){

    toggleAudioButton = document.getElementById('toggleAudio');
    toggleAudioButton.addEventListener('click', function() {
        playing ? stop() : play();
    });
});

window.stats = function() {
    // console.log('Listener position: ', Tone.Listener.positionX, Tone.Listener.positionY, Tone.Listener.positionZ);
    console.log('active speakers: ' + speakers.filter(s => s._isPlaying).length);
    console.log('speaker:', speakers[0]);
}
