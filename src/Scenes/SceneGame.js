import Scene from './Scene';
import Map from '../Map/index';

class SceneGame extends Scene {
  init() {
    this.createMap();
    this.createHero();
  }

  createMap() {
    this.map = new Map({}, this.game);
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
      this.Canvas.clearLayers(['primary', 'secondary', 'override', 'character']);
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

  transitionInCustom() {
    this.Canvas.setContext('primary');

    // do a draw
    this.map.needsUpdate = true;
  }

  // leave the game in the background cause it's pretty sweet looking
  transitionOut() {
    this.Canvas.clearLayers(['character']);
    // do nothing!
  }
}

export default SceneGame;
