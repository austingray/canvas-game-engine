class MapTile {
  constructor(args) {
    this.x = args.x;
    this.y = args.y;
    this.width = args.width;
    this.height = args.height;

    // border
    this.lineWidth = '1';

    // is this a light source?
    this.light = false;

    // randomize the tiles for now
    const random = Math.random() * 10;
    if (random > 9.5) {
      this.type = 'water';
      this.blocking = true;
      this.shadow = false;
    } else if (random <= 9.5 && random > 1) {
      this.type = 'grass';
      this.blocking = false;
      this.shadow = false;
    } else if (random <= 1 && random > .2) {
      this.type = 'rock';
      this.blocking = true;
      this.shadow = true;
    } else if (random <= .2 && random > .1) {
      this.type = 'tree';
      this.blocking = true;
      this.shadow = false;
    } else {
      this.type = 'torch';
      this.blocking = false;
      this.shadow = false;
      this.light = true;
    }
  }

  draw(Canvas) {
    Canvas.drawTile(this);
  }
}

export default MapTile;