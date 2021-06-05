import AUDIO_CONTEXT from "./audio_context";

const LISTENER = AUDIO_CONTEXT.listener;

const FIREFOX = !LISTENER.forwardX

/**
 * Firefox doesn't provide a way to inspect the listener for its position, so we wrap it with this
 *
 * Also this deals with different interfaces between Chrome and FF
 */
class UniversalListener {

    setPosition(x, y, z) {
        this.positionX = x;
        this.positionY = y;
        this.positionZ = z;

        this._setPosition();
    }

    setOrientation(forwardX, forwardY, forwardZ) {
        this.forwardX = forwardX
        this.forwardY = forwardY
        this.forwardZ = forwardZ
        this._setOrientation()
    }
}

UniversalListener.prototype._setPosition = FIREFOX ?
    function () {
        LISTENER.setPosition(this.positionX, this.positionY, this.positionZ);
    } :
    function () {
        LISTENER.positionX.value = this.positionX
        LISTENER.positionY.value = this.positionY
        LISTENER.positionZ.value = this.positionZ
    };

UniversalListener.prototype._setOrientation = FIREFOX ?
    function () {
        LISTENER.setOrientation(this.forwardX, this.forwardY, this.forwardZ, 0, 1, 0)
    } :
    function () {
        LISTENER.forwardX.value = this.forwardX
        LISTENER.forwardY.value = this.forwardY
        LISTENER.forwardZ.value = this.forwardZ
    }

export default new UniversalListener()
