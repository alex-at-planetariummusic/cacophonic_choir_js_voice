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
        if (y !== undefined) {
            this.positionY = y;
        }
        this.positionZ = z;

        this._setPosition(this.positionX, this.positionY, this.positionZ);
    }

    setOrientation(forwardX, forwardY) {
        this.forwardX = forwardX
        this.forwardY = forwardY
        this._setOrientation(forwardX, forwardY)
    }
}

UniversalListener.prototype._setPosition = FIREFOX ?
    function (x, y, z) {
        LISTENER.setOrientation(x, y, z, 0, 1, 0);
    } :
    function (x, y, z) {
        LISTENER.positionX.value = x
        LISTENER.positionY.value = y
        LISTENER.positionZ.value = z
    };

UniversalListener.prototype._setOrientation = FIREFOX ?
    function (forwardX, forwardY) {
        LISTENER.setOrientation(forwardX, forwardY, -1, 0, 1, 0)
    } :
    function (forwardX, forwardY) {
        LISTENER.forwardX.value = forwardX
        LISTENER.forwardY.value = forwardY
    }

export default new UniversalListener()
