import Layer from './Layer';
import Camera from './Camera';
import Shadows from './Shadows';
import Shadows2 from './Shadows2';

/**
 * Creates a canvas and provides methods for drawing to it
 * @class Canvas
 */
class Canvas {
  constructor(args = {}) {
    // set constants
    this.width = args.width;
    this.height = args.height;

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

    // shadows
    this.Shadows = new Shadows({
      width: this.width,
      height: this.height,
      domElement: this.getLayerByName('shadow3d').element,
    });

    // shadows
    this.Shadows2 = new Shadows2({
      width: this.width,
      height: this.height,
      domElement: this.getLayerByName('shadow3dtexture').element,
      canvasElement: this.getLayerByName('shadow3d').element,
    });

    console.log(this.getLayerByName('shadow3d').context);
  }

  /**
   * Generates all the layers, called in constructor
   *
   * @memberof Canvas
   */
  generateLayers() {
    // create the canvas container div
    this.canvasDiv = {};
    this.canvasDiv.element = document.createElement('div');;
    this.canvasDiv.element.setAttribute('style', `width: ${this.width}px; height: ${this.height}px; background: #000000;`);
    this.canvasDiv.element.id = 'domParent';
    document.body.appendChild(this.canvasDiv.element);

    this.layers = [];
    this.canvasId = 0;

    // create canvas layers
    this.createLayer('background');
    this.createLayer('primary');
    this.createLayer('character');
    this.createLayer('secondary');
    this.createLayer('override');
    this.createLayer('shadow');
    this.createLayer('shadow3d', {
      context: 'webgl',
      // left: '-9999px',
      // top: '-9999px',
    });
    this.createLayer('shadow3dtexture', {
      context: 'webgl',
    });
    this.createLayer('hud');
    this.createLayer('menu');
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

    // create a tmp div for generating images
    this.tmpDiv = document.createElement('div');
    this.tmpDiv.setAttribute('style', `width: 50px; height: 50px; position: absolute; left: -99999px`);
    this.tmpDiv.id = 'hidden';
    document.body.appendChild(this.tmpDiv);

    this.createLayer('tmp', {
      appendTo: this.tmpDiv,
      width: 50,
      height: 50,
    });
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
    const left = (typeof args.left === 'undefined') ? 0 : args.left;
    const top = (typeof args.top === 'undefined') ? 0 : args.top;

    const appendTo = (typeof args.appendTo === 'undefined') ? document.body : args.appendTo;

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
      appendTo,
      left,
      top,
    }));
  }

  /**
   * Triggers a layer's delete method
   * TODO: remove from layer array
   *
   * @param {*} name
   * @memberof Canvas
   */
  deleteLayer(name) {
    const layer = this.getLayerByName(name);
    layer.delete();
  }

  /**
   * Creates the purple circle hero image
   *
   * @returns
   * @memberof Canvas
   */
  createImage() {
    const layer = this.getLayerByName('tmp');
    layer.context.clearRect(0, 0, 50, 50);
    const radius = 25;

    // draw
    layer.context.fillStyle = this.randomHexValue();
    layer.context.beginPath();
    layer.context.arc(
      radius,
      radius,
      radius,
      Math.PI / 180 * 0,
      Math.PI / 180 * 360,
      false
    );

    
    layer.context.fill();
    layer.context.closePath();

    var img = layer.element.toDataURL();

    return img;
  }

  /**
   * Generates a random HEX
   * https://jsperf.com/random-hex-color-generation
   *
   * @returns
   * @memberof Canvas
   */
  randomHexValue() {
    var color = '#';
    var c = '0123456789ABCDEF'.split('');

    for (var i = 0; i < 6; i++) {
      color += c[Math.floor(Math.random() * c.length)];
    }

    return color;
  }

  /**
   * Generates all object types
   *
   * @memberof Canvas
   */
  generateObjectCaches() {

  }

  /**
   * Sets this.ctx to a layer's context by its name
   *
   * @param {*} layerName
   * @memberof Canvas
   */
  setContext(layerName) {
    const layer = this.getLayerByName(layerName);
    this.ctx = layer.context;
  }

  /**
   * Gets a layer by name
   *
   * @param {*} name
   * @returns {Layer}
   * @memberof Canvas
   */
  getLayerByName(name) {
    const layer = this.layers.filter(layer => layer.name === name)[0];
    return layer;
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
   * Clear a layer by its name
   *
   * @param {*} layerName
   * @memberof Canvas
   */
  clearLayer(layerName) {
    this.getLayerByName(layerName).clear();
  }

  /**
   * Clear an array of layers
   *
   * @param {array} layers
   * @memberof Canvas
   */
  clearLayers(layers) {
    for (let i = 0; i < layers.length; i++) {
      this.getLayerByName(layers[i]).clear();
    }
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

  /**
   * Draws the character
   *
   * @param {*} args
   * @memberof Canvas
   */
  drawCharacter(args) {    
    // offset for camera
    const x = args.x + this.Camera.offsetX;
    const y = args.y + this.Camera.offsetY;
    this.ctx.drawImage(args.image, x, y, args.width, args.height);
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
    const x = tile.x + this.Camera.offsetX;
    const y = tile.y + this.Camera.offsetY;

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
      this.ctx = this.primaryLayer.context;
      this.drawCircle({
        x: tile.x + 25,
        y: tile.y + 25,
        radius: 5,
        fillStyle: 'rgba(255, 155, 0, 1)',
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

  /**
   * Creates a rounded rectangle
   * https://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
   *
   * @param {*} ctx
   * @param {*} x
   * @param {*} y
   * @param {*} width
   * @param {*} height
   * @param {*} radius
   * @param {*} fill
   * @param {*} stroke
   * @memberof Canvas
   */
  roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
      stroke = true;
    }
    if (typeof radius === 'undefined') {
      radius = 5;
    }
    if (typeof radius === 'number') {
      radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
      var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
      for (var side in defaultRadius) {
        radius[side] = radius[side] || defaultRadius[side];
      }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
      ctx.fill();
    }
    if (stroke) {
      ctx.stroke();
    }

  }
}

export default Canvas;
