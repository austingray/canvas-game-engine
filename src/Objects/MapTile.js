class MapTile {
  constructor(args) {
    this.type = args.type;
    this.x = args.x;
    this.y = args.y;
    this.width = args.width;
    this.height = args.height;
    this.blocking = args.blocking;
    this.shadow = args.shadow;
    this.light = args.light
    this.objects = [];
  }

  draw(Canvas) {
    Canvas.drawTile(this);
  }
}

export default MapTile;