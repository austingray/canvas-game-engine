class ObjectMenu {
  /**
   * Creates an instance of ObjectMenu.
   * @param {*} args
   * @memberof ObjectMenu
   */
  constructor(args, game) {
    // default to having focus
    this.hasFocus = true;
    
    // reference to the game object
    this.game = game;

    // calculate the menu starting x position.
    this.startX = this.game.Canvas.calcCenteredTextBoxX(args.options.map(option => option.text));

    // create the option objects
    this.createOptionObjects(args.options);

    // set the focus menu object to the first one.
    this.focusMenuObject = this.options[0];

    // create the arrow
    this.createArrow(args);
  }

  /**
   * Sets focus on the menu.
   * this.hasFocus means Arrow keys will change the selected menu item.
   * @param {boolean} [hasFocus=true]
   * @memberof ObjectMenu
   */
  setFocus(hasFocus = true) {
    this.hasFocus = hasFocus;
  }

  /**
   * Creates the menu item option Objects
   * @param {*} options
   * @memberof ObjectMenu
   */
  createOptionObjects(options) {
    this.options = options.map((option, i) => this.game.Objects.create({
      ...option,
      type: 'textInteractive',
      x: this.startX,
      y: (this.game.Canvas.height / 2) - 55 + (i * 55),
    }));
  }

  /**
   * Creates the arrow indicating which object is selected
   * @memberof ObjectMenu
   */
  createArrow() {
    // the arrow
    const text = ')';
    const font = '44px Arial';
    
    // get the width to offset from the menu items
    const width = this.game.Canvas.calcTextWidth(text, font);

    // get the current focus object
    // const focusMenuObject = this.getFocusMenuObject();
    
    // create the object
    this.arrow = this.game.Objects.create({
      type: 'text',
      text,
      font,
      x: this.startX - width - 12,
      y: this.focusMenuObject.y,
    });
  }

  /**
   * Gets the array index of the focused menu option by its id
   *
   * @param {*} id
   * @returns
   * @memberof ObjectMenu
   */
  getFocusMenuObjectIndexById(id) {
    return this.options.map(option => option.id).indexOf(id);
  }

  /**
   * Increments the current focused menu item
   *
   * @memberof SceneMainMenu
   */
  incrementFocusMenuObject() {
    // get the focused menu object's index in the option array
    const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

    // increment it or start back at the beginning
    this.focusMenuObject = index === (this.options.length - 1)
      ? this.options[0]
      : this.options[index + 1];
        
    // update the arrow position
    this.arrow.y = this.focusMenuObject.y;
  }

  /**
   * Decrements the current focused menu item
   *
   * @memberof SceneMainMenu
   */
  decrementFocusMenuObject() {
    // get the focused menu object's index in the option array
    const index = this.getFocusMenuObjectIndexById(this.focusMenuObject.id);

    // increment it or start back at the beginning
    this.focusMenuObject = index === 0
      ? this.options[this.options.length - 1]
      : this.options[index - 1];
        
    // update the arrow position
    this.arrow.y = this.focusMenuObject.y;
  }

  /**
   * Draws the menu
   *
   * @memberof ObjectMenu
   */
  draw() {
    this.options.forEach(option => option.draw(this.game.Canvas));

    if (this.hasFocus) {
      this.arrow.draw(this.game.Canvas);
    }
  }
}

export default ObjectMenu;
