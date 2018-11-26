import Canvas from './Canvas/Canvas';
import Objects from './Objects/index';
import Scenes from './Scenes/index';
import Keyboard from './Inputs/Keyboard';
import Debug from './Debug';

function game() {
  // debug stuff
  this.debug = true;
  this.timestamp = 0;
  this.fps = 0;

  // debug handler
  this.Debug = new Debug(this);

  // input handler
  this.Keyboard = new Keyboard();

  // create the canvas
  this.Canvas = new Canvas();

  // the object factory
  this.Objects = new Objects(this);

  // define the scenes
  this.scenes = {
    mainMenu: Scenes.SceneMainMenu,
    game: Scenes.SceneGame,
    pause: Scenes.ScenePause,
  };

  /** 
   * A method for setting the current scene
   */
  this.setScene = (sceneName) => {
    this.scene = new this.scenes[sceneName](this);
    this.scene.transitionIn();
  }

  /**
   * Calls request animation frame and the update function
   */
  this.loop = (timestamp) => {
    window.requestAnimationFrame( this.loop );
    this.update(timestamp);
  }

  /**
   * Gets called once per frame
   * This is where the logic goes
   */
  this.update = (timestamp) => {
    // clear the previous frame
    this.scene.clear();

    if (this.debug) {
      this.Canvas.debugLayer.clear();
    }

    // draw the current frame
    this.scene.draw();

    // handle keyboard input
    if (this.Keyboard.activeKeyCodes.length > 0) {
      this.scene.handleInput(this.Keyboard);

      if (this.debug) {
        this.Debug.handleInput();
      }
    }

    // maybe show debug info
    if (this.debug) {
      const delta = (timestamp - this.timestamp) / 1000;
      this.timestamp = timestamp;
      this.Canvas.pushDebugText('fps', `FPS: ${1 / delta}`);
      this.Canvas.pushDebugText('activeKeys', `Keyboard.activeKeyCodes: [${this.Keyboard.activeKeyCodes.toString()}]`);
      this.Canvas.drawDebugText();
    }
  }

  
  this.init = () => {
    // set the current scene to the main menu
    this.setScene('mainMenu');

    // start the game loop
    this.loop();
  }

  // kick the tires and light the fires!!!
  this.init();
};

export default game;
