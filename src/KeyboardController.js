class KeyboardController {
  constructor() {
    this.activeKeys = [];
    
    document.addEventListener('keydown', (e) => {
      if (this.activeKeys.indexOf(e.keyCode) === -1) {
        this.activeKeys.push(e.keyCode);
      }
    });

    document.addEventListener('keyup', (e) => {
      const index = this.activeKeys.indexOf(e.keyCode);
      this.activeKeys.splice(index, 1);
    });
  }
}

export default KeyboardController;
