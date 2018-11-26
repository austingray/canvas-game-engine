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
            this.game.setScene('game');
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
    });
  }

  /**
   * Clear the text layer
   *
   * @memberof SceneMainMenu
   */
  clear() {
    this.Canvas.getLayerByName('menu').clear();
  }

  /**
   * Loads the objects to the scene for drawing
   *
   * @memberof SceneMainMenu
   */
  prepareScene() {
    // draw the background
    this.Canvas.setContext('primary');
    this.Canvas.drawGradientBackground();

    this.Canvas.setContext('menu');

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
  handleInput(Keyboard) {
    if (!this.allowInput) {
      return;
    }

    // handle up
    if (Keyboard.active.up) {
      // decrement the focused object
      this.menu.decrementFocusMenuObject();
      this.allowInput = false;
    }

    // handle down
    if (Keyboard.active.down) {
      // increment the focused object
      this.menu.incrementFocusMenuObject();
      this.allowInput = false;
    }

    // handle enter
    if (Keyboard.active.enter) {
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

  transitionInCustom() {
    // TODO: fix this nonsense...
    this.game.Canvas.clearLayers(['menu', 'secondary', 'override', 'shadow']);
  }

  transitionOut() {
    // clear the menu layer
    this.game.Canvas.getLayerByName('menu').clear();
  }
}

export default SceneMainMenu;
