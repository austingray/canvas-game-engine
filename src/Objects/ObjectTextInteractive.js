import ObjectText from './ObjectText';

/**
 * Extends the ObjectText with a callback method
 *
 * @class ObjectTextInteractive
 * @extends {ObjectText}
 */
class ObjectTextInteractive extends ObjectText {
  callback() {
    this.args.callback();
  }
}

export default ObjectTextInteractive;
