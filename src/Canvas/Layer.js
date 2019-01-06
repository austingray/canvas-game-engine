class Layer {
  /**
   * Creates an instance of Layer.
   * @param {*} id
   * @param {*} [args={}]
   * @memberof Layer
   */
  constructor(id, args = {}) {
    this.name = args.name;
    this.width = args.width;
    this.height = args.height

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

    // set/get the context: 2d, webgl
    const context = (typeof args.context === 'undefined') ? '2d' : args.context;
    this.context = this.element.getContext(context) ;
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
