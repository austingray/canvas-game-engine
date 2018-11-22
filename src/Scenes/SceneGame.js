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
    this.Canvas.layers[1].clear();
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
    if (Keyboard.activeKeys.indexOf(27) > -1) {
      this.game.changeCurrentScene('pause');
    }

    this.hero.handleInput(Keyboard, this.map);
  }
}

export default SceneGame;
