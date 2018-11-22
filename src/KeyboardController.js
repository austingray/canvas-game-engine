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
    } else {
      this.dir.up = false;
    }

    // right
    if (
      this.activeKeys.indexOf(39) > -1 // right
      || this.activeKeys.indexOf(68) > -1 // d
    ) {
      this.dir.right = true;
    } else {
      this.dir.right = false;
    }

    // down
    if (
      this.activeKeys.indexOf(40) > -1 // down
      || this.activeKeys.indexOf(83) > -1 // s
    ) {
      this.dir.down = true;
    } else {
      this.dir.down = false;
    }

    // left
    if (
      this.activeKeys.indexOf(37) > -1 // left
      || this.activeKeys.indexOf(65) > -1 // a
    ) {
      this.dir.left = true;
    } else {
      this.dir.left = false;
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

export default KeyboardController;
