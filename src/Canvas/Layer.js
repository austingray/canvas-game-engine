class Layer {
  /**
   * Creates an instance of Layer.
   * @param {*} id
   * @param {*} [args={}]
   * @memberof Layer
   */
  constructor(id, args = {}) {
    // get width/height
    this.width = args.width;
    this.height = args.height;
    this.name = args.name;
    this.visible = (typeof args.visible === 'undefined') ? true : args.visible;

    const domParent = (typeof args.appendTo === 'undefined') ? document.body : args.appendTo;

    // create the canvas element and add it to the document body
    const element = document.createElement('canvas');
    element.id = id;
    element.width = this.width;
    element.height = this.height;
    domParent.appendChild(element);
    this.element = element;

    if (!this.visible) {
      element.setAttribute('style', 'display: none;');
    }

    // get the context
    this.context = element.getContext(args.context);
  }

  /**
   * Toggle canvas element visibility
   *
   * @memberof Layer
   */
  toggleVisible() {
    if (this.visible) {
      this.visible = false;
      this.element.setAttribute('style', 'display: none;');
    } else {
      this.visible = true;
      this.element.setAttribute('style', '');
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
}

export default Layer;
