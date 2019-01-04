import Scene from './Scene';
import Map from '../Map/index';

class SceneGame extends Scene {
  init() {
    // create map after scene change
    this.createMap();
  }

  createMap() {
    this.map = new Map(this.game);
  }

  prepareScene() {
    this.pushToScene(this.map);
  }

  clear() {
    // clear the primary layer
    if (this.map.needsUpdate) {
      this.Canvas.clearLayers(['primary', 'secondary', 'override', 'character', 'mouse']);
    }
  }

  /**
   * Handle input for the scene
   *
   * @param {array} activeKeys
   * @returns {void}
   * @memberof SceneMainMenu
   */
  handleInput(Keyboard, Mouse) {
    // pause the game
    if (Keyboard.active.escape) {
      // cache the current scene in case we're just pausing
      this.game.sceneCache = this.game.scene;
      this.game.setScene('pause');
    }

    this.map.handleInput(Keyboard, Mouse);
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
