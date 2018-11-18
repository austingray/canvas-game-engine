/**
 * A text object for the canvas to display
 *
 * @class ObjectText
 */
class ObjectText {
  constructor(args) {
    this.args = args;
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
   * @param {Canvas} Canvas
   * @memberof ObjectText
   */
  draw(Canvas) {
    Canvas.drawText(this.text, this.x, this.y, this.font, this.fillStyle);
  }

  /**
   * Set the X coord
   *
   * @param {integer} x
   * @memberof ObjectText
   */
  setX(x) {
    this.x = x;
  }

  /**
   * Set the Y coord
   *
   * @param {integer} y
   * @memberof ObjectText
   */
  setY(y) {
    this.y = y;
  }
}

export default ObjectText;