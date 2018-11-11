(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.game = factory());
}(this, (function () { 'use strict';

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
      this.padding = (typeof args.padding !== 'undefined') ? args.padding : 24;

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

    /**
     * Draws all the main menu items
     *
     * @memberof Canvas
     */
    drawMenuItems() {
      // set the font size
      this.ctx.font = '32px Arial';

      // define the menu items
      const menuText = [
        'New Game',
        'Continue',
        'Options',
      ];

      // get the x offset based on the item with the largest width
      // TODO: calculate this in the constructor so it isn't called during the loop
      // TODO: move all the menu canvas stuff into its own class
      const menuItems = menuText.map(txt => ({
        txt,
        width: this.ctx.measureText(txt).width,
      }));
      const widths = menuItems.map(item => item.width);
      const max = widths.reduce((a, b) => Math.max(a, b));
      const x = this.width / 2 - (max / 2);

      // draw em
      menuItems.forEach((item, i) => this.drawMenuItem(item.txt, i, x));
    }

    /**
     * Draws a single menu item
     *
     * @param {string} txt  The menu text
     * @param {integer} i The offset, used for calculating the y position
     * @param {integer} x The x pos
     * @memberof Canvas
     */
    drawMenuItem(txt, i, x) {
      const txtWidth = this.ctx.measureText(txt).width;
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

  function game() {
    // view state
    this.screen = 'menu';

    // debug stuff
    this.debug = true;
    this.frameCount = 0;

    // create the canvas
    this.canvas = new this.Canvas();
    
    /**
     * Calls request animation frame and the update function
     */
    this.loop = () => {
      window.requestAnimationFrame( this.loop );
      this.update();
    };

    /**
     * Gets called once per frame
     * This is where the logic goes
     */
    this.update = () => {
      // clear the canvas
      this.canvas.clear();

      // draw a different scene depending on the screen
      switch (this.screen) {
        case 'menu':
          this.canvas.drawMainMenu();
          break;
      }

      // maybe show debug info
      if (this.debug) {
        this.frameCount++;
        this.canvas.drawDebugText(`Total frames: ${this.frameCount}`);
      }
    };

    // kick the tires and light the fires
    this.loop();
  }
  Object.assign(game.prototype, {
    Canvas,
  });

  return game;

})));
