class KeyboardController {
  /**
   * Creates an instance of KeyboardController.
   * @memberof KeyboardController
   */
  constructor() {
    // if disabled, keyboard input will not register
    this.disabled = false;

    // raw keycodes
    this.keyCodes = {
      13: 'enter',
      16: 'shift',
      27: 'escape',
      32: 'space',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      65: 'a',
      68: 'd',
      83: 's',
      87: 'w',
      187: 'equals',
      189: 'minus',
    };

    // reference for keys that use shift
    // formatted as keyWihoutShift: keyWithShift
    this.shiftKeys = {
      equals: 'plus',
    };
    
    // human readable key states
    this.active = {
      enter: false,
      shift: false,
      escape: false,
      up: false,
      right: false,
      down: false,
      left: false,
      w: false,
      a: false,
      s: false,
      d: false,
      equals: false,
      minus: false,
      plus: false,
    };

    // alias keys
    // if these keys are pressed, they should also mark their aliased key as pressed
    this.aliasKeys = {
      w: 'up',
      a: 'left',
      s: 'down',
      d: 'right',
    }

    // provide an array of all directions and whether they are active
    // up, right, down, left
    this.directions = [false, false, false, false];
    
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
      this.eventListener(e, true);
    });
    document.addEventListener('keyup', (e) => {
      this.eventListener(e, false);
    });
  }

  /**
   * The event listener for keydown / keyup
   *
   * @param {*} e
   * @returns
   * @memberof KeyboardController
   */
  eventListener(e, press) {
    // bail if disabled
    if (this.disabled) {
      return;
    }

    // bail if we don't care about the ky
    if (typeof this.keyCodes[e.keyCode] === 'undefined') {
      return;
    }

    // get the human readable value from keycode
    const key = this.keyCodes[e.keyCode];

    // bail if the state isn't changing
    if (this.active[key] === press) {
      return;
    }

    // otherwise update the state
    this.active[key] = press;
    
    // handle key combos
    this.handleKeyCombos(key, press);

    // update active directions array
    this.updateDirectionsArray();
  }

  /**
   * Updates keys that require shift
   * Updates aliased keys
   *
   * @param {string} key human readable key
   * @param {boolean} active whether the key is being pressed
   * @memberof KeyboardController
   */
  handleKeyCombos(key, active) {    
    // check if there is a shift version we are watching
    const shiftedKeyExists = typeof this.shiftKeys[key] !== 'undefined';

    // if there is a shift version
    if (shiftedKeyExists) {
      // get the shifted key value
      const shiftedKey = this.shiftKeys[key];
      
      // if shift is active, and we're pressing the key
      if (this.active.shift && active) {
        this.active[shiftedKey] = true;
      } else {
        // otherwise set it to inactive
        this.active[shiftedKey] = false;
      }
    }

    // wasd handling
    const aliasKeyExists = typeof this.aliasKeys[key] !== 'undefined';

    // if there is an alias version
    if (aliasKeyExists) {
      // get the alias key value
      const aliasKey = this.aliasKeys[key];

      // TODO: Add handling for the actual key that is being aliased is being pressed
      // TODO: For example, if we're pressing the A key and we're pressing the UP key,
      // TODO: If we release one of those keys, it will say we're not moving up!
      this.active[aliasKey] = active;
    }
  }

  updateDirectionsArray() {
    this.directions = [
      (this.active.up) ? true : false,
      (this.active.right) ? true : false,
      (this.active.down) ? true : false,
      (this.active.left) ? true : false,
    ];
  }

  /**
   * Clear all active keys
   *
   * @memberof KeyboardController
   */
  clear() {
    // this.activeKeys = [];
    // TODO: update for our new handling
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
