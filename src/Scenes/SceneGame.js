import Scene from './Scene';

class SceneGame extends Scene {
  init() {
    this.createHero();
  }

  createHero() {
    this.hero = this.Objects.create({
      type: 'circle',
      x: 10,
      y: 10,
      radius: 10,
      fillStyle: 'green',
    });
  }

  draw() {
    this.pushToScene(this.hero);
    this.drawSceneToCanvas();
  }
}

export default SceneGame;
