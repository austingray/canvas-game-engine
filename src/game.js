import Canvas from './Canvas';
import SceneMainMenu from './SceneMainMenu';

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
