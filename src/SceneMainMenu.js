import Scene from './Scene';
import CanvasTextObject from './CanvasTextObject';
import CanvasTextObjectInteractive from './CanvasTextObjectInteractive';

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
      y: 44 + this.canvas.padding,
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
    }));
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
    
    // draw the scene objects to the canvas
    this.drawSceneToCanvas();
  }
}

export default SceneMainMenu;
