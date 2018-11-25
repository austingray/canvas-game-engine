/**
 * Draws a circle to the Canvas
 *
 * @class ObjectCircle
 */
class ObjectCircle {
  constructor(args, game) {    
    // access to the game object
    this.game = game;

    this.args = args;
    this.x = args.x;
    this.y = args.y;
    this.radius = args.radius;
    this.fillStyle = args.fillStyle;
    this.startAngle = Math.PI / 180 * 0;
    this.endAngle = Math.PI / 180 * 360;
    this.anticlockwise = false;

    this.init(args.map);
  }

  draw(Canvas) {
    Canvas.drawCircle({
      fillStyle: this.fillStyle,
      x: this.x,
      y: this.y,
      radius: this.radius,
      startAngle: this.startAngle,
      endAngle: this.endAngle,
      anticlockwise: this.anticlockwise,
    });
  }
}

export default ObjectCircle;
