import WebaudioSpeaker from './webaudio-speaker'
import UniversalListener from "./UniversalListener";
import { nextWord, initialize } from './wordpicker';
import AUDIO_CONTEXT from "./audio_context";

const speakers = [];
const AGENT_HEIGHT = 7.5;
//const radians = 0;
//const xOrientation = 0;
//const zOrientation = -1;

let playing = false;

window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('js', new Date());
gtag('config', 'G-XSVNPW5ZMC');

window.setListenerPosition = function(x, z, orientationDegrees) {
    const radians = 2 * Math.PI * (orientationDegrees / 360);
    const xOrientation = -Math.sin(radians);
    const zOrientation = -Math.cos(radians);

    gtag('event', 'position', { 'radians': radians, 'xOrientation': xOrientation, 'zOrientation': zOrientation });

    UniversalListener.setOrientation(xOrientation, 0, zOrientation)
    UniversalListener.setPosition(x, AGENT_HEIGHT, z)
}

async function play() {
    if (!playing) {
        console.log('play!!!');
        playing = true;
        toggleAudioButton.textContent = "Pause audio";
        await AUDIO_CONTEXT.resume()
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

function switchVoice() {
    speakers.forEach(s => s.switchVoice());
}

// for debugging
window.play = play;

// Set to true to test with only one speaker
const DEBUG_ONE = false;

async function initializeSpeakers() {
    await initialize();
    gtag('event', 'speakers', { 'value': 1 });

    const distance_between_agents = 40;
    // center is 0,0

    let speakerId = 0;
    
    let direct = Math.round(Math.random())

    if (DEBUG_ONE) {
        // just one speaker
        speakers.push(new WebaudioSpeaker(function (level) {
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
                speakers.push(new WebaudioSpeaker(nextWordCallback, x, y, direct));
            }
        }
    }
}
initializeSpeakers();

let toggleAudioButton;
let switchVoiceButton;

document.addEventListener("DOMContentLoaded", function(){

    toggleAudioButton = document.getElementById('toggleAudio');
    toggleAudioButton.addEventListener('click', function() {
        gtag('event', 'playbutton', { 'value': playing });
        playing ? stop() : play();
    });
    
    switchVoiceButton = document.getElementById('switchVoice');
    switchVoiceButton.addEventListener('click', function() {
        switchVoice();
    });
});

window.stats = function() {
    // console.log('Listener position: ', Tone.Listener.positionX, Tone.Listener.positionY, Tone.Listener.positionZ);
    console.log('active speakers: ' + speakers.filter(s => s._isPlaying).length);
    console.log('speaker:', speakers[0]);
}
