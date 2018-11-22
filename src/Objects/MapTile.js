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
    if (random < .5) {
      this.type = 'rock';
      this.blocking = true;
    } else {
      this.type = 'grass';
      this.blocking = false;
    }
  }
}

export default MapTile;