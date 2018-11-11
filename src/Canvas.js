/**
 * Creates a canvas and provides methods for drawing to it
 *
 * @class Canvas
 */
class Canvas {
  constructor(args = {}) {
    // id attribute of the canvas element
    this.id = (typeof args.id !== 'undefined') ? args.id : 'canvas';
    // canvas width
    this.width = (typeof args.width !== 'undefined') ? args.width : 640;
    // canvas height
    this.height = (typeof args.height !== 'undefined') ? args.height : 640;
    // define a padding to keep consistent spacing off the edge
    this.padding = (typeof args.padding !== 'undefined') ? args.padding : 24

    // create the canvas element and add it to the document body
    this.element = document.createElement('canvas');
    this.element.id = this.id;
    this.element.width = this.width;
    this.element.height = this.height;
    document.body.appendChild(this.element);

    // get context
    this.ctx = this.element.getContext('2d');
  }

  /**
   * Clears the canvas
   *
   * @memberof Canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Draws text to the canvas
   *
   * @param {string} txt
   * @param {integer} x
   * @param {integer} y
   * @param {string} [font='32px Arial']
   * @param {string} [fillStyle='#FFFFFF']
   * @memberof Canvas
   */
  drawText(txt, x, y, font = '32px Arial', fillStyle = '#FFFFFF') {
    this.ctx.font = font;
    this.ctx.fillStyle = fillStyle;
    this.ctx.fillText(txt, x, y);
  }

  /**
   * Draws debug text
   *
   * @param {string} txt
   * @memberof Canvas
   */
  drawDebugText(txt) {
    this.ctx.font = "18px Arial";
    const txtWidth = this.ctx.measureText(txt).width; 
    this.ctx.fillText(txt, this.width - txtWidth - this.padding, this.height - this.padding);
  }

  /**
   * Calculates the starting x pos to center a string
   *
   * @param {string} text the text to be measured
   * @param {string} font canvas context font
   * @returns {integer} x coordinate
   * @memberof Canvas
   */
  calcCenteredTextX(text, font) {
    this.ctx.font = font;
    const width = this.ctx.measureText(text).width;
    return (this.width / 2 - width / 2);
  }

  /**
   * Calculates x position for an array of strings to be stacked centered and left justified
   *
   * @param {array} txtArr
   * @param {string} [font='32px Arial']
   * @returns {integer} x coordinate
   * @memberof Canvas
   */
  calcCenteredTextBoxX(txtArr, font = '32px Arial') {
    // set the font size to calculate with
    this.ctx.font = font;

    // get the width of each string
    const strWidthArr = txtArr.map(txt => this.ctx.measureText(txt).width);

    // get the longest width
    const longest = strWidthArr.reduce((a, b) => Math.max(a, b));

    // calculate and return x
    return (this.width / 2) - (longest / 2);
  }

  /**
   * Draws a black gradient across the entire canvas
   *
   * @memberof Canvas
   */
  drawGradientBackground() {
    const grd = this.ctx.createLinearGradient(0, 0, this.width, this.height);
    grd.addColorStop(0, '#333333');
    grd.addColorStop(1, '#000000');
    this.ctx.fillStyle = grd;
    this.ctx.fillRect(0, 0, this.width, this.height);
  }
}

export default Canvas;
