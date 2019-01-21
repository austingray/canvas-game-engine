import MapBaseClass from '../MapBaseClass';
import CharacterBaseClass from './CharacterBaseClass';

class Characters extends MapBaseClass {
  /**
   * Subclass constructor
   *
   * @memberof CharUtil
   */
  init() {
    // holds all characters
    this.array = [];
    this.visible = [];

    // used to give each character a unique id
    this.ids = 0;

    // a list of all character types
    this.types = [
      {
        name: 'hero',
      }
    ];
  }

  draw(Canvas) {
    for (var i = 0; i < this.visible.length; i++) {
      this.visible[i].draw(Canvas);
    }
  }

  getById(id) {
    for (var i = 0; i < this.array.length; i++) {
      if (this.array[i].id === id) {
        return this.array[i];
      }
    }

    throw `CharacterUtil.getById: character with id does not exist: ${id}`;
  }

  /**
   * Gets a type by its name
   *
   * @param {*} name
   * @returns
   * @memberof CharUtil
   */
  getTypeByName(name) {
    for (var i = 0; i < this.types.length; i++) {
      if (this.types[i].name === name) {
        return this.types[i];
      }
    }

    throw `CharacterUtil.getTypeByName: name does not exist: ${name}`;
  }

  /**
   * Character creation method
   *
   * @memberof CharUtil
   */
  create(type, x, y) {
    const id = this.ids++;
    const args = { type, x, y, id };
    const character = new CharacterBaseClass(this.game, this.map, args);
    this.array.push(character);

    if (typeof character.createMesh !== 'undefined') {
      // create the three.js mesh for this object
      character.createMesh();
    }

    return id;
  }

  /**
   * Generates a random character
   *
   * @memberof CharUtil
   */
  generateRandom() {
    const { x, y } = this.getRandomPixelCoordinate();
    this.create('hero', x, y);
  }

  /**
   * Calculate visible characters
   *
   * @param {*} inViewport
   * @memberof Characters
   */
  calculateVisible(inViewport) {
    const visible = [];

    for (var i = 0; i < this.array.length; i++) {
      const x1 = this.array[i].x;
      const y1 = this.array[i].y;
      const x2 = x1 + this.array[i].width;
      const y2 = y1 + this.array[i].height;
      if (this.Canvas.Camera.inViewport(x1, y1, x2, y2)) {
        this.array[i].isVisible = true;
        this.array[i].doMovement();
        visible.push(this.array[i]);

        if (typeof this.array[i].mesh !== 'undefined') {
          this.Canvas.object3dLayer.ThreeLayer.scene.add(this.array[i].mesh);
        }
      } else {
        this.array[i].stopMovement();
        this.array[i].isVisible = false;

        if (typeof this.array[i].mesh !== 'undefined') {
          this.Canvas.object3dLayer.ThreeLayer.scene.remove(this.array[i].mesh);
        }
      }
    }

    this.visible = visible;
  }
}

export default Characters;
