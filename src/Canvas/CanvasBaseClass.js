class CanvasBaseClass {
  constructor() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    
    // subclass constructor
    this.init();
  }

  init() {
    // overwrite in subclass
  }
}

export default CanvasBaseClass;
