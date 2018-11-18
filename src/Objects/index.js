import ObjectText from './ObjectText';
import ObjectTextInteractive from './ObjectTextInteractive';
import ObjectCircle from './ObjectCircle';
import ObjectMenu from './ObjectMenu';
import Hero from './Hero';

/**
 * Handles Object creation for use in Scenes
 *
 * @class Objects
 */
class Objects {
  constructor(game) {
    this.game = game;

    // Used as the object.id when creating new objects.
    // Increments after each usage.
    this.newObjectId = 0;
  }

  /**
   * Creates a new object
   *
   * @param {*} args
   * @returns A Scene Object
   * @memberof Objects
   */
  create(args) {
    // get a new object id
    this.newObjectId++;

    // create the new object args
    const object = Object.assign({}, args, {
      id: this.newObjectId,
    });

    switch (object.type) {
      case 'text':
        return new ObjectText(object)
        break;
      
      case 'textInteractive':
        return new ObjectTextInteractive(object);
        break;

      case 'circle':
        return new ObjectCircle(object);
        break;
      
      case 'menu':
        return new ObjectMenu(object, this.game);
        break;

      case 'hero':
        return new Hero(object);
        break;
      
      default:
        break;
    }

    return {};
  }
}

export default Objects;
