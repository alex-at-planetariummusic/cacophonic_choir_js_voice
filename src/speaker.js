import * as Tone from "tone";

const context = new Tone.Context();
const AMP_ENV_RELEASE_TIME = 0.1;

// const MIN_GRAIN_LENGTH_S = 0.1;
const MIN_GRAIN_LENGTH_S = 0.05;
const MAX_GRAIN_LENGTH_S = 0.4;

// additional space to add between words. Negative makes them closer together
const WORD_SPACE_OFFSET_S = -0.1;

export class Speaker {
    /**
     * TODO add location
     * TODO pass in callback for _getNextWord
     * @param {number} randomAmount - in range of [0, 1]
     */
    constructor(randomAmount, getWordCallback) {
        this.randomAmount = isNaN(randomAmount) ? 0.5 : randomAmount;

        if (getWordCallback) {
            this._getWord = getWordCallback;
        }

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
    async start() {
        console.time('globaltimer');
        if (context.state === 'suspended') {
            console.log('context suspended. wth?')
            context.resume();
        }
        this._isPlaying = true;
        if (!this._nextBufferPromise) {
            await this._queueNextWord();
        }
        this._playNextWord();
    }

    stop() {
        this._isPlaying = false;
    }


    _getNextWord() {
        let word
        if (this._getWord) {
            word = this._getWord();
        } else { // mock
            word =  this._words[this._nextWordIndex];
            this._nextWordIndex = (this._nextWordIndex + 1) % this._words.length;
        }
        console.log('NEXT WORD:', word);
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
                    console.log('FAILED TO LOAD BUFFER:', e);
                    reject(e)
                });
        });
    }

    _queueNextWord() {
        // TODO: if network goes down or something else bad happens, this could loop forever
        this._nextBufferPromise = this._loadBuffer(this._getNextWord())
            .catch(e => {
                this._queueNextWord();
            });
        return this._nextBufferPromise;
    }

    async _playNextWord() {
        console.timeEnd('pnw');
        console.time('bp');
        this._nextBufferPromise.then(buffer => {
            console.timeEnd('bp');
            if (this.randomAmount === 0) {
                console.log('pnw');
                this._playNextWordFile(buffer)
            } else {
                console.log('pgl');
                this._playGrainLoop(buffer, 0)
            }
            this._queueNextWord();
        })
    }

    _playNextWordFile(buffer) {
        if (!this._isPlaying) {
            return;
        }

        console.log('_playNextWordFile STARTED; buffer length:', buffer.duration);
        console.timeLog('globaltimer');

        new Tone.Player(buffer.get()).toMaster()
            .start();

        context.setTimeout(() => {
            console.log('_playNextWordFile ENDED');
            console.timeLog('globaltimer');
            this._playNextWord();
        }, buffer.duration + WORD_SPACE_OFFSET_S);
    }

    /**
     * @param {Tone.Buffer} buffer - The buffer to play
     * @param {number} time - Location in buffer to start playing from
     */
    _playGrainLoop(buffer, time) {
        // Note: circular function calls; call stack will keep growing until word is done playing. 
        if (!this._isPlaying) {
            return;
        }

        let grainLength;
        let nextTime;

        // calculate the grain length
        // range from MIN_GRAIN_LENGTH_S--MAX_GRAIN_LENGTH_S
        grainLength = MIN_GRAIN_LENGTH_S + Math.random() * (MAX_GRAIN_LENGTH_S - MIN_GRAIN_LENGTH_S);

        let rand = Math.random();
        // when randomAmount == 1, 50% chance of repeating grain
        // when randomAmount == 0, 0% chance of repeating grain
        if (rand * 2 < this.randomAmount) {
            //repeat
            nextTime = time;
        } else {
            nextTime = time + grainLength
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

        let nextAction;
        // play next word if the next time would be after the end of the buffer, or 
        // this grain has played to the end of the buffer
        if (nextTime > buffer.duration || time + grainLength >= buffer.duration) {
            console.log('end; on to next word');
            nextAction = () => {
                console.time('pnw');
                console.timeLog('globaltimer');
                this._playNextWord();
            };
            context.setTimeout(nextAction, grainLength + WORD_SPACE_OFFSET_S);
        } else {
            // queue the next grain
            context.setTimeout(() => {
                this._playGrainLoop(buffer, nextTime);
            }, grainLength);
        }

        // play the grain
        ampEnv.triggerAttackRelease(grainLength);
    }
}
