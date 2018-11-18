class MapTile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
  }

  draw(Canvas) {
    const ctx = Canvas.ctx;
    ctx.beginPath();
    ctx.lineWidth = '1';
    ctx.fillStyle='#008000';
    ctx.strokeStyle = '#063c06';
    ctx.rect(this.x, this.y, this.width, this.height);
    ctx.fill();
    ctx.stroke();
  }
}

export default MapTile;