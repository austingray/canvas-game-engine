/**
 * Base helper class for canvas scenes
 *
 * @class Scene
 */
class Scene {
  // constructor games the game object
  constructor(game) {
    // make the game instance available to the scene
    this.game = game;

    // easy access to the canvas and canvas context
    this.Canvas = this.game.Canvas;
    this.ctx = this.game.Canvas.ctx;

    // each access to the object factory
    this.Objects = this.game.Objects;

    // the scene contains objects to be drawn
    this.scene = [];

    // additional constructor actions for child classes
    this.init();
  }

  /**
   ** Should be declared by subclass
   *  called at the end of constructor
   *
   * @memberof Scene
   */
  init() {
    // hello from the other side
  }

  /**
   * Push an object to the scene
   *
   * @param {object} obj
   * @memberof Scene
   */
  pushToScene(obj) {
    this.scene.push(obj);
  }

  /**
   ** Should be declared by subclass
   *  What/where objects should be displayed
   *
   * @memberof Scene
   */
  prepareScene() {
    /* for example
    if (this.shouldShowObject) {
      this.pushToScene(this.obj);
    }
    */
  }

  /**
   * Calls the .draw() method of each object in the scene
   * 
   *
   * @memberof Scene
   */
  drawSceneToCanvas() {
    // draw each object in the scene
    this.scene.forEach(obj => {
      obj.draw(this.Canvas);
    });

    // clear the scene for the next frame
    this.scene = [];
  }

  /**
   * Draws the current scene
   * Called in the main game loop
   *
   * @memberof Scene
   */
  draw() {
    // push the scene objects to the scene array
    this.prepareScene();

    // call each object's draw method
    this.drawSceneToCanvas();
  }

  /**
   ** Should be overridden by subclass
   *  Clears the previous frame
   *
   * @memberof Scene
   */
  clear() {
    // hello from the other side
  }

  /**
   ** Should be overridden by subclass
   *  Handles input from keyboard/mouse
   *
   * @memberof Scene
   */
  handleInput() {
    // hello from the other side
  }

  /**
   * Handle scene transitions
   *
   * @memberof Scene
   */
  transitionIn() {
    // disable and reenable keyboard on scene transition
    this.game.Keyboard.setDisabled();
    this.game.Keyboard.clear();
    setTimeout(() => {
      this.game.Keyboard.setDisabled(false);
    }, 150);

    // do custom transition in effects
    this.transitionInCustom();
  }

  /**
   ** Should be overridden by subclass
   *  Give the scene a way to customize the transition in
   *
   * @memberof Scene
   */
  transitionInCustom() {
    // hello from the other side
  }

  /**
   * Transition out of the current scene
   *
   * @memberof Scene
   */
  transitionOut() {
    // default to clear all layers
    for (let i = 0; i < this.game.Canvas.layers.length; i++) {
      this.game.Canvas.layers[i].clear();
    }
  }
}

export default Scene;
