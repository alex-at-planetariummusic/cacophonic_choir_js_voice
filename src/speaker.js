import * as Tone from "tone";

const context = new Tone.Context();
const AMP_ENV_RELEASE_TIME = 0.1;

// const MIN_GRAIN_LENGTH_S = 0.1;
const MIN_GRAIN_LENGTH_S = 0.05;
const MAX_GRAIN_LENGTH_S = 0.4;

// Play the original if less than this distance from the agent
const DISTANCE_ORIGINAL_THRESHOLD = 9; // currently the closes you can get to the agent is about 6.5
// Past this distance, don't play anything
// 81 should make it so that there are always at least three agents playing
const DISTANCE_SILENCE_THRESHOLD = 81;
// Past this distance, word choice is random (=== MAX_WORD_LEVEL)
const DISTANCE_RANDOM_THRESHOLD = 20;
const MAX_WORD_LEVEL = 6;


// _panner3D.rolloffFactor
// larger numbers make for more drastic changes
const PANNER3D_ROLLOFF_FACTOR = 5;

const MAX_FILTER_MIDI = (new Tone.Midi(7500, 'hz')).toMidi();
const MIN_FILTER_MIDI = (new Tone.Midi(100, 'hz')).toMidi();

const FILT_SLOPE =  (MAX_FILTER_MIDI - MIN_FILTER_MIDI) / (DISTANCE_RANDOM_THRESHOLD - DISTANCE_SILENCE_THRESHOLD);
const FILT_Y_INTERCEPT = MIN_FILTER_MIDI - (FILT_SLOPE * DISTANCE_SILENCE_THRESHOLD);

function filterFreq(distance) {
    return (new Tone.Midi(FILT_SLOPE * distance + FILT_Y_INTERCEPT)).toFrequency();
}

// additional space to add between words. Negative makes them closer together
const WORD_SPACE_OFFSET_S = -0.13;

export class Speaker {
    constructor(getWordCallback, positionX, positionZ) {
        this._getWord = getWordCallback;
        this._panner3D = new Tone.Panner3D(positionX, 7.5, positionZ).toMaster();
        this._panner3D.rolloffFactor = PANNER3D_ROLLOFF_FACTOR;
        this.randomAmount = 1;
        this.wordLevel = MAX_WORD_LEVEL;
    }

    /**
     * Start the speaker speakeing
     */
    start() {
        this._startPlayingIfNotPlaying();
    }

    stop() {
        console.log('speaker stop');
        this._clearIntervalIfItExists();
        this._isPlaying = false;
    }

    setDistance(distance) {
        // console.log('setting distance to:', distance);
        if (distance > DISTANCE_SILENCE_THRESHOLD) {
            this._isPlaying = false;
            if (this._listenInterval === undefined) {
                // set time to check user's position periodically in order to restart playing
                this._listenInterval = setInterval(() => {
                    this.setDistance(this._getDistance());
                }, 100);
            }
            return;
        } 

        this._clearIntervalIfItExists();
        if (distance <= DISTANCE_ORIGINAL_THRESHOLD) {
            this.wordLevel = 0;
            this.randomAmount = 0;
            // filter not applied, but 
        } else {
            // scale to 0..1
            this.randomAmount = (distance - DISTANCE_ORIGINAL_THRESHOLD) / (DISTANCE_SILENCE_THRESHOLD - DISTANCE_ORIGINAL_THRESHOLD);
            // scale 1..maxLevel
            this.wordLevel = Math.min(MAX_WORD_LEVEL, Math.floor(
(MAX_WORD_LEVEL - 1) * ((distance - DISTANCE_ORIGINAL_THRESHOLD) / (DISTANCE_RANDOM_THRESHOLD - DISTANCE_ORIGINAL_THRESHOLD)) + 1
            ));

            if (distance > DISTANCE_RANDOM_THRESHOLD) {
                this._filterHz = filterFreq(distance);
            } else {
                this._filterHz = 20000;
            }
        }

        this._startPlayingIfNotPlaying();
    }

    _clearIntervalIfItExists() {
        if (this._listenInterval !== undefined) {
            clearInterval(this._listenInterval);
            this._listenInterval = undefined;
        }
    }

    /**
     * Gets the speaker's distance from the listener's position
     */
    _getDistance() {
        return Math.abs(
            Math.sqrt(
                Math.pow(Tone.Listener.positionX - this._panner3D.positionX, 2) + 
                // Math.pow(Tone.Listener.positionY - this._panner3D.positionY, 2)
                Math.pow(Tone.Listener.positionZ - this._panner3D.positionZ, 2)
            )
        );
    }

    _startPlayingIfNotPlaying() {
        if (this._isPlaying) {
            return;
        }

        this._isPlaying = true;
        if (context.state === 'suspended') {
            console.log('context suspended. why???')
            context.resume();
        }
        if (!this._nextBufferPromise) {
            this._queueNextWord();
        }
        this._playNextWord();
    }


    _getNextWord() {
        return this._getWord(this.wordLevel);
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
            if (!this._isPlaying) {
                return;
            }

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

        if (!buffer) {
            console.error('no buffer :(');
            debugger;
            this._playNextWord();
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

        if (rand < 0.1 + 0.5 * this.randomAmount) {
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


        // at DISTANCE_RANDOM_THRESHOLD start applying filter
        const filter = (new Tone.Filter(this._filterHz)).connect(ampEnv);


        new Tone.Player(buffer.get())
            // .connect(ampEnv)
            .connect(filter)
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
                if (this._isPlaying) {
                    this.setDistance(this._getDistance());
                    this._playGrainLoop(buffer, nextTime);
                }
            }, grainLength);
        }

        // play the grain
        ampEnv.triggerAttackRelease(grainLength);
    }
}
