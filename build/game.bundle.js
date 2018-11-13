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

      // create the menu selector arrow
      this.createArrow();

      // keyboard input stuff
      this.allowInput = true;
      this.keyboardCooldown = 150;
      this.keyboardCooldownTimer;
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
        y: 64 + this.canvas.padding,
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
        id: i + 1,
      }));
      
      // set the focus and total
      this.focusMenuObjectId = 1;
      this.totalMenuObjects = menuText.length;
    }

    /**
     * Gets a menu object by its id
     *
     * @param {integer} id
     * @returns {CanvasTextObjectInteractive}
     * @memberof SceneMainMenu
     */
    getMenuObjectById(id) {
      return this.menuObjects.filter(obj => obj.id === id)[0];
    }

    /**
     * Gets the current focused menu object
     *
     * @returns {CanvasTextObjectInteractive}
     * @memberof SceneMainMenu
     */
    getFocusMenuObject() {
      return this.getMenuObjectById(this.focusMenuObjectId);
    }

    /**
     * Increments the current focused menu item
     *
     * @memberof SceneMainMenu
     */
    incrementFocusMenuObject() {
      this.focusMenuObjectId = this.focusMenuObjectId === this.totalMenuObjects
        ? 1
        : this.focusMenuObjectId + 1;
    }

    /**
     * Decrements the current focused menu item
     *
     * @memberof SceneMainMenu
     */
    decrementFocusMenuObject() {
      this.focusMenuObjectId = this.focusMenuObjectId === 1
        ? this.totalMenuObjects
        : this.focusMenuObjectId - 1;
    }

    /**
     * Creates the focus menu item arrow
     *
     * @memberof SceneMainMenu
     */
    createArrow() {
      // the arrow
      const text = ')';
      const font = '44px Arial';
      
      // get the width to offset from the menu items
      this.ctx.font = font;
      const width = this.ctx.measureText(text).width;

      // get the current focus object
      const focusMenuObject = this.getFocusMenuObject();
      
      // create the object
      this.arrow = new CanvasTextObject({
        text,
        font,
        x: focusMenuObject.x - width - 12,
        y: focusMenuObject.y,
      });
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

      // draw the arrow
      this.arrow.y = this.getFocusMenuObject().y;
      this.pushToScene(this.arrow);
      
      // draw the scene objects to the canvas
      this.drawSceneToCanvas();
    }

    /**
     * Handle input for the scene
     *
     * @param {array} activeKeys
     * @returns {void}
     * @memberof SceneMainMenu
     */
    handleInput(activeKeys) {
      // bail if input is disabled
      if (!this.allowInput) {
        return;
      }

      // bail if no key press
      if (activeKeys.length === 0) {
        return;
      }

      // handle down
      if (activeKeys.indexOf(40) > -1) {
        // increment the focused object
        this.incrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle up
      if (activeKeys.indexOf(38) > -1) {
        // decrement the focused object
        this.decrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle enter
      if (activeKeys.indexOf(13) > -1) {
        // do the menu item callback
        this.getFocusMenuObject().callback();
        this.allowInput = false;
      }
      
      // set timeout to enable key press again
      window.clearTimeout(this.keyboardCooldownTimer);
      const that = this;
      this.keyboardCooldownTimer = window.setTimeout(function() {
        that.allowInput = true;
      }, this.keyboardCooldown);
    }
  }

  class KeyboardController {
    constructor() {
      this.activeKeys = [];
      
      document.addEventListener('keydown', (e) => {
        if (this.activeKeys.indexOf(e.keyCode) === -1) {
          this.activeKeys.push(e.keyCode);
        }
      });

      document.addEventListener('keyup', (e) => {
        const index = this.activeKeys.indexOf(e.keyCode);
        this.activeKeys.splice(index, 1);
      });
    }
  }

  function game() {
    // view state
    this.currentScene = 'mainMenu';

    // debug stuff
    this.debug = true;
    this.frameCount = 0;

    // input handler
    this.keyboard = new KeyboardController();

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

      // handle keyboard input for the current scene
      this.scenes[this.currentScene].handleInput(this.keyboard.activeKeys);

      // maybe show debug info
      if (this.debug) {
        const debugText = `
        Active Keys: [${this.keyboard.activeKeys}]
        Total frames: ${this.frameCount}
      `;
        this.frameCount++;
        this.canvas.drawDebugText(debugText);
      }
    };

    // kick the tires and light the fires
    this.loop();
  }

  return game;

})));
