(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.game = factory());
}(this, (function () { 'use strict';

  class Layer {
    /**
     * Creates an instance of Layer.
     * @param {*} id
     * @param {*} [args={}]
     * @memberof Layer
     */
    constructor(id, args = {}) {
      // get width/height
      this.width = args.width;
      this.height = args.height;
      this.name = args.name;

      // create the canvas element and add it to the document body
      const element = document.createElement('canvas');
      element.id = id;
      element.width = this.width;
      element.height = this.height;
      document.body.appendChild(element);

      this.context = element.getContext('2d');
    }

    /**
     * Clears the layer
     *
     * @memberof Layer
     */
    clear() {
      this.context.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Calculates drawing x/y offsets
   *
   * @class Camera
   */
  class Camera {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.x = width / 2;
      this.y = height / 2;
      this.offsetX = 0;
      this.offsetY = 0;
    }

    /**
     * Sets camera focus on an object
     *
     * @param {*} object
     * @memberof Camera
     */
    setFocus(object) {
      // if we're at the right edge of the viewport
      if (
        this.x > (this.width * .7) - this.offsetX
        && object.x >= this.x
      ) {
        this.screenPushX = this.width * .7;
        this.offsetX = this.screenPushX - this.x;
      }

      // left edge
      if (
        this.x < (this.width * .3) - this.offsetX
        && object.x <= this.x
      ) {
        this.screenPushX = this.width * .3;
        this.offsetX = this.screenPushX - this.x;
      }

      // top edge
      if (
        this.y < (this.height * .3) - this.offsetY
        && object.y <= this.y
      ) {
        this.screenPushY = this.height * .3;
        this.offsetY = this.screenPushY - this.y;
      }

      // bottom edge
      if (
        this.y > (this.height * .7) - this.offsetY
        && object.y >= this.y
      ) {
        this.screenPushY = this.height * .7;
        this.offsetY = this.screenPushY - this.y;
      }

      // convert floats to integers
      this.offsetX = Math.round(this.offsetX);
      this.offsetY = Math.round(this.offsetY);

      // update this
      this.x = object.x;
      this.y = object.y;
    }

    /**
     * Checks if a set of coords is inside the camera viewport
     * Note: the viewport is not 1:1 with what is visible, it is larger
     *
     * @param {*} x1
     * @param {*} y1
     * @param {*} x2
     * @param {*} y2
     * @returns
     * @memberof Camera
     */
    inViewport(x1, y1, x2, y2) {
      // calc the viewport
      const vpX1 = this.x - this.width;
      const vpX2 = this.x + this.width;
      const vpY1 = this.y - this.height;
      const vpY2 = this.y + this.height;

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
  }

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

      // if the hero can move in a certain direction
      // [ up, right, down, left ];
      this.canMove = [true, true, true, true];

      // handle character's directional velocity
      this.velocities = [0, 0, 0, 0];
      this.maxSpeed = 22; 
      this.rateOfIncrease = 1 + this.maxSpeed / 100;
      this.rateOfDecrease = 1 + this.maxSpeed;

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
        const newX = dir === 1 // right
          ? this.x + (difference / this.inputCooldown)
          : this.x - (difference / this.inputCooldown); 

        // handle collision
        const collision = map.getCollision(newX, this.y);

        if (collision) {
          this.targetX = this.x;
          // reset velocity on collision
          // this.velocities[1] = 0;
          // this.velocities[3] = 0;
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
        const newY = dir === 0 // up
          ? this.y - (difference / this.inputCooldown)
          : this.y + (difference / this.inputCooldown);

        // handle collision
        const collision = map.getCollision(this.x, newY);

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
    handleInput(Keyboard, map) {
      // bail if input is disabled
      if (!this.allowInput) {
        return;
      }

      // loop through the direction keys
      Keyboard.dirs.forEach((active, i) => {
        // if direction is active
        if (active) {
          this.canMove[i] = false;
          
          // make it faster
          this.velocities[i] = this.velocities[i] >= this.maxSpeed
            ? this.maxSpeed
            : (this.velocities[i] + 1) * this.rateOfIncrease;
          
          // y axis
          if (i === 0 || i === 2) {
            // opposite directions cancel eachother out
            if (!(Keyboard.dir.up && Keyboard.dir.down)) {
              this.targetY = i === 0
                ? this.y - this.velocities[i] // up
                : this.y + this.velocities[i]; // down
              
              this.targetYTimerHandler(i, map);
            } else {
              this.velocities[i] = 0;
            }
          }

          // x axis
          if (i === 1 || i === 3) {
            // opposite directions cancel eachother out
            if (!(Keyboard.dir.left && Keyboard.dir.right)) {
              this.targetX = i === 1
                ? this.x + this.velocities[i] // right
                : this.x - this.velocities[i]; // left
              
              this.targetXTimerHandler(i, map);
            } else {
              this.velocities[i] = 0;
            }
          }
        } else {
          // nuke velocity if not active
          this.velocities[i] = 0;
        }
      });
      
      // set timeout to enable movement in the direction
      clearTimeout(this.keyboardCooldownTimer);
      this.keyboardCooldownTimer = setTimeout(() => {
        this.canMove = [true, true, true, true];
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
      if (random > 9) {
        this.type = 'desert';
        this.blocking = false;
      } else if (random <= 9 && random > .5) {
        this.type = 'grass';
        this.blocking = false;
      } else {
        this.type = 'rock';
        this.blocking = true;
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
    getCollision(x, y) {
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
     *  Clears the previous frame
     *
     * @memberof Scene
     */
    clear() {
      // hello from the other side
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
      // clear all layers
      this.game.Canvas.layers.forEach(layer => layer.clear());

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
    handleInput(Keyboard) {
      // bail if input is disabled
      if (!this.allowInput) {
        return;
      }

      // bail if no key press
      if (Keyboard.activeKeys.length === 0) {
        return;
      }

      // handle up
      if (Keyboard.dir.up) {
        // decrement the focused object
        this.menu.decrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle down
      if (Keyboard.dir.down) {
        // increment the focused object
        this.menu.incrementFocusMenuObject();
        this.allowInput = false;
      }

      // handle enter
      if (Keyboard.activeKeys.indexOf(13) > -1) {
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

    clear() {
      // clear the primary layer
      this.Canvas.layers[1].clear();
    }

    /**
     * Handle input for the scene
     *
     * @param {array} activeKeys
     * @returns {void}
     * @memberof SceneMainMenu
     */
    handleInput(Keyboard) {
      // pause the game
      if (Keyboard.activeKeys.indexOf(27) > -1) {
        this.game.changeCurrentScene('pause');
      }

      this.hero.handleInput(Keyboard, this.map);
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
    /**
     * Creates an instance of KeyboardController.
     * @memberof KeyboardController
     */
    constructor() {
      // if disabled, keyboard input will not register
      this.disabled = false;

      // an array of active key codes
      this.activeKeys = [];

      // provide easy way to see which directions are active
      this.dir = {
        up: false,
        right: false,
        down: false,
        left: false,
      };

      // alternative implementation for checking active directions
      this.dirs = [false, false, false, false];
      
      // add event listeners
      this.addEventListeners();
    }

    /**
     * Adds event listeners for keydown, keyup
     *
     * @memberof KeyboardController
     */
    addEventListeners() {
      document.addEventListener('keydown', (e) => {
        // bail if disabled
        if (this.disabled) {
          return;
        }

        // add the key to active keys
        if (this.activeKeys.indexOf(e.keyCode) === -1) {
          this.activeKeys.push(e.keyCode);
        }

        this.updateReferences();
      });

      document.addEventListener('keyup', (e) => {
        // bail if disabled
        if (this.disabled) {
          return;
        }

        // remove the key from active keys
        const index = this.activeKeys.indexOf(e.keyCode);
        this.activeKeys.splice(index, 1);

        this.updateReferences();
      });
    }

    /**
     * Updates explicit references to active keys, specifically directions
     *
     * @memberof KeyboardController
     */
    updateReferences() {
      // up
      if (
        this.activeKeys.indexOf(38) > -1 // up
        || this.activeKeys.indexOf(87) > -1 // w
      ) {
        this.dir.up = true;
        this.dirs[0] = true;
      } else {
        this.dir.up = false;
        this.dirs[0] = false;
      }

      // right
      if (
        this.activeKeys.indexOf(39) > -1 // right
        || this.activeKeys.indexOf(68) > -1 // d
      ) {
        this.dir.right = true;
        this.dirs[1] = true;
      } else {
        this.dir.right = false;
        this.dirs[1] = false;
      }

      // down
      if (
        this.activeKeys.indexOf(40) > -1 // down
        || this.activeKeys.indexOf(83) > -1 // s
      ) {
        this.dir.down = true;
        this.dirs[2] = true;
      } else {
        this.dir.down = false;
        this.dirs[2] = false;
      }

      // left
      if (
        this.activeKeys.indexOf(37) > -1 // left
        || this.activeKeys.indexOf(65) > -1 // a
      ) {
        this.dir.left = true;
        this.dirs[3] = true;
      } else {
        this.dir.left = false;
        this.dirs[3] = false;
      }
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
      // get the current scene
      const scene = this.scenes[this.currentScene];

      // clear the previous frame
      scene.clear();

      if (this.debug) {
        this.Canvas.debugLayer.clear();
      }

      // draw the current frame
      scene.draw();

      // handle keyboard input
      scene.handleInput(this.Keyboard);

      // maybe show debug info
      if (this.debug) {
        this.frameCount++;
        this.Canvas.pushDebugText('keys', `Active Keys: [${this.Keyboard.activeKeys}]`);
        this.Canvas.pushDebugText('frames', `Total frames: ${this.frameCount}`);
        this.Canvas.drawDebugText();
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
