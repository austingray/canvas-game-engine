import Scene from './Scene';

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
    // this.createMenuObjects();

    //
    this.createMenu();

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
    this.logo = this.Objects.create({
      type: 'text',
      text,
      x: this.Canvas.calcCenteredTextX(text, font),
      y: 64 + this.Canvas.padding,
      font,
    });
  }

  /**
   * Creates the menu
   *
   * @memberof SceneMainMenu
   */
  createMenu() {
    this.menu = this.Objects.create({
      type: 'menu',
      options: [
        {
          text: 'New Game',
          callback: () => {
            this.game.changeCurrentScene('game');
          },
        },
        {
          text: 'Continue',
          callback: () => {
            console.log('do Continue');
          },
        },
        {
          text: 'Options',
          callback: () => {
            console.log('do Options');
          },
        },
      ]
    })
  }

  /**
   * Loads the objects to the scene for drawing
   *
   * @memberof SceneMainMenu
   */
  prepareScene() {
    // draw the background
    this.Canvas.drawGradientBackground();

    // push the logo to the scene
    this.pushToScene(this.logo);

    // push the menu to the scene
    this.pushToScene(this.menu);
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
      this.menu.incrementFocusMenuObject();
      this.allowInput = false;
    }

    // handle up
    if (activeKeys.indexOf(38) > -1) {
      // decrement the focused object
      this.menu.decrementFocusMenuObject();
      this.allowInput = false;
    }

    // handle enter
    if (activeKeys.indexOf(13) > -1) {
      // do the menu item callback
      this.menu.focusMenuObject.callback();
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
