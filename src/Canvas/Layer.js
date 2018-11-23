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

    // create the canvas element and add it to the document body
    const element = document.createElement('canvas');
    element.id = id;
    element.width = this.width;
    element.height = this.height;
    document.body.appendChild(element);

    if (!this.visible) {
      console.log('hide it');
      element.setAttribute('style', 'display: none;');
    }

    // get the context
    this.context = element.getContext(args.context);
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
