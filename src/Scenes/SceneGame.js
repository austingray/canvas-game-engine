import Scene from './Scene';

class SceneGame extends Scene {
  init() {
    this.createMap();
    this.createHero();
  }

  createMap() {
    this.map = this.Objects.create({
      type: 'map',
    });
  }

  createHero() {
    this.hero = this.Objects.create({
      type: 'hero',
      x: 25,
      y: 25,
      radius: 25,
      fillStyle: '#800080',
      map: this.map,
    });

    // set focus to hero
    this.Canvas.Camera.x = this.hero.x;
    this.Canvas.Camera.y = this.hero.y;
    this.Canvas.Camera.setFocus(this.hero);
  }

  prepareScene() {
    this.pushToScene(this.map);
    this.pushToScene(this.hero);
  }

  clear() {
    // clear the primary layer
    if (this.map.needsUpdate) {
      this.Canvas.primaryLayer.clear();
      this.Canvas.secondaryLayer.clear();
      this.Canvas.overrideLayer.clear();
    }
  }

  /**
   * Handle input for the scene
   *
   * @param {array} activeKeys
   * @returns {void}
   * @memberof SceneMainMenu
   */
  handleInput(Keyboard) {
    // pause the game
    if (Keyboard.active.escape) {
      // cache the current scene in case we're just pausing
      this.game.sceneCache = this.game.scene;
      this.game.setScene('pause');
    }

    this.hero.handleInput(Keyboard, this.map);
  }
}

export default SceneGame;
