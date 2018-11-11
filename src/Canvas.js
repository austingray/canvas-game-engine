/**
 * Creates a canvas
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

    // defaults
    this.ctx.font = "24px Arial";
    this.ctx.fillStyle = '#FFFFFF';
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
   * A basic method for drawing text
   *
   * @param {string} text
   * @memberof Canvas
   */
  drawText(txt, x, y) {
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
   * Draws the main menu
   *
   * @memberof Canvas
   */
  drawMainMenu() {
    this.drawGradientBackground();
    this.drawLogo();
    this.drawMenuItems();
  }


  drawMenuItems() {
    // set the font size
    this.ctx.font = '32px Arial';

    // define the menu items
    const menuItems = [
      'New Game',
      'Continue',
      'Options',
    ];

    // draw em
    menuItems.forEach((item, i) => this.drawMenuItem(item, i));
  }

  drawMenuItem(txt, i) {
    const txtWidth = this.ctx.measureText(txt).width;
    const x = (this.width / 2) - (txtWidth / 2)
    const y = (this.height / 2) - 55 + (55 * i);
    this.drawText(txt, x, y);
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

  /**
   * Draws the "logo", for now just text with the project name
   *
   * @memberof Canvas
   */
  drawLogo() {
    const text = 'Canvas Game';
    this.ctx.font = '44px Arial';
    const txtWidth = this.ctx.measureText(text);
    const x = this.width / 2 - txtWidth.width / 2;
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(text, x, 44 + this.padding);
  }
}

export default Canvas;
