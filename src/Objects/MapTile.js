class MapTile {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
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