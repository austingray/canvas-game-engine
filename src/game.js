import Canvas from './Canvas';
import Objects from './Objects/index';
import Scenes from './Scenes/index';
import KeyboardController from './KeyboardController';

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

  // introducing the idea of a Camera
  // TODO: move to standalone class file or roll into Canvas
  this.Camera = {
    x: this.Canvas.width / 2,
    y: this.Canvas.height / 2,
    objectOffsetX: 0,
    objectOffsetY: 0,
  };

  // define the scenes
  this.scenes = {
    mainMenu: new Scenes.SceneMainMenu(this),
    game: new Scenes.SceneGame(this),
    pause: new Scenes.ScenePause(this),
  }

  /**
   * Calls request animation frame and the update function
   */
  this.loop = () => {
    window.requestAnimationFrame( this.loop );
    this.update();
  }

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
