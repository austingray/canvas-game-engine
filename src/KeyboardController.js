class KeyboardController {
  constructor() {
    this.disabled = false;
    this.activeKeys = [];
    
    document.addEventListener('keydown', (e) => {
      if (this.disabled) {
        return;
      }

      if (this.activeKeys.indexOf(e.keyCode) === -1) {
        this.activeKeys.push(e.keyCode);
      }
    });

    document.addEventListener('keyup', (e) => {
      if (this.disabled) {
        return;
      }

      const index = this.activeKeys.indexOf(e.keyCode);
      this.activeKeys.splice(index, 1);
    });
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
