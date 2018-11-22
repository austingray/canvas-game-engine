import Layer from './Layer';
import Camera from './Camera';

/**
 * Creates a canvas and provides methods for drawing to it
 * @class Canvas
 */
class Canvas {
  constructor(args = {}) {
    // set constants
    this.width = 640;
    this.height = 640;

    // for consistent spacing off the canvas edge
    this.padding = 24;

    // different <canvas> elements will act as layers for render optimization
    // each canvas will exist in the layers array
    this.layers = [];
    this.canvasId = 0;

    // create canvas layers
    this.createLayer('background');
    this.createLayer('primary');
    this.createLayer('hud');
    this.createLayer('debug');

    // get explicit reference to debug layer
    this.debugLayer = this.getLayerByName('debug');
    this.debugKeys = [];
    this.debugText = [];

    // set a default ctx
    this.ctx = this.layers[1].context;
    
    // camera
    this.Camera = new Camera(this.width, this.height);
  }

  /**
   * Gets a layer by name
   *
   * @param {*} name
   * @returns {Layer}
   * @memberof Canvas
   */
  getLayerByName(name) {
    const debugLayer = this.layers.filter(layer => layer.name === name)[0];
    console.log(debugLayer);
    return debugLayer;
  }
  
  /**
   * Creates a new canvas layer
   *
   * @param {*} name
   * @param {*} [args={}]
   * @memberof Canvas
   */
  createLayer(name, args = {}) {
    // assign a unique id
    this.canvasId++;
    const id = `canvas-${this.canvasId}`;

    // get width/height
    const width = (typeof args.width === 'undefined') ? this.width : args.width;
    const height = (typeof args.height === 'undefined') ? this.height : args.height;

    // add 'er to the stack
    this.layers.push(new Layer(id, {
      name,
      width,
      height,
    }));
  }

  /**
   * Clears a canvas
   * @memberof Canvas
   */
  clear(index) {
    const layer = this.layers[index];
    const ctx = layer.context;
    ctx.clearRect(0, 0, layer.width, layer.height);
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

  pushDebugText(key, text) {
    if (this.debugKeys.indexOf(key) === -1) {
      this.debugKeys.push(key);
    }
    this.debugText[key] = text;
  }

  /**
   * Draws debug text
   * @param {string} txt
   * @memberof Canvas
   */
  drawDebugText(txt) {
    this.debugLayer.context.font = "18px Arial";
    this.debugKeys.forEach((key, i) => {
      this.debugLayer.context.fillText(this.debugText[key], this.padding, this.height - this.padding - i * 18);
    });
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

    // draw tiles to the primary layer
    const ctx = this.layers[1].context;

    // draw the tile
    const x = tile.x + this.Camera.offsetX;
    const y = tile.y + this.Camera.offsetY;
    // ctx.beginPath();
    // ctx.lineWidth = tile.lineWidth;
    // ctx.lineWidth = 1;
    
    switch (tile.type) {
      case 'rock':
        ctx.fillStyle = '#888787';
        ctx.strokeStyle = '#464242';
        break;
      
      case 'desert':
        ctx.fillStyle = '#e2c55a';
        ctx.strokeStyle = '#d0ab25';
        break;

      case 'grass':
      default:
        ctx.fillStyle = '#008000';
        ctx.strokeStyle = '#063c06';
        break;
    }

    ctx.fillRect(x, y, tile.width, tile.height);
    // ctx.fill();
    // ctx.stroke();
    // ctx.closePath();
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
