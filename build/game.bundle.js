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
      this.visible = (typeof args.visible === 'undefined') ? true : args.visible;

      // create the canvas element and add it to the document body
      const element = document.createElement('canvas');
      element.id = id;
      element.width = this.width;
      element.height = this.height;
      document.body.appendChild(element);

      if (!this.visible) {
        element.setAttribute('style', 'display: none;');
      }

      // get the context
      this.context = element.getContext(args.context);
    }

    /**
     * Clears the layer
     *
     * @memberof Layer
     */
    clear() {
      if (typeof this.context.clearRect !== 'undefined') {
        this.context.clearRect(0, 0, this.width, this.height);
      }
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
        this.x > (this.width * .6) - this.offsetX
        && object.x >= this.x
      ) {
        this.screenPushX = this.width * .6;
        this.offsetX = this.screenPushX - this.x;
      }

      // left edge
      if (
        this.x < (this.width * .4) - this.offsetX
        && object.x <= this.x
      ) {
        this.screenPushX = this.width * .4;
        this.offsetX = this.screenPushX - this.x;
      }

      // top edge
      if (
        this.y < (this.height * .4) - this.offsetY
        && object.y <= this.y
      ) {
        this.screenPushY = this.height * .4;
        this.offsetY = this.screenPushY - this.y;
      }

      // bottom edge
      if (
        this.y > (this.height * .6) - this.offsetY
        && object.y >= this.y
      ) {
        this.screenPushY = this.height * .6;
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
      const x = tile.x + this.Camera.offsetX;
      const y = tile.y + this.Camera.offsetY;

      this.ctx = this.primaryLayer.context;
      switch (tile.type) {
        case 'rock':
          this.ctx = this.overrideLayer.context;
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
      this.maxSpeed = 18; 
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

        map.updateVisibleTiles(this.x, this.y);
        map.drawShadows();

        // if we're not close enough to the target Y, keep moving
        if (difference >= 1) {
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

        map.updateVisibleTiles(this.x, this.y);
        map.drawShadows();

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
      this.type = args.type;
      this.x = args.x;
      this.y = args.y;
      this.width = args.width;
      this.height = args.height;
      this.blocking = args.blocking;
      this.shadow = args.shadow;
      this.light = args.light;
      this.objects = [];
    }

    draw(Canvas) {
      Canvas.drawTile(this);
    }
  }

  class Shadows {
    constructor(Canvas, origin, objects) {
      this.Canvas = Canvas;

      // where the light will emit from
      this.origin = {
        x: origin.x,
        y: origin.y,
      };


      // get all blocking objects
      this.blocks = [];
      this.lights = [];
      objects.forEach(object => {
        const obj = {
          x1: object.x,
          y1: object.y,
          x2: object.x + object.width,
          y2: object.y + object.height,
          width: object.width,
          height: object.height,
        };

        if (object.shadow === true) {
          this.blocks.push(obj);
        }

        if (object.light === true) {
          this.lights.push(obj);
        }
      });

      this.ctx = this.Canvas.shadowLayer.context;
    }

    draw() {
      this.Canvas.shadowLayer.clear();

      // get the camera offset
      const offsetX = this.Canvas.Camera.offsetX;
      const offsetY = this.Canvas.Camera.offsetY;

      this.ctx.globalCompositeOperation = 'source-over';

      // gradient 1
      const grd = this.ctx.createRadialGradient(
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        0,
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        360
      );
      
      grd.addColorStop(0, 'rgba(0, 0, 0, .1)');
      grd.addColorStop(0.9, 'rgba(0, 0, 0, .5');
      this.ctx.fillStyle = grd;
      this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

      // gradient 2
      this.ctx.globalCompositeOperation = 'source-over';
      const grd2 = this.ctx.createRadialGradient(
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        0,
        this.origin.x + offsetX,
        this.origin.y + offsetY,
        360
      );
      grd2.addColorStop(0, 'rgba(0, 0, 0, .1)');
      grd2.addColorStop(0.9, 'rgba(0, 0, 0, 1');
      this.ctx.fillStyle = grd2;
      this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

      // lights
      this.ctx.globalCompositeOperation = 'destination-out';
      this.lights.forEach(light => {
        const gradient = this.ctx.createRadialGradient(
          light.x1 + offsetX + light.width / 2,
          light.y1 + offsetY + light.height / 2,
          0,
          light.x1 + offsetX + light.width / 2,
          light.y1 + offsetY + light.height / 2,
          100
        );
        gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.random() + .7})`);
        gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(
          light.x1 + offsetX - 100 + light.width / 2,
          light.y1 + offsetY - 100 + light.height / 2,
          200,
          200
        );
      });

      // object shadows
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.strokeStyle = 'red';
      this.ctx.lineWidth = '1px';
      this.blocks.forEach(pos => {
        // get all 4 corners
        const points = [
          { x: pos.x1, y: pos.y1 },
          { x: pos.x2, y: pos.y1 },
          { x: pos.x1, y: pos.y2 },
          { x: pos.x2, y: pos.y2 },
        ];

        // calculate the angle of each line
        const raw = points.map(point => Object.assign({}, point, {
          angle: Math.atan2(point.y - this.origin.y, point.x - this.origin.x) * 180 / Math.PI,
          distance: this.calculateDistance({x: point.x, y: point.y}, {x: this.origin.x, y: this.origin.y}),
        }));

        const angles = raw.slice(0).sort((a, b) => {
          // sort by angle
          if (b.angle > a.angle) {
            return 1;
          }

          if (b.angle < a.angle) {
            return -1;
          }

          return 0;
        });

        const furthest = raw.slice(0).sort((a, b) => {
          // sort by angle
          if (b.distance > a.distance) {
            return 1;
          }

          if (b.distance < a.distance) {
            return -1;
          }

          return 0;
        });
        
        // distance, lowest to highest
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.beginPath();
        if (
          this.origin.x > pos.x2
          && this.origin.y > pos.y1
          && this.origin.y < pos.y2
        ) {
          let min = this.findNewPoint(angles[2].angle, 1000);
          let max = this.findNewPoint(angles[1].angle, 1000);
          this.ctx.moveTo(angles[1].x + offsetX, angles[1].y + offsetY);
          this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
          this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
          this.ctx.lineTo(angles[2].x + offsetX, angles[2].y + offsetY);
          if (this.origin.y > pos.y1 + pos.width / 2) {
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
          } else {
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          }
          this.ctx.lineTo(angles[1].x + offsetX, angles[1].y + offsetY);
        } else {
          if (
            this.origin.y > pos.y1
            && this.origin.y < pos.y2
          ) {
            // handle being left of the object
            const max = this.findNewPoint(angles[0].angle, 1000);
            const min = this.findNewPoint(angles[3].angle, 1000);
            this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
            this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
            this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
            this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
            if (this.origin.y > pos.y1 + pos.width / 2) {
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            } else {
              this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            }
            this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
          } else if ( // above/beneath object
            this.origin.x > pos.x1
            && this.origin.x < pos.x2
          ) {
            // below the object
            if (this.origin.y > pos.y1) {
              // below the object
              const max = this.findNewPoint(angles[0].angle, 1000);
              const min = this.findNewPoint(angles[3].angle, 1000);
              this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
              this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
              this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
              this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
              if (this.origin.x > pos.x1 + pos.width / 2) {
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              } else {
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              }
              this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
            } else { // above the object
              // below the object
              const max = this.findNewPoint(angles[0].angle, 1000);
              const min = this.findNewPoint(angles[3].angle, 1000);
              this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
              this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
              this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
              this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
              if (this.origin.x > pos.x1 + pos.width / 2) {
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
              } else {
                this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
                this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
              }
              this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
            }
          } else { // northwest of object
            const max = this.findNewPoint(angles[0].angle, 1000);
            const min = this.findNewPoint(angles[3].angle, 1000);
            this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
            this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
            this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
            this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
          }
        }
        this.ctx.closePath();
        this.ctx.fill();
      });
    }

    findNewPoint(angle, distance) {
      var result = {};

      const x = this.origin.x;
      const y = this.origin.y;

      result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
      result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);

      return result;
    }

    /**
     * Pythagorean theorem
     * AKA calculate the distance between two points
     *
     * @param {*} pos1
     * @param {*} pos2
     * @returns
     * @memberof Shadows
     */
    calculateDistance(pos1, pos2) {
      const a = pos1.x - pos2.x;
      const b = pos1.y - pos2.y;

      // return the distance
      return Math.sqrt(a * a + b * b);
    }
  }

  class Map {
    constructor(args, game) {
      this.game = game;

      // tiles that will be seen on this map
      this.tileTypes = [
        {
          id: 1,
          type: 'grass',
          blocking: false,
          shadow: false,
          light: false,
        },
        {
          id: 2,
          type: 'water',
          blocking: true,
          shadow: false,
          light: false,
        },
        {
          id: 3,
          type: 'rock',
          blocking: true,
          shadow: true,
          light: false,
        },
      ];

      // objects that will be seen on this map
      this.objects = [
        {
          id: 1,
          type: 'tree',
          blocking: true,
          shadow: false,
          light: false,
          width: 25,
          height: 25,
        },
        {
          id: 2,
          type: 'torch',
          blocking: false,
          shadow: false,
          light: true,
          width: 10,
          height: 10,
        },
      ];

      // the object array
      this.objectArray = [];

      // the tile array
      this.tileArray = [];

      // map width and height in tiles
      this.xTotalTiles = 500;
      this.yTotalTiles = 500;

      // single tile width and height in pixels
      this.tileWidth = 50;
      this.tileHeight = 50;

      // get the width and height of the map in total pixels
      this.pixelWidth = this.xTotalTiles * this.tileWidth;
      this.pixelHeight = this.yTotalTiles * this.tileHeight;

      this.generateMap();

      // keep track of visible tiles
      this.visibleTilesPerDirection = 8;
      this.visibleTilePos = { x: null, y: null };
      this.visibleTileArray = [];
      this.updateVisibleTiles(0, 0);

      // draw the map and convert to base64
      // this.tileArray.forEach(tile => game.Canvas.drawTile(tile));
      // this.base64encoded = game.Canvas.element.toDataURL();
      // this.image = new Image();
      // this.image.src = this.base64encoded;
    }

    // generates a random map
    generateMap() {
      // generate the tiles and objects
      for (let i = 0; i < this.xTotalTiles; i++) {
        const row = [];
        for (let j = 0; j < this.yTotalTiles; j++) {
          let random = Math.random();
          let tileIndex = 0;
          if (random > .1) {
            // grass
            tileIndex = 0;
          } else if (random > .08) {
            // water
            tileIndex = 1;
          } else {
            // rock
            tileIndex = 2;
          }
          const tile = new MapTile(Object.assign({}, this.tileTypes[tileIndex], {
            x: i * this.tileWidth,
            y: j * this.tileHeight,
            width: this.tileWidth,
            height: this.tileHeight,
          }));

          // generate objects
          random = Math.random();
          if (!tile.blocking && random < .05) {
            const x = tile.x; // + random * tile.width;
            const y = tile.y; // + random * tile.height;
            let objectIndex = random > .3 ? 0 : 1;
            const object = new MapTile(Object.assign({}, this.objects[objectIndex], { x, y }));
            tile.objects.push(object);
          }

          row.push(tile);
        }
        this.tileArray.push(row);
      }
    }

    // draw each tile
    draw(Canvas) {
      this.visibleTileArray.flat().forEach(tile => tile.draw(this.game.Canvas));
    }

    drawShadows() {
      const scene = this.game.scenes[this.game.currentScene];
      const origin = { x: scene.hero.x, y: scene.hero.y };
      const shadows = new Shadows(this.game.Canvas, origin, this.visibleTileArray.flat());
      shadows.draw();
    }

    /**
     * Updates the visible tile array based off x, y coords
     *
     * @param {*} x
     * @param {*} y
     * @memberof Map
     */
    updateVisibleTiles(x, y) {
      this.needsUpdate = true;
      // TODO: Look into capturing this x,y and setting it as a focus point to be used when drawing shadows??
      // get the pixel to tile number
      const tileX = Math.round(x / this.tileWidth);
      const tileY = Math.round(y / this.tileHeight);

      // don't update if we haven't changed tiles
      if (
        this.visibleTilePos.x === tileX
        && this.visibleTilePos.y === tileY
      ) {
        return;
      }

      // update to the new tile positions
      this.visibleTilePos = {
        x: tileX,
        y: tileY,
      };

      // get a local array
      let x1 = tileX - this.visibleTilesPerDirection;
      let x2 = tileX + this.visibleTilesPerDirection;
      let y1 = tileY - this.visibleTilesPerDirection;
      let y2 = tileY + this.visibleTilesPerDirection;

      // clamp
      if (x1 < 1) {
        x1 = 0;
      }
      if (x2 > this.xTotalTiles) {
        x2 = this.xTotalTiles;
      }
      if (y1 < 1) {
        y1 = 0;
      }
      if (y2 > this.yTotalTiles) {
        y2 = this.yTotalTiles;
      }

      // create visible tile array
      this.visibleTileArray = [];
      for (let i = y1; i < y2; i++) {
        let row = [];
        for (let j = x1; j < x2; j++) {
          const tile = this.tileArray[j][i];
          row.push(tile);
        }
        this.visibleTileArray.push(row);
      }
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
      for (let i = 0; i < this.visibleTileArray.length; i++) {
        const row = this.visibleTileArray[i];
        for (let j = 0; j < row.length; j++) {
          let tile = row[j];
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
      this.game.Canvas.layers.forEach(layer => {
        layer.clear();
      });

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
      // this.Canvas.ctx.fillStyle = 'black';
      // this.Canvas.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);
      if (this.map.needsUpdate) {
        this.map.needsUpdate = false;
        this.map.visibleTileArray.flat().forEach(tile => this.pushToScene(tile));
      }
      this.pushToScene(this.hero);
    }

    clear() {
      // clear the primary layer
      if (this.map.needsUpdate) {
        this.Canvas.primaryLayer.clear();
        this.Canvas.secondaryLayer.clear();
        this.Canvas.overrideLayer.clear();
      }
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
    this.timestamp = 0;
    this.fps = 0;

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
    this.loop = (timestamp) => {
      window.requestAnimationFrame( this.loop );
      this.update(timestamp);
    };

    /**
     * Gets called once per frame
     * This is where the logic goes
     */
    this.update = (timestamp) => {
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
        const delta = (timestamp - this.timestamp) / 1000;
        this.timestamp = timestamp;
        this.Canvas.pushDebugText('keys', `Active Keys: [${this.Keyboard.activeKeys}]`);
        this.Canvas.pushDebugText('fps', `FPS: ${1 / delta}`);
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
