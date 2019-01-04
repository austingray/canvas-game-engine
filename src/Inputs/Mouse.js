class Mouse {
  constructor() {
    this.x = 0;
    this.y = 0;

    this.addEventListeners();
  }

  addEventListeners() {
    document.addEventListener('mousemove', (e) => {

      this.x = e.clientX;
      this.y = e.clientY;
    });
  }
}

export default Mouse;
