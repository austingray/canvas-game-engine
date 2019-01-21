import CanvasBaseClass from './CanvasBaseClass';
import ThreeLayer from './Three/ThreeLayer';

class Layer extends CanvasBaseClass {
  /**
   * Creates an instance of Layer.
   * @param {*} id
   * @param {*} [args={}]
   * @memberof Layer
   */
  create(id, args) {
    this.name = args.name;

    // create the canvas element and add it to the document body
    this.element = document.createElement('canvas');
    this.element.id = id;
    this.element.width = this.width;
    this.element.height = this.height;

    // custom css
    this.element.style.left = (typeof args.left === 'undefined') ? 0 : args.left;
    this.element.style.top = (typeof args.top === 'undefined') ? 0 : args.top;

    // append the canvas element to the specified parent dom node
    this.parentElement = (typeof args.appendTo === 'undefined') ? document.body : args.appendTo;
    this.parentElement.appendChild(this.element);

    // can default to invisible
    this.visible = (typeof args.visible === 'undefined') ? true : args.visible;
    if (!this.visible) {
      this.element.style.display = 'none';
    }

    // 2d layer
    if (
      typeof args.type === 'undefined'
      || args.type === '2d'
    ) {
      this.type = '2d';
      this.context = this.element.getContext('2d');
    }

    // do 3d scene creation
    if (args.type === '3d') {
      this.type = '3d';
      this.context = this.element.getContext('webgl');

      // init a 3d scene
      this.ThreeLayer = new ThreeLayer()
      this.ThreeLayer.create({
        domElement: this.element,
        lightCameraZ: typeof args.lightCameraZ === 'undefined' ? -25 : args.lightCameraZ,
      });
    }
  }

  /**
   * Toggle canvas element visibility
   *
   * @memberof Layer
   */
  toggleVisible() {
    if (this.visible) {
      this.visible = false;
      // this.element.setAttribute('style', 'display: none;');
      this.element.style.display = 'none';
    } else {
      this.visible = true;
      this.element.style.display = 'block';
    }
  }

  /**
   * Clears the layer
   *
   * @memberof Layer
   */
  clear() {
    if (typeof this.context.clearRect !== 'undefined') {
      this.context.clearRect(0, 0, this.width, this.height);
    }
  }

  /**
   * Deletes the layer
   *
   * @memberof Layer
   */
  delete() {
    this.element.parentNode.removeChild(this.element);
  }
}

export default Layer;
