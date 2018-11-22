import Camera from './Camera';

/**
 * Creates a canvas and provides methods for drawing to it
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
    this.padding = (typeof args.padding !== 'undefined') ? args.padding : 24;

    // create the canvas element and add it to the document body
    this.element = document.createElement('canvas');
    this.element.id = this.id;
    this.element.width = this.width;
    this.element.height = this.height;
    document.body.appendChild(this.element);

    // get context
    this.ctx = this.element.getContext('2d');
    
    // camera
    this.Camera = new Camera(this.width, this.height);
  }

  /**
   * Clears the canvas
   * @memberof Canvas
   */
  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  /**
   * Draws text to the canvas
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
   * @param {string} txt
   * @memberof Canvas
   */
  drawDebugText(txt) {
    this.ctx.font = "18px Arial";
    const txtWidth = this.ctx.measureText(txt).width; 
    this.ctx.fillText(txt, this.width - txtWidth - this.padding, this.height - this.padding);
  }

  /**
   * Draws a circle
   *
   * @param {*} args
   * @memberof Canvas
   */
  drawCircle(args) {
    // offset for camera
    const x = args.x + this.Camera.offsetX;
    const y = args.y + this.Camera.offsetY;

    // draw
    this.ctx.fillStyle = args.fillStyle;
    this.ctx.beginPath();
    this.ctx.arc(
      x,
      y,
      args.radius,
      args.startAngle,
      args.endAngle,
      args.anticlockwise,
    );
    this.ctx.fill();
    this.ctx.strokeStyle = '#500050';
    this.ctx.lineWidth = 1;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawMap(image) {
    this.ctx.drawImage(image, this.Camera.offsetX, this.Camera.offsetY);
  }

  drawTile(tile) {
    // bail if the tile is not in viewport
    if (!this.Camera.inViewport(tile.x, tile.y, tile.x + tile.width, tile.y + tile.height)) {
      return;
    }

    // draw the tile
    const x = tile.x + this.Camera.offsetX;
    const y = tile.y + this.Camera.offsetY;
    this.ctx.beginPath();
    this.ctx.lineWidth = tile.lineWidth;
    
    switch (tile.type) {
      case 'rock':
        this.ctx.fillStyle='#888787';
        this.ctx.strokeStyle = '#464242';
        break;

      case 'grass':
      default:
        this.ctx.fillStyle='#008000';
        this.ctx.strokeStyle = '#063c06';
        break;
    }

    
    this.ctx.rect(x, y, tile.width, tile.height);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.closePath();
  }

  /**
   * Calculates the starting x pos to center a string
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
   * Calculates text width
   * @param {*} txt
   * @param {*} font
   * @returns
   * @memberof Canvas
   */
  calcTextWidth(txt, font) {
    this.ctx.font = font;
    return this.ctx.measureText(txt).width;
  }

  /**
   * Draws a black gradient across the entire canvas
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
