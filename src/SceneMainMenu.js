import Scene from './Scene';
import CanvasTextObject from './CanvasTextObject';
import CanvasTextObjectInteractive from './CanvasTextObjectInteractive';

/**
 * The Main Menu scene
 *
 * @class SceneMainMenu
 * @extends {Scene}
 */
class SceneMainMenu extends Scene {
  /**
   * Constructor
   *
   * @memberof SceneMainMenu
   */
  init() {
    // create the logo object
    this.createLogo();

    // create the menu objects
    this.createMenuObjects();

    // create the menu selector arrow
    this.createArrow();

    // keyboard input stuff
    this.allowInput = true;
    this.keyboardCooldown = 150;
    this.keyboardCooldownTimer;
  }

  /**
   * Creates the logo object
   *
   * @memberof SceneMainMenu
   */
  createLogo() {
    const text = 'Canvas Game Engine';
    const font = '44px Arial';
    this.logo = new CanvasTextObject({
      text,
      x: this.canvas.calcCenteredTextX(text, font),
      y: 64 + this.canvas.padding,
      font,
    });
  }

  /**
   * Creates the menu item objects
   *
   * @memberof SceneMainMenu
   */
  createMenuObjects() {
    // the menu text
    const menuText = [
      'New Game',
      'Continue',
      'Options',
    ];

    // the x position
    const menuTextX = this.canvas.calcCenteredTextBoxX(menuText);

    // create new CanvasTextObjectInteractive for each
    this.menuObjects = menuText.map((text, i) => new CanvasTextObjectInteractive({
      text,
      x: menuTextX,
      y: (this.canvas.height / 2) - 55 + (55 * i),
      id: i + 1,
    }));
    
    // set the focus and total
    this.focusMenuObjectId = 1;
    this.totalMenuObjects = menuText.length;
  }

  /**
   * Gets a menu object by its id
   *
   * @param {integer} id
   * @returns {CanvasTextObjectInteractive}
   * @memberof SceneMainMenu
   */
  getMenuObjectById(id) {
    return this.menuObjects.filter(obj => obj.id === id)[0];
  }

  /**
   * Gets the current focused menu object
   *
   * @returns {CanvasTextObjectInteractive}
   * @memberof SceneMainMenu
   */
  getFocusMenuObject() {
    return this.getMenuObjectById(this.focusMenuObjectId);
  }

  /**
   * Increments the current focused menu item
   *
   * @memberof SceneMainMenu
   */
  incrementFocusMenuObject() {
    this.focusMenuObjectId = this.focusMenuObjectId === this.totalMenuObjects
      ? 1
      : this.focusMenuObjectId + 1;
  }

  /**
   * Decrements the current focused menu item
   *
   * @memberof SceneMainMenu
   */
  decrementFocusMenuObject() {
    this.focusMenuObjectId = this.focusMenuObjectId === 1
      ? this.totalMenuObjects
      : this.focusMenuObjectId - 1;
  }

  /**
   * Creates the focus menu item arrow
   *
   * @memberof SceneMainMenu
   */
  createArrow() {
    // the arrow
    const text = ')';
    const font = '44px Arial';
    
    // get the width to offset from the menu items
    this.ctx.font = font;
    const width = this.ctx.measureText(text).width;

    // get the current focus object
    const focusMenuObject = this.getFocusMenuObject();
    
    // create the object
    this.arrow = new CanvasTextObject({
      text,
      font,
      x: focusMenuObject.x - width - 12,
      y: focusMenuObject.y,
    });
  }

  /**
   * Draws the main menu
   *
   * @memberof SceneMainMenu
   */
  draw() {
    // draw the background
    this.canvas.drawGradientBackground();

    // push the logo to the scene
    this.pushToScene(this.logo);

    // push the menu items to the scene
    this.menuObjects.forEach(obj => this.pushToScene(obj));

    // draw the arrow
    this.arrow.y = this.getFocusMenuObject().y;
    this.pushToScene(this.arrow);
    
    // draw the scene objects to the canvas
    this.drawSceneToCanvas();
  }

  /**
   * Handle input for the scene
   *
   * @param {array} activeKeys
   * @returns {void}
   * @memberof SceneMainMenu
   */
  handleInput(activeKeys) {
    // bail if input is disabled
    if (!this.allowInput) {
      return;
    }

    // bail if no key press
    if (activeKeys.length === 0) {
      return;
    }

    // handle down
    if (activeKeys.indexOf(40) > -1) {
      // increment the focused object
      this.incrementFocusMenuObject();
      this.allowInput = false;
    }

    // handle up
    if (activeKeys.indexOf(38) > -1) {
      // decrement the focused object
      this.decrementFocusMenuObject();
      this.allowInput = false;
    }

    // handle enter
    if (activeKeys.indexOf(13) > -1) {
      // do the menu item callback
      this.getFocusMenuObject().callback();
      this.allowInput = false;
    }
    
    // set timeout to enable key press again
    window.clearTimeout(this.keyboardCooldownTimer);
    const that = this;
    this.keyboardCooldownTimer = window.setTimeout(function() {
      that.allowInput = true;
    }, this.keyboardCooldown);
  }
}

export default SceneMainMenu;
