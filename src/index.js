import * as Tone from "tone";

const playButton = document.getElementById('play');
const text = document.getElementById('text');



playButton.addEventListener('click', function () {
    console.log('PLAY PRESSED');

    const words = text.value.split(/\s+/);

    console.log('words:', words);


    const player = new Tone.Player('./assets/sounds/frank.mp3').toMaster();
    player.autostart = true;

    //create a synth and connect it to the master output (your speakers)
    // const synth = new Tone.Synth().toMaster();

    //play a middle 'C' for the duration of an 8th note
    new Tone.Synth().toMaster().triggerAttackRelease("C4", "8n");
    new Tone.Synth().toMaster().triggerAttackRelease("E5", "8n");
});
