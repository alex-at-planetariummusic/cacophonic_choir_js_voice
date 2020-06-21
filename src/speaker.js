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
    }

    /**
     * Start the speaker speakeing
     */
    start() {
        this._isPlaying = true;
        this._playWord(this._getNextWord());
    }

    stop() {
        console.log('stop()');
        this._isPlaying = false;
    }

    _getNextWord() {
        return 'collaboration';
    }


    _loadBuffer(word) {
        return new Promise((resolve, reject) => {
            const buffer = new Tone.Buffer(`./assets/sounds/${word}.mp3`,
                function () {
                    console.log(`Loaded "${word}"`);
                    resolve(buffer);
                },
                function (e) {
                    console.error('could not load file', e);
                    reject(e)
                });
        });
    }

    async _playWord(word) {
        let buffer = await this._loadBuffer(word);
        // TODO: length should just be local var?
        this._playGrainLoop(buffer, 0, 0.2)
    }

    _playGrainLoop(buffer, time, length) {
        if (!this._isPlaying) {
            return;
        }

        let grainLength;
        let nextTime;


        // calculate the grain length
        // range from 0.1--0.4
        grainLength = 0.1 + Math.random() * 0.3;
        console.log('grainLength:', grainLength);

        // TODO: randomize length
        // TODO: scale repeat (don't always repeat at randomAmount==1)
        let rand = Math.random();
        if (rand < this.randomAmount) {
            //repeat
            console.log('repeat', this.randomAmount);
            // grainLength = length;
            nextTime = time;
        } else {
            // fixed for now
            console.log('norepeat');
            // grainLength = length;
            nextTime = time + grainLength
        }

        if (nextTime > buffer.duration) {
            console.log('end; on to next word');
            // TODO: fetch next word before this word ends
            this._playWord(this._getNextWord());
            return;
        }

        const ampEnv = new Tone.AmplitudeEnvelope({
            attack: 0.01,
            decay: 0,
            sustain: 1.0,
            release: AMP_ENV_RELEASE_TIME
        }).toMaster();

        new Tone.Player(buffer.get())
            .connect(ampEnv)
            .start(undefined, time, grainLength + AMP_ENV_RELEASE_TIME);

        ampEnv.triggerAttackRelease(grainLength);

        context.setTimeout(() => {
            this._playGrainLoop(buffer, nextTime, grainLength);
        }, grainLength);
    }
}
