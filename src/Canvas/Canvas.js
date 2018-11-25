import Layer from './Layer';
import Camera from './Camera';

/**
 * Creates a canvas and provides methods for drawing to it
 * @class Canvas
 */
class Canvas {
  constructor(args = {}) {
    // set constants
    this.width = 1024;
    this.height = 640;

    // for consistent spacing off the canvas edge
    this.padding = 24;

    // generate all the <canvas> elements
    this.generateLayers();

    // generate object caches
    this.generateObjectCaches();

    // set a default ctx
    this.ctx = this.primaryLayer.context;
    
    // camera
    this.Camera = new Camera(this.width, this.height);
  }

  /**
   * Generates all the layers, called in constructor
   *
   * @memberof Canvas
   */
  generateLayers() {
    this.layers = [];
    this.canvasId = 0;

    // create canvas layers
    this.createLayer('background');
    this.createLayer('primary');
    this.createLayer('secondary');
    this.createLayer('override');
    this.createLayer('shadow');
    this.createLayer('hud');
    this.createLayer('debug');

    // get explicit reference to debug layer
    this.debugLayer = this.getLayerByName('debug');
    this.debugKeys = [];
    this.debugText = [];

    // primary, secondary, override
    this.primaryLayer = this.getLayerByName('primary');
    this.secondaryLayer = this.getLayerByName('secondary');
    this.overrideLayer = this.getLayerByName('override');

    // get reference to shadow layer
    this.shadowLayer = this.getLayerByName('shadow');
  }

  /**
   * Generates all object types
   *
   * @memberof Canvas
   */
  generateObjectCaches() {

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

    // context
    const context = (typeof args.context === 'undefined') ? '2d' : args.context;

    // visible
    const visible = (typeof args.visible === 'undefined') ? true : args.visible;

    // add 'er to the stack
    this.layers.push(new Layer(id, {
      name,
      width,
      height,
      context,
      visible,
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
    this.debugLayer.context.fillStyle = 'white';
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
    const radius = args.radius;

    // draw
    this.ctx.fillStyle = args.fillStyle;
    this.ctx.beginPath();
    this.ctx.arc(
      x,
      y,
      radius,
      args.startAngle,
      args.endAngle,
      args.anticlockwise,
    );
    this.ctx.fill();
    // this.ctx.strokeStyle = '#500050';
    // this.ctx.lineWidth = 1;
    // this.ctx.stroke();
    this.ctx.closePath();
  }

  drawDebugLine(p1, p2) {
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(300,150);
    ctx.stroke();
  }

  drawMap(image) {
    this.ctx.drawImage(image, this.Camera.offsetX, this.Camera.offsetY);
  }

  drawTile(tile) {
    // draw the tile
    const x = tile.xPixel + this.Camera.offsetX;
    const y = tile.yPixel + this.Camera.offsetY;

    this.ctx = this.primaryLayer.context
    switch (tile.type) {
      case 'rock':
        this.ctx = this.overrideLayer.context
        this.ctx.fillStyle = '#888787';
        this.ctx.strokeStyle = '#464242';
        break;

      case 'tree':
        this.ctx.fillStyle = '#008000';
        this.ctx.strokeStyle = '#063c06';
        break;
      
      case 'desert':
        this.ctx.fillStyle = '#e2c55a';
        this.ctx.strokeStyle = '#d0ab25';
        break;

      case 'water':
        this.ctx.fillStyle = 'blue';
        break;

      case 'grass':
      default:
        this.ctx.fillStyle = '#008000';
        this.ctx.strokeStyle = '#063c06';
        break;
    }

    if (tile.type === 'torch') {
      this.ctx = this.primaryLayer.context
      this.drawCircle({
        x: tile.x + 25,
        y: tile.y + 25,
        radius: 5,
        fillStyle: 'rgba(255, 155, 0, .5)',
        startAngle: Math.PI / 180 * 0,
        endAngle: Math.PI / 180 * 360,
        anticlockwise: false,
      });
    }

    if (tile.type === 'tree') {
      this.ctx.fillRect(x, y, tile.width, tile.height);
      this.ctx = this.secondaryLayer.context;
      this.drawCircle({
        x: tile.x + 25,
        y: tile.y + 25,
        radius: 15,
        fillStyle: 'brown',
        startAngle: Math.PI / 180 * 0,
        endAngle: Math.PI / 180 * 360,
        anticlockwise: false,
      });
      this.drawCircle({
        x: tile.x + 25,
        y: tile.y + 25,
        radius: 50,
        fillStyle: 'rgba(40, 202, 0, .8)',
        startAngle: Math.PI / 180 * 0,
        endAngle: Math.PI / 180 * 360,
        anticlockwise: false,
      });
    } else {
      this.ctx.fillRect(x, y, tile.width, tile.height);
    }

    this.ctx = this.primaryLayer.context;
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
