import CanvasTextObject from './CanvasTextObject';

/**
 * Extends the CanvasTextObject a callback to the CanvasTextObject
 *
 * @class CanvasTextObjectInteractive
 * @extends {CanvasTextObject}
 */
class CanvasTextObjectInteractive extends CanvasTextObject {
  callback() {
    alert(`do ${this.text}`);
  }
}

export default CanvasTextObjectInteractive;
