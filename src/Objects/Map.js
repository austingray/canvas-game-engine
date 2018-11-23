import MapTile from './MapTile';

class Map {
  constructor(args, game) {
    // the tile matrix
    this.tiles = [];

    // used for offsetting the map to follow the hero
    this.x = this.y = 0;

    // map width and height in tiles
    this.width = 500;
    this.height = 500;

    // single tile width and height in pixels
    this.tileWidth = 50;
    this.tileHeight = 50;

    // get the width and height of the map in total pixels
    this.pixelWidth = this.width * this.tileWidth;
    this.pixelHeight = this.height * this.tileHeight;

    // crude tile creation
    for (let i = 0; i < this.width; i++) {
      const row = [];
      for (let j = 0; j < this.height; j++) {
        row.push(new MapTile({
          x: i * this.tileWidth,
          y: j * this.tileHeight,
          width: this.tileWidth,
          height: this.tileHeight,
        }));
      }
      this.tiles.push(row);
    }

    // keep track of visible tiles
    this.visibleTilePos = { x: null, y: null }
    this.visibleTiles = [];
    this.updateVisibleTiles(0, 0);

    // draw the map and convert to base64
    // this.tiles.forEach(tile => game.Canvas.drawTile(tile));
    // this.base64encoded = game.Canvas.element.toDataURL();
    // this.image = new Image();
    // this.image.src = this.base64encoded;
  }

  // draw each tile
  draw(Canvas) {
    this.visibleTiles.forEach(row => {
      row.forEach(tile => Canvas.drawTile(tile));
    });
  }

  /**
   * Updates the visible tile matrix based off x, y coords
   *
   * @param {*} x
   * @param {*} y
   * @memberof Map
   */
  updateVisibleTiles(x, y) {
    // get the pixel to tile number
    const tileX = Math.round(x / this.tileWidth);
    const tileY = Math.round(y / this.tileHeight);

    // don't update if we haven't changed tiles
    if (
      this.visibleTilePos.x === tileX
      && this.visibleTilePos.y === tileY
    ) {
      return;
    }

    // update to the new tile positions
    this.visibleTilePos = {
      x: tileX,
      y: tileY,
    };

    // set the amount of visible tiles in each direction
    const visibleTiles = 15;

    // get a local matrix
    let x1 = tileX - visibleTiles;
    let x2 = tileX + visibleTiles;
    let y1 = tileY - visibleTiles;
    let y2 = tileY + visibleTiles;

    // clamp
    if (x1 < 1) {
      x1 = 0;
    }
    if (x2 > this.width) {
      x2 = this.width;
    }
    if (y1 < 1) {
      y1 = 0;
    }
    if (y2 > this.height) {
      y2 = this.height;
    }

    // create visible tile matrix
    this.visibleTiles = [];
    for (let i = y1; i < y2; i++) {
      let row = [];
      for (let j = x1; j < x2; j++) {
        const tile = this.tiles[j][i];
        row.push(tile);
      }
      this.visibleTiles.push(row);
    }
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
    for (let i = 0; i < this.visibleTiles.length; i++) {
      const row = this.visibleTiles[i];
      for (let j = 0; j < row.length; j++) {
        let tile = row[j];
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
    }

    // let 'em pass
    return false;
  }
}

export default Map;
