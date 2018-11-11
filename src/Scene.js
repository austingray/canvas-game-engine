/**
 * Base helper class for canvas scenes
 *
 * @class Scene
 */
class Scene {
  constructor(canvas) {
    // easy access to the canvas and canvas context
    this.canvas = canvas;
    this.ctx = canvas.ctx;

    // the scene contains objects to be drawn
    this.scene = [];

    // additional constructor actions for child classes
    this.init();
  }

  /**
   * Should be overridden by child class, used as its constructor
   *
   * @memberof Scene
   */
  init() {
    // hello from the other side
  }

  /**
   * Push the object to the scene
   *
   * @param {object} obj
   * @memberof Scene
   */
  pushToScene(obj) {
    this.scene.push(obj);
  }

  /**
   * Draws the menu items to the canvas
   *
   * @memberof Scene
   */
  drawSceneToCanvas() {
    // draw each object in the scene
    this.scene.forEach(obj => {
      obj.draw(this.canvas);
    });

    // clear the scene for the next frame
    this.scene = [];
  }
}

export default Scene;
