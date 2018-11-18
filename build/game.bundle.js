(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.game = factory());
}(this, (function () { 'use strict';

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

  /**
   * Extends the ObjectText with a callback method
   *
   * @class ObjectTextInteractive
   * @extends {ObjectText}
   */
  class ObjectTextInteractive extends ObjectText {
    callback() {
      this.args.callback();
    }
  }

  /**
   * Draws a circle to the Canvas
   *
   * @class ObjectCircle
   */
  class ObjectCircle {
    constructor(args) {    
      this.args = args;
      this.x = args.x;
      this.y = args.y;
      this.radius = args.radius;
      this.fillStyle = args.fillStyle;
      this.startAngle = Math.PI / 180 * 0;
      this.endAngle = Math.PI / 180 * 360;
      this.anticlockwise = false;

      this.init();
    }

    draw(Canvas) {
      Canvas.ctx.beginPath();
      Canvas.ctx.fillStyle = this.fillStyle;
      Canvas.ctx.arc(
        this.x,
        this.y,
        this.radius,
        this.startAngle,
        this.endAngle,
        this.anticlockwise,
      );
      Canvas.ctx.fill();
      Canvas.ctx.closePath();
    }
  }

  class ObjectMenu {
    /**
     * Creates an instance of ObjectMenu.
     * @param {*} args
     * @memberof ObjectMenu
     */
    constructor(args, game) {
      // default to having focus
      this.hasFocus = true;
      
      // reference to the game object
      this.game = game;

      // calculate the menu starting x position.
      this.startX = this.game.Canvas.calcCenteredTextBoxX(args.options.map(option => option.text));

      // create the option objects
      this.createOptionObjects(args.options);

      // set the focus menu object to the first one.
      this.focusMenuObject = this.options[0];

      // create the arrow
      this.createArrow(args);
    }

    /**
     * Sets focus on the menu.
     * this.hasFocus means Arrow keys will change the selected menu item.
     * @param {boolean} [hasFocus=true]
     * @memberof ObjectMenu
     */
    setFocus(hasFocus = true) {
      this.hasFocus = hasFocus;
    }

    /**
     * Creates the menu item option Objects
     * @param {*} options
     * @memberof ObjectMenu
     */
    createOptionObjects(options) {
      this.options = options.map((option, i) => this.game.Objects.create({
        ...option,
        type: 'textInteractive',
        x: this.startX,
        y: (this.game.Canvas.height / 2) - 55 + (i * 55),
      }));
    }

    /**
     * Creates the arrow indicating which object is selected
     * @memberof ObjectMenu
     */
    createArrow() {
      // the arrow
      const text = ')';
      const font = '44px Arial';
      
      // get the width to offset from the menu items
      const width = this.game.Canvas.calcTextWidth(text, font);

      // get the current focus object
      // const focusMenuObject = this.getFocusMenuObject();
      
      // create the object
      this.arrow = this.game.Objects.create({
        type: 'text',
        text,
        font,
        x: this.startX - width - 12,
        y: this.focusMenuObject.y,
      });
    }

    /**
     * Gets the array index of the focused menu option by its id
     *
     * @param {*} id
     * @returns
     * @memberof ObjectMenu
     */
    getFocusMenuObjectIndexById(id) {
      return this.options.map(option => option.id).indexOf(id);
    }

    /**
     * Increments the current focused menu item
     *
     * @memberof SceneMainMenu
     */
    incrementFocusMenuObject() {
      // get the focused menu object's index in the option array
      const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

      // increment it or start back at the beginning
      this.focusMenuObject = index === (this.options.length - 1)
        ? this.options[0]
        : this.options[index + 1];
          
      // update the arrow position
      this.arrow.y = this.focusMenuObject.y;
    }

    /**
     * Decrements the current focused menu item
     *
     * @memberof SceneMainMenu
     */
    decrementFocusMenuObject() {
      // get the focused menu object's index in the option array
      const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

      // increment it or start back at the beginning
      this.focusMenuObject = index === 0
        ? this.options[this.options.length - 1]
        : this.options[index - 1];
          
      // update the arrow position
      this.arrow.y = this.focusMenuObject.y;
    }

    /**
     * Draws the menu
     *
     * @memberof ObjectMenu
     */
    draw() {
      this.options.forEach(option => option.draw(this.game.Canvas));

      if (this.hasFocus) {
        this.arrow.draw(this.game.Canvas);
      }
    }
  }

  class Hero extends ObjectCircle {
    init() {
      // allows keyboard input to the character
      this.allowInput = true;
      this.canMoveUp = true;
      this.canMoveRight = true;
      this.canMoveDown = true;
      this.canMoveLeft = true;

      // handle character's directional velocity
      this.velocities = [0, 0, 0, 0];
      this.maxSpeed = 30;
      this.rateOfIncrease = 1 + this.maxSpeed / 100;

      // set target x,y for easing the character movement
      this.targetX = this.x;
      this.targetY = this.y;
      this.targetXTimer;
      this.targetYTimer;

      // cooldown beteween movement
      this.inputCooldown = 30;
    }

    targetYTimerHandler(dir) {
      // clear the existing timer
      clearTimeout(this.targetYTimer);

      // get the difference between the current y and the target y
      const difference = Math.abs(this.y - this.targetY);

      // set a new timer
      this.targetYTimer = setTimeout(() => {
        // handle direction
        this.y = dir === 'up'
          ? this.y - (difference / this.inputCooldown)
          : this.y + (difference / this.inputCooldown);

        // if we're not close enough to the target Y, keep moving
        if (difference > 1) {
          this.targetYTimerHandler(dir);
        }
      }, difference / this.inputCooldown);
    }

    targetXTimerHandler(dir) {
      // clear the existing timer
      clearTimeout(this.targetXTimer);

      // get the difference between the current y and the target y
      const difference = Math.abs(this.x - this.targetX);

      // set a new timer
      this.targetXTimer = setTimeout(() => {
        // handle direction
        this.x = dir === 'left'
          ? this.x - (difference / this.inputCooldown)
          : this.x + (difference / this.inputCooldown);

        // if we're not close enough to the target Y, keep moving
        if (difference > 1) {
          this.targetXTimerHandler(dir);
        }
      }, difference / this.inputCooldown);
    }

    handleInput(activeKeys) {
      // bail if input is disabled
      if (!this.allowInput) {
        return;
      }

      // bail if no key press
      if (activeKeys.length === 0) {
        // cooldown velocities

        // velocity cooldown
        this.velocities = this.velocities.map((velocity) => {
          if (velocity > 0) {
            velocity = velocity - this.rateOfIncrease;
          }

          if (velocity < 0) {
            velocity = 0;
          }

          return velocity;
        });
        return;
      }

      // handle up
      if (activeKeys.indexOf(38) > -1) {
        this.velocities[0] = (this.velocities[0] + 1) * this.rateOfIncrease;
        if (this.velocities[0] > this.maxSpeed) {
          this.velocities[0] = this.maxSpeed;
        }

        // cancel opposite direction velocity
        this.velocities[2] = 0;

        // movement easing
        this.targetY = this.y - this.velocities[0];
        this.targetYTimerHandler('up');
        this.canMoveUp = false;
      }

      // handle right
      if (activeKeys.indexOf(39) > -1) {
        this.velocities[1] = (this.velocities[1] + 1) * this.rateOfIncrease;
        if (this.velocities[1] > this.maxSpeed) {
          this.velocities[1] = this.maxSpeed;
        }
        
        // cancel opposite direction velocity
        this.velocities[3] = 0;

        // movement easing
        this.targetX = this.x + this.velocities[1];
        this.targetXTimerHandler('right');
        this.canMoveRight = false;
      }

      // handle down
      if (activeKeys.indexOf(40) > -1) {
        this.velocities[2] = (this.velocities[2] + 1) * this.rateOfIncrease;
        if (this.velocities[2] > this.maxSpeed) {
          this.velocities[2] = this.maxSpeed;
        }

        // cancel opposite direction velocity
        this.velocities[0] = 0;

        // movement easing
        this.targetY = this.y + this.velocities[2];
        this.targetYTimerHandler('down');
        this.canMoveDown = false;
      }

      // handle left
      if (activeKeys.indexOf(37) > -1) {
        this.velocities[3] = (this.velocities[3] + 1) * this.rateOfIncrease;
        if (this.velocities[3] > this.maxSpeed) {
          this.velocities[3] = this.maxSpeed;
        }
        
        // cancel opposite direction velocity
        this.velocities[1] = 0;

        // movement easing
        this.targetX = this.x - this.velocities[3];
        this.targetXTimerHandler('left');
        this.canMoveLeft = false;
      }
      
      // set timeout to enable key press again
      clearTimeout(this.keyboardCooldownTimer);
      this.keyboardCooldownTimer = setTimeout(() => {
        this.canMoveUp = true;
        this.canMoveRight = true;
        this.canMoveDown = true;
        this.canMoveLeft = true;
      }, this.inputCooldown);
    }
  }

  /**
   * Handles Object creation for use in Scenes
   *
   * @class Objects
   */
  class Objects {
    constructor(game) {
      this.game = game;

      // Used as the object.id when creating new objects.
      // Increments after each usage.
      this.newObjectId = 0;
    }

    /**
     * Creates a new object
     *
     * @param {*} args
     * @returns A Scene Object
     * @memberof Objects
     */
    create(args) {
      // get a new object id
      this.newObjectId++;

      // create the new object args
      const object = Object.assign({}, args, {
        id: this.newObjectId,
      });

      switch (object.type) {
        case 'text':
          return new ObjectText(object)
          break;
        
        case 'textInteractive':
          return new ObjectTextInteractive(object);
          break;

        case 'circle':
          return new ObjectCircle(object);
          break;
        
        case 'menu':
          return new ObjectMenu(object, this.game);
          break;

        case 'hero':
          return new Hero(object);
          break;
        
        default:
          break;
      }

      return {};
    }
  }

  /**
   * Base helper class for canvas scenes
   *
   * @class Scene
   */
  class Scene {
    // constructor games the game object
    constructor(game) {
      // make the game instance available to the scene
      this.game = game;

      // easy access to the canvas and canvas context
      this.Canvas = this.game.Canvas;
      this.ctx = this.game.Canvas.ctx;

      // each access to the object factory
      this.Objects = this.game.Objects;

      // the scene contains objects to be drawn
      this.scene = [];

      // additional constructor actions for child classes
      this.init();
    }

    /**
     ** Should be declared by subclass
     *  called at the end of constructor
     *
     * @memberof Scene
     */
    init() {
      // hello from the other side
    }

    /**
     * Push an object to the scene
     *
     * @param {object} obj
     * @memberof Scene
     */
    pushToScene(obj) {
      this.scene.push(obj);
    }

    /**
     ** Should be declared by subclass
     *  What/where objects should be displayed
     *
     * @memberof Scene
     */
    prepareScene() {
      /* for example
      if (this.shouldShowObject) {
        this.pushToScene(this.obj);
      }
      */
    }

    /**
     * Calls the .draw() method of each object in the scene
     * 
     *
     * @memberof Scene
     */
    drawSceneToCanvas() {
      // draw each object in the scene
      this.scene.forEach(obj => {
        obj.draw(this.Canvas);
      });

      // clear the scene for the next frame
      this.scene = [];
    }

    /**
     * Draws the current scene
     * Called in the main game loop
     *
     * @memberof Scene
     */
    draw() {
      // push the scene objects to the scene array
      this.prepareScene();

      // call each object's draw method
      this.drawSceneToCanvas();
    }

    /**
     ** Should be overridden by subclass
     *  Handles input from keyboard/mouse
     *
     * @memberof Scene
     */
    handleInput() {
      // hello from the other side
    }

    /**
     * Handle scene transitions
     *
     * @memberof Scene
     */
    transitionIn() {
      // disable and reenable keyboard on scene transition
      this.game.Keyboard.setDisabled();
      this.game.Keyboard.clear();
      const that = this;
      setTimeout(function() {
        that.game.Keyboard.setDisabled(false);
      }, 150);
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
      // this.createMenuObjects();

      //
      this.createMenu();

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
      this.logo = this.Objects.create({
        type: 'text',
        text,
        x: this.Canvas.calcCenteredTextX(text, font),
        y: 64 + this.Canvas.padding,
        font,
      });
    }

    /**
     * Creates the menu
     *
     * @memberof SceneMainMenu
     */
    createMenu() {
      this.menu = this.Objects.create({
        type: 'menu',
        options: [
          {
            text: 'New Game',
            callback: () => {
              this.game.changeCurrentScene('game');
            },
          },
          {
            text: 'Continue',
            callback: () => {
              console.log('do Continue');
            },
          },
          {
            text: 'Options',
            callback: () => {
              console.log('do Options');
            },
          },
        ]
      });
    }

    /**
     * Loads the objects to the scene for drawing
     *
     * @memberof SceneMainMenu
     */
    prepareScene() {
      // draw the background
      this.Canvas.drawGradientBackground();

      // push the logo to the scene
      this.pushToScene(this.logo);

      // push the menu to the scene
      this.pushToScene(this.menu);
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
        this.menu.incrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle up
      if (activeKeys.indexOf(38) > -1) {
        // decrement the focused object
        this.menu.decrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle enter
      if (activeKeys.indexOf(13) > -1) {
        // do the menu item callback
        this.menu.focusMenuObject.callback();
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

  class SceneGame extends Scene {
    init() {
      this.createHero();
    }

    createHero() {
      this.hero = this.Objects.create({
        type: 'hero',
        x: 30,
        y: 30,
        radius: 30,
        fillStyle: 'green',
      });
    }

    prepareScene() {
      this.pushToScene(this.hero);
    }

    /**
     * Handle input for the scene
     *
     * @param {array} activeKeys
     * @returns {void}
     * @memberof SceneMainMenu
     */
    handleInput(activeKeys) {
      // pause the game
      if (activeKeys.indexOf(27) > -1) {
        this.game.changeCurrentScene('pause');
      }

      this.hero.handleInput(activeKeys);
    }
  }

  /**
   * The Main Menu scene
   *
   * @class ScenePause
   * @extends {Scene}
   */
  class ScenePause extends Scene {
    /**
     * Constructor
     *
     * @memberof ScenePause
     */
    init() {
      // create the logo object
      this.createLogo();

      // create the menu items
      this.createMenu();

      // keyboard input stuff
      this.allowInput = true;
      this.keyboardCooldown = 150;
      this.keyboardCooldownTimer;
    }

    /**
     * Creates the logo object
     *
     * @memberof ScenePause
     */
    createLogo() {
      const text = 'Paused';
      const font = '44px Arial';
      this.logo = this.Objects.create({
        type: 'text',
        text,
        x: this.Canvas.calcCenteredTextX(text, font),
        y: 64 + this.Canvas.padding,
        font,
      });
    }

    /**
     * Creates the menu
     *
     * @memberof ScenePause
     */
    createMenu() {
      this.menu = this.Objects.create({
        type: 'menu',
        options: [
          {
            text: 'Resume',
            callback: () => {
              this.game.changeCurrentScene('game');
            },
          },
          {
            text: 'Quit To Menu',
            callback: () => {
              this.game.changeCurrentScene('mainMenu');
            },
          },
        ]
      });
    }

    /**
     * Loads the objects to the scene for drawing
     *
     * @memberof ScenePause
     */
    prepareScene() {
      // draw the background
      this.Canvas.drawGradientBackground();

      // push the logo to the scene
      this.pushToScene(this.logo);

      // push the menu to the scene
      this.pushToScene(this.menu);
    }

    /**
     * Handle input for the scene
     *
     * @param {array} activeKeys
     * @returns {void}
     * @memberof ScenePause
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
        this.menu.incrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle up
      if (activeKeys.indexOf(38) > -1) {
        // decrement the focused object
        this.menu.decrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle enter
      if (activeKeys.indexOf(13) > -1) {
        // do the menu item callback
        this.menu.focusMenuObject.callback();
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

  var Scenes = {
    SceneMainMenu,
    SceneGame,
    ScenePause,
  };

  class KeyboardController {
    constructor() {
      this.disabled = false;
      this.activeKeys = [];
      
      document.addEventListener('keydown', (e) => {
        if (this.disabled) {
          return;
        }

        if (this.activeKeys.indexOf(e.keyCode) === -1) {
          this.activeKeys.push(e.keyCode);
        }
      });

      document.addEventListener('keyup', (e) => {
        if (this.disabled) {
          return;
        }

        const index = this.activeKeys.indexOf(e.keyCode);
        this.activeKeys.splice(index, 1);
      });
    }

    /**
     * Clear all active keys
     *
     * @memberof KeyboardController
     */
    clear() {
      this.activeKeys = [];
    }

    /**
     * Disable use of the keyboard
     *
     * @param {boolean} [disabled=true]
     * @memberof KeyboardController
     */
    setDisabled(disabled = true) {
      this.disabled = disabled;
    }
  }

  function game() {
    // view state
    this.currentScene = 'mainMenu';

    // debug stuff
    this.debug = true;
    this.frameCount = 0;

    // input handler
    this.Keyboard = new KeyboardController();

    // create the canvas
    this.Canvas = new Canvas();

    // the object factory
    this.Objects = new Objects(this);

    // define the scenes
    this.scenes = {
      mainMenu: new Scenes.SceneMainMenu(this),
      game: new Scenes.SceneGame(this),
      pause: new Scenes.ScenePause(this),
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
      this.Canvas.clear();

      // draw the current scene
      this.scenes[this.currentScene].draw();

      // handle keyboard input for the current scene
      this.scenes[this.currentScene].handleInput(this.Keyboard.activeKeys);

      // maybe show debug info
      if (this.debug) {
        const debugText = `
        Active Keys: [${this.Keyboard.activeKeys}]
        Total frames: ${this.frameCount}
      `;
        this.frameCount++;
        this.Canvas.drawDebugText(debugText);
      }
    };

    /** 
     * A method for changing the current scene
     */
    this.changeCurrentScene = (sceneName) => {
      this.currentScene = sceneName;
      this.scenes[this.currentScene].transitionIn();
    };

    // kick the tires and light the fires
    this.loop();
  }

  return game;

})));
