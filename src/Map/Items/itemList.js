const itemList = [
  {
    name: 'rock',
    blocking: true,
    shadow: true,
    width: 50,
    height: 50,
    draw(Canvas) {
      const x = this.x + Canvas.Camera.offsetX;
      const y = this.y + Canvas.Camera.offsetY;

      const ctx = Canvas.overrideLayer.context
      ctx.fillStyle = '#888787';
      ctx.fillRect(x, y, this.width, this.height);
      // Canvas.roundRect(ctx, x, y, this.width, this.height, 20, '#888787', 0);
    },
  }
];

export default itemList;
