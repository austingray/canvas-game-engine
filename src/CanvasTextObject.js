/**
 * A text object for the canvas to display
 *
 * @class CanvasTextObject
 */
class CanvasTextObject {
  constructor(args) {
    this.text = args.text;
    this.x = args.x;
    this.y = args.y;
    this.font = (typeof args.font !== 'undefined') ? args.font : '32px Arial';
    this.fillStyle = (typeof args.fillStyle !== 'undefined') ? args.fillStyle : '#FFFFFF';
    this.id = (typeof args.id !== 'undefined') ? args.id : null;
  }

  /**
   * Draws the text object using the canvas drawText method
   *
   * @param {Canvas} canvas
   * @memberof CanvasTextObject
   */
  draw(canvas) {
    canvas.drawText(this.text, this.x, this.y, this.font, this.fillStyle);
  }

  /**
   * Set the X coord
   *
   * @param {integer} x
   * @memberof CanvasTextObject
   */
  setX(x) {
    this.x = x;
  }

  /**
   * Set the Y coord
   *
   * @param {integer} y
   * @memberof CanvasTextObject
   */
  setY(y) {
    this.y = y;
  }
}

export default CanvasTextObject;