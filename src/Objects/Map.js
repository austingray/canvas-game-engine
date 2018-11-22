import MapTile from './MapTile';

class Map {
  constructor(args, game) {
    this.tiles = [];

    // used for offsetting the map to follow the hero
    this.x = this.y = 0;

    // map width and height in tiles
    this.width = 50;
    this.height = 50;

    // single tile width and height in pixels
    this.tileWidth = 50;
    this.tileHeight = 50;

    // get the width and height of the map in total pixels
    this.pixelWidth = this.width * this.tileWidth;
    this.pixelHeight = this.height * this.tileHeight;

    // crude tile creation
    for (let i = 0; i < this.width; i++) {
      for (let j = 0; j < this.height; j++) {
        this.tiles.push(new MapTile({
          x: i * this.tileWidth,
          y: j * this.tileHeight,
          width: this.tileWidth,
          height: this.tileHeight,
        }));
      }
    }

    // draw the map and convert to base64
    // this.tiles.forEach(tile => game.Canvas.drawTile(tile));
    // this.base64encoded = game.Canvas.element.toDataURL();
    // this.image = new Image();
    // this.image.src = this.base64encoded;
  }

  // draw each tile
  draw(Canvas) {
    // Canvas.drawMap(this.image);
    this.tiles.forEach(tile => Canvas.drawTile(tile));
  }

  /**
   * Check if a coordinate is a collision and return the collision boundaries
   *
   * @param {*} x
   * @param {*} y
   * @returns
   * @memberof Map
   */
  getCollision(x, y) {
    // hardcode the hero
    const heroRadius = 20;
    const x1 = x - heroRadius;
    const x2 = x + heroRadius;
    const y1 = y - heroRadius;
    const y2 = y + heroRadius;
    
    // map boundaries
    if (
      x1 < 0
      || y1 < 0
      || x2 > this.pixelWidth
      || y2 > this.pixelHeight
    ) {
      return true;
    }

    // tile blocking
    for (let i = 0; i < this.tiles.length; i++) {
      let tile = this.tiles[i];
      if (tile.blocking) {
        if (
          x2 > tile.x
          && x1 < tile.x + tile.width
          && y2 > tile.y
          && y1 < tile.y + tile.height
        ) {
          return true;
        }
      }
    }

    // let 'em pass
    return false;
  }
}

export default Map;
