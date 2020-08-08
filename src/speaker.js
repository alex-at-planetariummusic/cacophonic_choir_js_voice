import * as Tone from "tone";

const context = new Tone.Context();
const AMP_ENV_RELEASE_TIME = 0.1;

// const MIN_GRAIN_LENGTH_S = 0.1;
const MIN_GRAIN_LENGTH_S = 0.05;
const MAX_GRAIN_LENGTH_S = 0.4;

const DISTANCE_ORIGINAL_THRESHOLD = 50;
// Past this distance, don't play anything
const DISTANCE_SILENCE_THRESHOLD = 300;
// Past this distance, word choice is random (=== MAX_WORD_LEVEL)
const DISTANCE_RANDOM_THRESHOLD = 200;
const MAX_WORD_LEVEL = 6;

// additional space to add between words. Negative makes them closer together
const WORD_SPACE_OFFSET_S = -0.1;

export class Speaker {
    constructor(getWordCallback, positionX, positionY) {

        this.randomAmount = 0;
        this.wordLevel = 0;

        if (getWordCallback) {
            this._getWord = getWordCallback;
        }

        this._panner3D = new Tone.Panner3D(positionX, positionY, 0).toMaster();
        // this._panner3d.rolloffFactor = 300;
        this._panner3D.rolloffFactor = 0.02;

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
        this._startPlayingIfNotPlaying();
    }

    stop() {
        this._isPlaying = false;
    }

    setDistance(distance) {
        // console.log('setting distance to:', distance);
        if (distance > DISTANCE_SILENCE_THRESHOLD) {
            this._isPlaying = false;
            if (this._listenInterval === undefined) {
                // set time to check user's position periodically in order to restart playing
                console.log('setting the interval');
                this._listenInterval = setInterval(() => {
                    this.setDistance(this._getDistance());
                }, 100);
            }
            return;
        } 
        if (this._listenInterval !== undefined) {
            console.log('Clearing interval!', this._listenInterval);
            clearInterval(this._listenInterval);
            this._listenInterval = undefined;
        }
        if (distance <= DISTANCE_ORIGINAL_THRESHOLD) {
            this.wordLevel = 0;
            this.randomAmount = 0;
        } else {
            // scale to 0..1
            this.randomAmount = (distance - DISTANCE_ORIGINAL_THRESHOLD) / (DISTANCE_SILENCE_THRESHOLD - DISTANCE_ORIGINAL_THRESHOLD);
            // scale 1..maxLevel
            this.wordLevel = Math.min(MAX_WORD_LEVEL, Math.floor(
(MAX_WORD_LEVEL - 1) * ((distance - DISTANCE_ORIGINAL_THRESHOLD) / (DISTANCE_RANDOM_THRESHOLD - DISTANCE_ORIGINAL_THRESHOLD)) + 1

            ));
        }

        // console.log('setDistance; wordLevel: ' + this.wordLevel + ' randomAmount: ' + this.randomAmount);

        this._startPlayingIfNotPlaying();
    }

    /**
     * Gets the speaker's distance from the listener's position
     */
    _getDistance() {
        return Math.abs(
            Math.sqrt(
                Math.pow(Tone.Listener.positionX - this._panner3D.positionX, 2) + 
                Math.pow(Tone.Listener.positionY - this._panner3D.positionY, 2)
            )
        );
    }

    _startPlayingIfNotPlaying() {
        if (this._isPlaying) {
            return;
        }

        this._isPlaying = true;
        if (context.state === 'suspended') {
            console.log('context suspended. wth?')
            context.resume();
        }
        if (!this._nextBufferPromise) {
            this._queueNextWord();
        }
        this._playNextWord();
    }


    _getNextWord() {
        let word
        if (this._getWord) {
            word = this._getWord(this.wordLevel);
        } else { // mock
            word =  this._words[this._nextWordIndex];
            this._nextWordIndex = (this._nextWordIndex + 1) % this._words.length;
        }
        return word;
    }


    _loadBuffer(word) {
        return new Promise((resolve, reject) => {
            const buffer = new Tone.Buffer(`./assets/sounds/${word}.mp3`,
                function () {
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
        this._nextBufferPromise.then(buffer => {
            this.setDistance(this._getDistance());
            if (this.randomAmount === 0) {
                this._playNextWordFile(buffer)
            } else {
                this._playGrainLoop(buffer, 0)
            }
            this._queueNextWord();
        })
    }

    _playNextWordFile(buffer) {
        if (!this._isPlaying) {
            return;
        }

        new Tone.Player(buffer.get()).connect(this._panner3D)
            .start();

        context.setTimeout(() => {
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
        }).connect(this._panner3D);

        new Tone.Player(buffer.get())
            .connect(ampEnv)
            .start(undefined, time, grainLength + AMP_ENV_RELEASE_TIME);

        let nextAction;
        // play next word if the next time would be after the end of the buffer, or 
        // this grain has played to the end of the buffer
        if (nextTime > buffer.duration || time + grainLength >= buffer.duration) {
            nextAction = () => {
                this._playNextWord();
            };
            context.setTimeout(nextAction, grainLength + WORD_SPACE_OFFSET_S);
        } else {
            // queue the next grain
            context.setTimeout(() => {
                this.setDistance(this._getDistance());
                this._playGrainLoop(buffer, nextTime);
            }, grainLength);
        }

        // play the grain
        ampEnv.triggerAttackRelease(grainLength);
    }
}
