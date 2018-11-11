import Canvas from './Canvas';

function game() {
  // view state
  this.screen = 'menu';

  // debug stuff
  this.debug = true;
  this.frameCount = 0;

  // create the canvas
  this.canvas = new this.Canvas();
  
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

    // draw a different scene depending on the screen
    switch (this.screen) {
      case 'menu':
        this.canvas.drawMainMenu();
        break;
    }

    // maybe show debug info
    if (this.debug) {
      this.frameCount++;
      this.canvas.drawDebugText(`Total frames: ${this.frameCount}`);
    }
  }

  // kick the tires and light the fires
  this.loop();
};

Object.assign(game.prototype, {
  Canvas,
});

export default game;
