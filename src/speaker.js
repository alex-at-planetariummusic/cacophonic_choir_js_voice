import * as Tone from "tone";

const context = new Tone.Context();
const AMP_ENV_RELEASE_TIME = 0.1;

export class Speaker {
    /**
     * TODO add location
     * TODO pass in callback for _getNextWord
     * @param {number} randomAmount - in range of [0, 1]
     */
    constructor(randomAmount) {
        this.randomAmount = isNaN(randomAmount) ? 0.5 : randomAmount;

        this._panner3d = new Tone.Panner3D().toMaster();

        // temporary stuff
        this._words = [
            'four',
            'fostering',
            'fountains',
            'in',
            'fast',
            'collaboration',
        ]
        this._nextWordIndex = 0;
    }

    /**
     * Start the speaker speakeing
     */
    start() {
        this._isPlaying = true;
        this._playWord(this._getNextWord());
    }

    stop() {
        // console.log('stop()');
        this._isPlaying = false;
    }


    _getNextWord() {
        const word =  this._words[this._nextWordIndex];
        this._nextWordIndex = (this._nextWordIndex + 1) % this._words.length;
        return word;
    }


    _loadBuffer(word) {
        return new Promise((resolve, reject) => {
            const buffer = new Tone.Buffer(`./assets/sounds/${word}.mp3`,
                function () {
                    console.log(`Loaded "${word}"`);
                    resolve(buffer);
                },
                function (e) {
                    // Maybe TODO: keep track of 404s so we don't keep trying to get those words.
                    // Not necessary if we make sure our stories and audio files are in sync.
                    reject(e)
                });
        });
    }

    async _playWord() {
        let buffer;
        try {
            buffer = await this._loadBuffer(this._getNextWord());
        } catch(e) {
            console.error('Could get word; trying the next one', e);
            this._playWord();
        }
        this._playGrainLoop(buffer, 0)
    }

    /**
     * @param {Tone.Buffer} buffer - The buffer to play
     * @param {number} time - Location in buffer to start playing from
     */
    _playGrainLoop(buffer, time) {
        // Note: circular function calls; call stack will keep growing until word is done playing
        console.trace();
        if (!this._isPlaying) {
            return;
        }

        let grainLength;
        let nextTime;


        // calculate the grain length
        // range from 0.1--0.4
        grainLength = 0.1 + Math.random() * 0.3;
        // console.log('grainLength:', grainLength);

        // TODO: scale repeat (don't always repeat at randomAmount==1)
        let rand = Math.random();
        // when randomAmount == 1, 50% chance of repeating grain
        // when randomAmount == 0, 0% chance of repeating grain
        if (rand * 2 < this.randomAmount) {
            //repeat
            console.log('repeat', rand, this.randomAmount);
            nextTime = time;
        } else {
            // console.log('norepeat');
            nextTime = time + grainLength
        }

        // play next word if the next time would be after the end of the buffer, or 
        // this grain has played to the end of the buffer
        if (nextTime > buffer.duration || time + grainLength >= buffer.duration) {
            // console.log('end; on to next word');
            // TODO: fetch next word before this word ends
            this._playWord();
            return;
        }

        const ampEnv = new Tone.AmplitudeEnvelope({
            attack: 0.01,
            decay: 0,
            sustain: 1.0,
            release: AMP_ENV_RELEASE_TIME
        }).connect(this._panner3d);

        new Tone.Player(buffer.get())
            .connect(ampEnv)
            .start(undefined, time, grainLength + AMP_ENV_RELEASE_TIME);

        ampEnv.triggerAttackRelease(grainLength);

        context.setTimeout(() => {
            this._playGrainLoop(buffer, nextTime, grainLength);
        }, grainLength);
    }
}
