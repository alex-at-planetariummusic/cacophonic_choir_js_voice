import AUDIO_CONTEXT from "./audio_context";
import UniversalListener from "./UniversalListener";


const MIN_GRAIN_LENGTH_S = 0.05;
const MAX_GRAIN_LENGTH_S = 0.4;
const PANNER_ROLLOFF_FACTOR = 5;

// Play the original if less than this distance from the agent
const DISTANCE_ORIGINAL_THRESHOLD = 9; // currently the closest you can get to the agent is about 6.5
// Past this distance, don't play anything
// 81 should make it so that there are always at least three agents playing
const DISTANCE_SILENCE_THRESHOLD = 81;
const DISTANCE_RANDOM_THRESHOLD = 20;
const MAX_WORD_LEVEL = 6;

const AUDIO_BUFFER_PROMISES = {}

export default class WebaudioSpeaker {
    constructor(getWordCallback, positionX, positionZ) {
        this._getWord = getWordCallback;
        this.wordLevel = MAX_WORD_LEVEL;
        // between 0 and 1
        this.randomAmount = 0;

        this._panner = AUDIO_CONTEXT.createPanner()
        this._panner.positionX.value = positionX
        this._panner.positionY.value = 7.5
        this._panner.positionZ.value = positionZ
        this._panner.rolloffFactor = PANNER_ROLLOFF_FACTOR
    }

    async start() {
        this._playing = true;
        this._scheduleNextWord()
    }

    stop() {
        this._playing = false;
    }

    async _scheduleNextWord(when) {
        if (!this._playing) {
            return
        }
        // current sound set has 0.05 silence at beginning...
        const playAt = when ? when - 0.05 :  AUDIO_CONTEXT.currentTime

        this._updateValues()

        const buffer = await this._getBufferPromise(this._getWord(this.wordLevel))

        if (this.randomAmount === 0) {
            this._scheduleNextSample(playAt, buffer)
        } else {
            this._scheduleNextGrain(playAt, buffer, 0)
        }
    }

    /**
     * Schedule playing an entire file
     *
     * @param when
     * @param buffer
     * @return {Promise<void>}
     * @private
     */
    async _scheduleNextSample(when, buffer) {
        const source = AUDIO_CONTEXT.createBufferSource()
        source.buffer = buffer;
        source.connect(this._panner).connect(AUDIO_CONTEXT.destination)
        source.start(when)

        const bufferLengthInSeconds = buffer.length / buffer.sampleRate

        // console.log(`Scheduled at ${when}; Sample length is ${bufferLengthInSeconds}; so next scheduled time should be ${when + bufferLengthInSeconds}`)

        const nowSeconds = AUDIO_CONTEXT.currentTime
        const differenceMS = ((when - nowSeconds) * 1000) || 1

        // schedule the next next word at the same time we play the word
        setTimeout(() => {
            this._scheduleNextWord(when + bufferLengthInSeconds)
        }, differenceMS)
    }

    /**
     *
     * @param {number} when - When to play sample. Seconds. Timeframe is AudioContext
     * @param buffer - buffer to play
     * @param {number} offset - Where in the buffer to play the sample
     * @return {Promise<void>}
     * @private
     */
    async _scheduleNextGrain(when, buffer, offset) {
        if (!this._playing) {
            return
        }
        // console.log('scheduling next grain for:', when)

        // calculate the grain length
        // range from MIN_GRAIN_LENGTH_S--MAX_GRAIN_LENGTH_S
        const grainLengthSeconds = MIN_GRAIN_LENGTH_S + Math.random() * (MAX_GRAIN_LENGTH_S - MIN_GRAIN_LENGTH_S);

        // first schedule the grain
        const source = AUDIO_CONTEXT.createBufferSource()
        source.buffer = buffer;

        const gainNode = AUDIO_CONTEXT.createGain()

        const AD_ENV_LENGTH = 0.1;
        // const AD_ENV_LENGTH = 0.5 * grainLengthSeconds;

        gainNode.gain.setValueAtTime(0, when)
            .linearRampToValueAtTime(1, when + AD_ENV_LENGTH)
            .setValueAtTime(0, when + grainLengthSeconds - AD_ENV_LENGTH)
            .linearRampToValueAtTime(0, when + grainLengthSeconds)

        source.connect(gainNode).connect(this._panner).connect(AUDIO_CONTEXT.destination)
        source.start(when, offset, grainLengthSeconds)

        // now calculate the next grain
        const nowSeconds = AUDIO_CONTEXT.currentTime

        let nextOffsetTime;

        let rand = Math.random();

        if (rand < 0.1 + 0.5 * this.randomAmount) { // stutter
            nextOffsetTime = offset;
        } else {
            nextOffsetTime = offset + grainLengthSeconds
        }

        const differenceMS = ((when - nowSeconds) * 1000) || 1
        // play next word if the next time would be after the end of the buffer, or
        // this grain has played to the end of the buffer
        if (nextOffsetTime > buffer.duration || offset + grainLengthSeconds >= buffer.duration) {
            // schedule the next word
            setTimeout(() => {
                this._scheduleNextWord(when + grainLengthSeconds, buffer);
            }, differenceMS)
        } else {
            // queue the next grain
            setTimeout(() => {
                // this.setDistance(this._getDistance());
                this._scheduleNextGrain(when + grainLengthSeconds, buffer, nextOffsetTime);
            }, differenceMS);
        }


    }

    async _getBufferPromise(word) {
        if (!AUDIO_BUFFER_PROMISES[word]) {
            const response = await fetch(`./assets/sounds/${word}.mp3`)
            const arrayBuffer = await response.arrayBuffer()
            AUDIO_BUFFER_PROMISES[word] = AUDIO_CONTEXT.decodeAudioData(arrayBuffer)
        }
        return AUDIO_BUFFER_PROMISES[word]
    }

    _updateValues() {
        const distance = Math.abs(
            Math.sqrt(
                Math.pow(UniversalListener.positionX - this._panner.positionX.value, 2) +
                Math.pow(UniversalListener.positionZ - this._panner.positionZ.value, 2)
            )
        );

        // TODO: silence if distance is > a certain threshold

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
            // if (distance > DISTANCE_RANDOM_THRESHOLD) {
            //     this._filterHz = filterFreq(distance);
            // } else {
            //     this._filterHz = 20000;
            // }
        }
        // console.log("distance:", distance)
        // console.log("randomAmount:", this.randomAmount)
        // console.log("wordLevel:", this.wordLevel)
    }

}
