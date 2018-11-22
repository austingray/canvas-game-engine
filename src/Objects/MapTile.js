class MapTile {
  constructor(args) {
    this.x = args.x;
    this.y = args.y;
    this.width = args.width;
    this.height = args.height;

    // border
    this.lineWidth = '1';

    // randomize the tiles for now
    const random = Math.random() * 10;
    if (random > 9) {
      this.type = 'desert';
      this.blocking = false;
    } else if (random <= 9 && random > .5) {
      this.type = 'grass';
      this.blocking = false;
    } else {
      this.type = 'rock';
      this.blocking = true;
    }
  }
}

export default MapTile;