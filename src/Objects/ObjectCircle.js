/**
 * Draws a circle to the Canvas
 *
 * @class ObjectCircle
 */
class ObjectCircle {
  constructor(args) {    
    this.args = args;
    this.x = args.x;
    this.y = args.y;
    this.radius = args.radius;
    this.fillStyle = args.fillStyle;
    this.startAngle = Math.PI / 180 * 0;
    this.endAngle = Math.PI / 180 * 360;
    this.anticlockwise = false;
  }

  draw(Canvas) {
    Canvas.ctx.fillStyle = this.fillStyle;
    Canvas.ctx.arc(
      this.x,
      this.y,
      this.radius,
      this.startAngle,
      this.endAngle,
      this.anticlockwise,
    );
    Canvas.ctx.fill();
  }
}

export default ObjectCircle;
