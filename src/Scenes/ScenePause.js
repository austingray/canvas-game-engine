import Scene from './Scene';
import CanvasTextObject from './CanvasTextObject';
import CanvasTextObjectInteractive from './CanvasTextObjectInteractive';

/**
 * The Main Menu scene
 *
 * @class ScenePause
 * @extends {Scene}
 */
class ScenePause extends Scene {
  /**
   * Constructor
   *
   * @memberof ScenePause
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
   * @memberof ScenePause
   */
  createLogo() {
    const text = 'Pause';
    const font = '44px Arial';
    this.logo = new CanvasTextObject({
      text,
      x: this.Canvas.calcCenteredTextX(text, font),
      y: 64 + this.Canvas.padding,
      font,
    });
  }

  /**
   * Creates the menu item objects
   *
   * @memberof ScenePause
   */
  createMenuObjects() {
    // calculate the x coord
    const x = this.Canvas.calcCenteredTextBoxX([ 'Continue', 'Return to Main Menu']);

    // the menu text
    const that = this;
    const menuObjects = [
      {
        text: 'Continue',
        callback: () => {
          this.game.changeCurrentScene('game');
        },
        x,
        y: (this.Canvas.height / 2) - 55 + (55 * 0),
        id: 1,
      },
      {
        text: 'Return to Main Menu',
        callback: () => {
          this.game.changeCurrentScene('mainMenu');
        },
        x,
        y: (this.Canvas.height / 2) - 55 + (55 * 1),
        id: 2,
      },
    ];

    // create new CanvasTextObjectInteractive for each
    this.menuObjects = menuObjects.map(option => new CanvasTextObjectInteractive(option));
    
    // set the focus and total
    this.focusMenuObjectId = 1;
    this.totalMenuObjects = menuObjects.length;
  }

  /**
   * Gets a menu object by its id
   *
   * @param {integer} id
   * @returns {CanvasTextObjectInteractive}
   * @memberof ScenePause
   */
  getMenuObjectById(id) {
    return this.menuObjects.filter(obj => obj.id === id)[0];
  }

  /**
   * Gets the current focused menu object
   *
   * @returns {CanvasTextObjectInteractive}
   * @memberof ScenePause
   */
  getFocusMenuObject() {
    return this.getMenuObjectById(this.focusMenuObjectId);
  }

  /**
   * Increments the current focused menu item
   *
   * @memberof ScenePause
   */
  incrementFocusMenuObject() {
    this.focusMenuObjectId = this.focusMenuObjectId === this.totalMenuObjects
      ? 1
      : this.focusMenuObjectId + 1;
  }

  /**
   * Decrements the current focused menu item
   *
   * @memberof ScenePause
   */
  decrementFocusMenuObject() {
    this.focusMenuObjectId = this.focusMenuObjectId === 1
      ? this.totalMenuObjects
      : this.focusMenuObjectId - 1;
  }

  /**
   * Creates the focus menu item arrow
   *
   * @memberof ScenePause
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
   * Loads the objects to the scene for drawing
   *
   * @memberof ScenePause
   */
  prepareScene() {
    // draw the background
    this.Canvas.drawGradientBackground();

    // push the logo to the scene
    this.pushToScene(this.logo);

    // push the menu items to the scene
    this.menuObjects.forEach(obj => this.pushToScene(obj));

    // draw the arrow
    this.arrow.y = this.getFocusMenuObject().y;
    this.pushToScene(this.arrow);    
  }

  /**
   * Handle input for the scene
   *
   * @param {array} activeKeys
   * @returns {void}
   * @memberof ScenePause
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

export default ScenePause;
