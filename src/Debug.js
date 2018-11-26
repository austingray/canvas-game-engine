class Debug {
  /**
   * Creates an instance of Debug.
   * @param {*} Canvas A canvas context to render information on
   * @memberof Debug
   */
  constructor(game) {
    this.game = game;
    this.Canvas = game.Canvas;

    this.canHandleInput = true;
    this.inputThrottleTimer = null;

    this.canToggleLayers = true;
  }

  drawDebugText() {
    // todo
  }

  handleInput() {
    // throttle the input a wee bit
    if (!this.canHandleInput) {
      return;
    }

    // get shorter references to game objects
    const Keyboard = this.game.Keyboard;
    const Canvas = this.game.Canvas;

    // can toggle layers
    if (this.canToggleLayers) {
      for (let i = 0; i < Keyboard.numbers.length; i++) {
        if (
          Keyboard.numbers[i]
          && typeof Canvas.layers[i] !== 'undefined'
        ) {
          Canvas.layers[i].toggleVisible();
          this.doInputCooldown();
        }
      }
    }
  }

  /**
   * Sets timeout to re-enable input handling
   *
   * @memberof Debug
   */
  doInputCooldown() {
    this.canHandleInput = false;

    window.clearTimeout(this.inputThrottleTimer);
    this.inputThrottleTimer = window.setTimeout(() => {
      this.canHandleInput = true;
    }, 150);
  }
}

export default Debug;
