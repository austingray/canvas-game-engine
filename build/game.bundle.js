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

  /**
   * Base helper class for canvas scenes
   *
   * @class Scene
   */
  class Scene {
    constructor(canvas) {
      // easy access to the canvas and canvas context
      this.canvas = canvas;
      this.ctx = canvas.ctx;

      // the scene contains objects to be drawn
      this.scene = [];

      // additional constructor actions for child classes
      this.init();
    }

    /**
     * Should be overridden by child class, used as its constructor
     *
     * @memberof Scene
     */
    init() {
      // hello from the other side
    }

    /**
     * Push the object to the scene
     *
     * @param {object} obj
     * @memberof Scene
     */
    pushToScene(obj) {
      this.scene.push(obj);
    }

    /**
     * Draws the menu items to the canvas
     *
     * @memberof Scene
     */
    drawSceneToCanvas() {
      // draw each object in the scene
      this.scene.forEach(obj => {
        obj.draw(this.canvas);
      });

      // clear the scene for the next frame
      this.scene = [];
    }
  }

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
  }

  /**
   * Extends the CanvasTextObject a callback to the CanvasTextObject
   *
   * @class CanvasTextObjectInteractive
   * @extends {CanvasTextObject}
   */
  class CanvasTextObjectInteractive extends CanvasTextObject {
    callback() {
      console.log(`do ${this.text}`);
    }
  }

  /**
   * The Main Menu scene
   *
   * @class SceneMainMenu
   * @extends {Scene}
   */
  class SceneMainMenu extends Scene {
    /**
     * Constructor
     *
     * @memberof SceneMainMenu
     */
    init() {
      // create the logo object
      this.createLogo();

      // create the menu objects
      this.createMenuObjects();
    }

    /**
     * Creates the logo object
     *
     * @memberof SceneMainMenu
     */
    createLogo() {
      const text = 'Canvas Game Engine';
      const font = '44px Arial';
      this.logo = new CanvasTextObject({
        text,
        x: this.canvas.calcCenteredTextX(text, font),
        y: 44 + this.canvas.padding,
        font,
      });
    }

    /**
     * Creates the menu item objects
     *
     * @memberof SceneMainMenu
     */
    createMenuObjects() {
      // the menu text
      const menuText = [
        'New Game',
        'Continue',
        'Options',
      ];

      // the x position
      const menuTextX = this.canvas.calcCenteredTextBoxX(menuText);

      // create new CanvasTextObjectInteractive for each
      this.menuObjects = menuText.map((text, i) => new CanvasTextObjectInteractive({
        text,
        x: menuTextX,
        y: (this.canvas.height / 2) - 55 + (55 * i),
      }));
    }

    /**
     * Draws the main menu
     *
     * @memberof SceneMainMenu
     */
    draw() {
      // draw the background
      this.canvas.drawGradientBackground();

      // push the logo to the scene
      this.pushToScene(this.logo);

      // push the menu items to the scene
      this.menuObjects.forEach(obj => this.pushToScene(obj));
      
      // draw the scene objects to the canvas
      this.drawSceneToCanvas();
    }
  }

  function game() {
    // view state
    this.currentScene = 'mainMenu';

    // debug stuff
    this.debug = true;
    this.frameCount = 0;

    // create the canvas
    this.canvas = new Canvas();

    // define the scenes
    this.scenes = {
      mainMenu: new SceneMainMenu(this.canvas),
    };

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

      // draw the current scene
      this.scenes[this.currentScene].draw();

      // maybe show debug info
      if (this.debug) {
        this.frameCount++;
        this.canvas.drawDebugText(`Total frames: ${this.frameCount}`);
      }
    };

    // kick the tires and light the fires
    this.loop();
  }

  return game;

})));
