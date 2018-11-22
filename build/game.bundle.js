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
    constructor(args = {}, Camera) {
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

      const that = this;

      // camera
      this.Camera = {
        x: this.width / 2,
        y: this.height / 2,
        offsetX: 0,
        offsetY: 0,
        screenPushX: 0,
        screenPushY: 0,
        setFocus(object) {
          // if we're at the right edge of the viewport
          if (
            this.x > (that.width * .7) - this.offsetX
            && object.x >= this.x
          ) {
            this.screenPushX = that.width * .7;
            this.offsetX = this.screenPushX - this.x;
          }

          // left edge
          if (
            this.x < (that.width * .3) - this.offsetX
            && object.x <= this.x
          ) {
            this.screenPushX = that.width * .3;
            this.offsetX = this.screenPushX - this.x;
          }

          // top edge
          if (
            this.y < (that.height * .3) - this.offsetY
            && object.y <= this.y
          ) {
            this.screenPushY = that.height * .3;
            this.offsetY = this.screenPushY - this.y;
          }

          // bottom edge
          if (
            this.y > (that.height * .7) - this.offsetY
            && object.y >= this.y
          ) {
            this.screenPushY = that.height * .7;
            this.offsetY = this.screenPushY - this.y;
          }

          // update this
          this.x = object.x;
          this.y = object.y;
        },
        inViewport(x1, y1, x2, y2) {
          const vpX1 = this.x - that.width;
          const vpX2 = this.x + that.width;
          const vpY1 = this.y - that.height;
          const vpY2 = this.y + that.height;

          // if in viewport
          if (
            x2 > vpX1
            && x1 < vpX2
            && y2 > vpY1
            && y1 < vpY2
          ) {
            return true;
          }

          // if not in viewport
          return false;
        }
      };
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
    constructor(args, game) {    
      // access to the game object
      this.game = game;

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
      Canvas.drawCircle({
        fillStyle: this.fillStyle,
        x: this.x,
        y: this.y,
        radius: this.radius,
        startAngle: this.startAngle,
        endAngle: this.endAngle,
        anticlockwise: this.anticlockwise,
      });
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
      this.maxSpeed = 100; 
      this.rateOfIncrease = 1 + this.maxSpeed / 100;

      // set target x,y for easing the character movement
      this.targetX = this.x;
      this.targetY = this.y;
      this.targetXTimer;
      this.targetYTimer;

      // cooldown beteween movement
      this.inputCooldown = 30;
    }

    /**
     * Handles easing on the X axis
     *
     * @param {*} dir
     * @param {*} map
     * @memberof Hero
     */
    targetXTimerHandler(dir, map) {
      // clear the existing timer
      clearTimeout(this.targetXTimer);

      // get the difference between the current y and the target y
      const difference = Math.abs(this.x - this.targetX);

      // set a new timer
      this.targetXTimer = setTimeout(() => {
        // calculate what the new x should be
        const newX = dir === 'left'
          ? this.x - (difference / this.inputCooldown)
          : this.x + (difference / this.inputCooldown);

        // handle collision
        const collision = map.getCollision(newX, this.y, dir);

        if (collision) {
          this.targetX = this.x;
        } else {
          this.x = newX;
        }

        // calculate
        this.game.Canvas.Camera.setFocus({
          x: this.x,
          y: this.y,
        });

        // if we're not close enough to the target Y, keep moving
        if (difference > 1) {
          this.targetXTimerHandler(dir, map);
        }
      }, difference / this.inputCooldown);
    }

    /**
     * Handles easing on the Y axis
     *
     * @param {*} dir
     * @param {*} map
     * @memberof Hero
     */
    targetYTimerHandler(dir, map) {
      // clear the existing timer
      clearTimeout(this.targetYTimer);

      // get the difference between the current y and the target y
      const difference = Math.abs(this.y - this.targetY);

      // set a new timer
      this.targetYTimer = setTimeout(() => {
        // handle direction
        const newY = dir === 'up'
          ? this.y - (difference / this.inputCooldown)
          : this.y + (difference / this.inputCooldown);

        // handle collision
        const collision = map.getCollision(this.x, newY, dir);

        if (collision) {
          this.targetY = this.y;
        } else {
          // update the y
          this.y = newY;
        }

        // calculate
        this.game.Canvas.Camera.setFocus({
          x: this.x,
          y: this.y,
        });

        // if we're not close enough to the target Y, keep moving
        if (difference > 1) {
          this.targetYTimerHandler(dir, map);
        }
      }, difference / this.inputCooldown);
    }

    /**
     * Handle input for the hero
     *
     * @param {*} activeKeys
     * @param {*} map
     * @returns
     * @memberof Hero
     */
    handleInput(activeKeys, map) {
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
        this.targetYTimerHandler('up', map);
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
        this.targetXTimerHandler('right', map);
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
        this.targetYTimerHandler('down', map);    
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
        this.targetXTimerHandler('left', map);
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

  class MapTile {
    constructor(args) {
      this.x = args.x;
      this.y = args.y;
      this.width = args.width;
      this.height = args.height;

      // border
      this.lineWidth = '1';

      // randomize the tiles for now
      const random = Math.random() * 10;
      if (random < .5) {
        this.type = 'rock';
        this.blocking = true;
      } else {
        this.type = 'grass';
        this.blocking = false;
      }
    }
  }

  class Map {
    constructor(args, game) {
      this.tiles = [];

      // used for offsetting the map to follow the hero
      this.x = this.y = 0;

      // map width and height in tiles
      this.width = 50;
      this.height = 50;

      // single tile width and height in pixels
      this.tileWidth = 50;
      this.tileHeight = 50;

      // get the width and height of the map in total pixels
      this.pixelWidth = this.width * this.tileWidth;
      this.pixelHeight = this.height * this.tileHeight;

      // crude tile creation
      for (let i = 0; i < this.width; i++) {
        for (let j = 0; j < this.height; j++) {
          this.tiles.push(new MapTile({
            x: i * this.tileWidth,
            y: j * this.tileHeight,
            width: this.tileWidth,
            height: this.tileHeight,
          }));
        }
      }

      // draw the map and convert to base64
      // this.tiles.forEach(tile => game.Canvas.drawTile(tile));
      // this.base64encoded = game.Canvas.element.toDataURL();
      // this.image = new Image();
      // this.image.src = this.base64encoded;
    }

    // draw each tile
    draw(Canvas) {
      // Canvas.drawMap(this.image);
      this.tiles.forEach(tile => Canvas.drawTile(tile));
    }

    /**
     * Check if a coordinate is a collision and return the collision boundaries
     *
     * @param {*} x
     * @param {*} y
     * @returns
     * @memberof Map
     */
    getCollision(x, y, dir) {
      

      // hardcode the hero
      const heroRadius = 20;
      const x1 = x - heroRadius;
      const x2 = x + heroRadius;
      const y1 = y - heroRadius;
      const y2 = y + heroRadius;
      
      // map boundaries
      if (
        x1 < 0
        || y1 < 0
        || x2 > this.pixelWidth
        || y2 > this.pixelHeight
      ) {
        return true;
      }

      // tile blocking
      for (let i = 0; i < this.tiles.length; i++) {
        let tile = this.tiles[i];
        if (tile.blocking) {
          if (
            x2 > tile.x
            && x1 < tile.x + tile.width
            && y2 > tile.y
            && y1 < tile.y + tile.height
          ) {
            return true;
          }
        }
      }

      // let 'em pass
      return false;
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
          return new Hero(object, this.game);
          break;
        
        case 'map':
          return new Map(object, this.game);
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
      this.createMap();
      this.createHero();
    }

    createMap() {
      this.map = this.Objects.create({
        type: 'map',
      });
    }

    createHero() {
      this.hero = this.Objects.create({
        type: 'hero',
        x: 25,
        y: 25,
        radius: 25,
        fillStyle: '#800080',
      });

      // set focus to hero
      this.Canvas.Camera.x = this.hero.x;
      this.Canvas.Camera.y = this.hero.y;
      this.Canvas.Camera.setFocus(this.hero);
    }

    prepareScene() {
      this.pushToScene(this.map);
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

      this.hero.handleInput(activeKeys, this.map);
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

    // introducing the idea of a Camera
    // TODO: move to standalone class file or roll into Canvas

    // create the canvas
    this.Canvas = new Canvas({}, this.Camera);

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
