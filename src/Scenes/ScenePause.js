import Scene from './Scene';

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

    // create the menu items
    this.createMenu();

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
    const text = 'Paused';
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
   * @memberof ScenePause
   */
  createMenu() {
    this.menu = this.Objects.create({
      type: 'menu',
      options: [
        {
          text: 'Resume',
          callback: () => {
            this.game.changeCurrentScene('game');
          },
        },
        {
          text: 'Quit To Menu',
          callback: () => {
            this.game.changeCurrentScene('mainMenu');
          },
        },
      ]
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

    // push the menu to the scene
    this.pushToScene(this.menu);
  }

  /**
   * Handle input for the scene
   *
   * @param {Keyboard} Keyboard
   * @returns {void}
   * @memberof ScenePause
   */
  handleInput(Keyboard) {
    // bail if input is disabled
    if (!this.allowInput) {
      return;
    }

    // handle down
    if (Keyboard.active.down) {
      // increment the focused object
      this.menu.incrementFocusMenuObject();
      this.allowInput = false;
    }

    // handle up
    if (Keyboard.active.up) {
      // decrement the focused object
      this.menu.decrementFocusMenuObject();
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
}

export default ScenePause;
