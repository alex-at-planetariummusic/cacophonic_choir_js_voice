import AUDIO_CONTEXT from "./audio_context";

const MAX_WORD_LEVEL = 6;
const MIN_GRAIN_LENGTH_S = 0.05;
const MAX_GRAIN_LENGTH_S = 0.4;
const PANNER_ROLLOFF_FACTOR = 5;

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
        const playAt = when || AUDIO_CONTEXT.currentTime

        // console.log('scheduling for:', playAt)
        // console.log('Rand amt:', this.randomAmount)

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
        console.log('scheduling next grain for:', when)

        // calculate the grain length
        // range from MIN_GRAIN_LENGTH_S--MAX_GRAIN_LENGTH_S
        const grainLengthSeconds = MIN_GRAIN_LENGTH_S + Math.random() * (MAX_GRAIN_LENGTH_S - MIN_GRAIN_LENGTH_S);

        // first schedule the grain
        const source = AUDIO_CONTEXT.createBufferSource()
        source.buffer = buffer;
        source.connect(AUDIO_CONTEXT.destination)
        source.start(when, offset, grainLengthSeconds)

        // now calucluate the next grain
        const nowSeconds = AUDIO_CONTEXT.currentTime

        let nextOffsetTime;

        let rand = Math.random();

        if (rand < 0.1 + 0.5 * this.randomAmount) { // stutter
            nextOffsetTime = offset;
        } else {
            nextOffsetTime = offset + grainLengthSeconds
        }

        let nextAction;
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

    _playWord() {

    }

}
