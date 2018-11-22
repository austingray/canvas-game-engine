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

    // create the canvas element and add it to the document body
    const element = document.createElement('canvas');
    element.id = id;
    element.width = this.width;
    element.height = this.height;
    document.body.appendChild(element);

    this.context = element.getContext('2d');
  }

  /**
   * Clears the layer
   *
   * @memberof Layer
   */
  clear() {
    this.context.clearRect(0, 0, this.width, this.height);
  }
}

export default Layer;
