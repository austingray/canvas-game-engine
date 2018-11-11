import Canvas from './Canvas';
import SceneMainMenu from './SceneMainMenu';
import KeyboardController from './KeyboardController';

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
    this.canvas.clear();

    // draw the current scene
    this.scenes[this.currentScene].draw();

    // handle keyboard input for the current scene
    this.scenes[this.currentScene].handleInput(this.keyboard.activeKeys);

    // maybe show debug info
    if (this.debug) {
      this.frameCount++;
      this.canvas.drawDebugText(`Total frames: ${this.frameCount}`);
    }
  }

  // kick the tires and light the fires
  this.loop();
};

export default game;
