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

    // used to give each character a unique id
    this.ids = 0;

    // a list of all character types
    this.types = [
      {
        name: 'hero',
      }
    ]
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
}

export default Characters;
