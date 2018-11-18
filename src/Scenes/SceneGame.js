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
      x: 30,
      y: 30,
      radius: 30,
      fillStyle: 'purple',
    });
  }

  prepareScene() {
    this.pushToScene(this.map);
    this.pushToScene(this.hero);
  }

  /**
   * Handle input for the scene
   *
   * @param {array} activeKeys
   * @returns {void}
   * @memberof SceneMainMenu
   */
  handleInput(activeKeys) {
    // pause the game
    if (activeKeys.indexOf(27) > -1) {
      this.game.changeCurrentScene('pause');
    }

    this.hero.handleInput(activeKeys);
  }
}

export default SceneGame;
