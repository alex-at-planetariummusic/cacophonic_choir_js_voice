const AUDIO_CONTEXT = new AudioContext();
const MAX_WORD_LEVEL = 6;

const AUDIO_BUFFER_PROMISES = {}

export default class WebaudioSpeaker {
    constructor(getWordCallback, positionX, positionZ) {
        this._getWord = getWordCallback;
        this.wordLevel = MAX_WORD_LEVEL;
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
        const nowSeconds = AUDIO_CONTEXT.currentTime

        console.log('scheduling for:', playAt)

        const buffer = await this._getBufferPromise(this._getWord(this.wordLevel))
        const source = AUDIO_CONTEXT.createBufferSource()
        source.buffer = buffer;
        source.connect(AUDIO_CONTEXT.destination)
        source.start(playAt)

        const bufferLengthInSeconds = buffer.length / buffer.sampleRate

        const differenceMS = ((playAt - nowSeconds) * 1000) || 1

        // schedule the next next word at the same time we play the word
        setTimeout(() => {
            this._scheduleNextWord(playAt + bufferLengthInSeconds)
        }, differenceMS || 0)
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
