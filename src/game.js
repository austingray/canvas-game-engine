import Canvas from './Canvas/Canvas';
import Objects from './Objects/index';
import Scenes from './Scenes/index';
import Keyboard from './Inputs/Keyboard';

function game() {
  // view state
  this.currentScene = 'mainMenu';

  // debug stuff
  this.debug = true;
  this.timestamp = 0;
  this.fps = 0;

  // input handler
  this.Keyboard = new Keyboard();

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
  }

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
      const delta = (timestamp - this.timestamp) / 1000;
      this.timestamp = timestamp;
      this.Canvas.pushDebugText('fps', `FPS: ${1 / delta}`);
      this.Canvas.drawDebugText();
    }
  }

  /** 
   * A method for changing the current scene
   */
  this.changeCurrentScene = (sceneName) => {
    this.currentScene = sceneName;
    this.scenes[this.currentScene].transitionIn();
  }

  // kick the tires and light the fires
  this.loop();
};

export default game;
