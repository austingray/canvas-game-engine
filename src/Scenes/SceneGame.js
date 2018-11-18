import Scene from './Scene';

class SceneGame extends Scene {
  init() {
    this.createHero();
  }

  createHero() {
    this.hero = this.Objects.create({
      type: 'hero',
      x: 30,
      y: 30,
      radius: 30,
      fillStyle: 'green',
    });
  }

  prepareScene() {
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
