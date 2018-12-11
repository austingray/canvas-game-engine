import Shadows from './Shadows';
import TileUtil from './TileUtil';

/**
 * @class Map
 * 
 *  Types of information stored in the Map class are
 *    - Terrain
 *    - Items
 *    - Characters
 *
 *  All of the above types are stored in their each respective array
 *  keyed by the map coordinates [ x + (y * xWidth)]
 *
 *  Map has a property MainCharacter which is controlled by user input
 *
 *  Map has a property Camera
 *    The Camera contains a focal point which is used to
 *    calculate pixel offsets when drawing map objects
 *
 */
class Map {
  constructor(args, game) {
    this.game = game;

    // map width and height in tiles
    this.xTotalTiles = 5000;
    this.yTotalTiles = 5000;
    
    // total amount of tiles
    this.totalTiles = this.xTotalTiles * this.yTotalTiles;

    // single tile width and height in pixels
    this.tileWidth = 50;
    this.tileHeight = 50;

    // get the width and height of the map in total pixels
    this.widthInPixels = this.xTotalTiles * this.tileWidth;
    this.heightInPixels = this.yTotalTiles * this.tileHeight;

    // stores the data about what exists at a particular position
    this.mapArray = [];

    // stores the objects on the current map
    this.objectArray = [];

    // keep track of visible tiles
    this.visibleTilesPerDirection = 16;
    this.visibleTileArray = [];
    this.visibleTileX = 0;
    this.visibleTileY = 0;

    // tile util needs to know:
    //  width/height of a tile in pixels
    //  x / y total tile length
    this.TileUtil = new TileUtil({
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      xMax: this.xTotalTiles.toString().length,
      yMax: this.yTotalTiles.toString().length,
    });
  }

  /**
   * Converts x, y position to map array index
   *
   * @param {*} x
   * @param {*} y
   * @param {boolean} [convertPixels=false]
   * @returns
   * @memberof Map
   */
  convertPosToIndex(x, y, convertPixels = false) {
    let tileX = x;
    let tileY = y;
    
    if (convertPixels) {
      tileX = Math.round(x / this.tileWidth);
      tileY = Math.round(y / this.tileHeight);
    }

    const index = tileX + tileY * this.yTotalTiles;
    return index;
  }

  /**
   * Draws the map tiles and shawdows
   * only if the map needs an update
   *
   * @param {*} Canvas
   * @memberof Map
   */
  draw(Canvas) {
    if (this.needsUpdate) {
      // calculate the visible tiles
      this.calculateVisibleTiles();

      // draw the tiles
      for (var i = 0; i < this.visibleTileArray.length; i++) {
        const tileData = this.visibleTileArray[i];
        Canvas.drawTile(tileData[0]);
      }

      // draw the shadows
      this.drawShadows();
    }
  }

  /**
   * Draws the shadows
   *
   * @memberof Map
   */
  drawShadows() {
    // get the origin
    const scene = this.game.scene;
    const origin = { x: scene.hero.x, y: scene.hero.y };

    // get the shadow objects
    const blocks = [];
    for (var i = 0; i < this.visibleTileArray.length; i++) {
      const tile = this.visibleTileArray[i][0];
      if (tile.shadow) {
        blocks.push(tile);
      }
    }

    // get and draw
    const shadows = new Shadows(this.game.Canvas, origin, blocks);
    shadows.draw();
  }

  /**
   * Gets the visible tile array based off x, y coords
   *
   * @param {*} x
   * @param {*} y
   * @memberof Map
   */
  calculateVisibleTiles(x = this.game.Canvas.Camera.x, y = this.game.Canvas.Camera.y) {    
    // get the pixel to tile number
    const tileX = Math.round(x / this.tileWidth);
    const tileY = Math.round(y / this.tileHeight);

    // bail if the tiles are the same as the last time
    if (
      this.visibleTileX === tileX
      && this.visibleTileY === tileY
    ) {
      return;
    }

    this.visibleTileX = tileX;
    this.visibleTileY = tileY;

    // get the bounds of the visible tiles
    let x1 = tileX - this.visibleTilesPerDirection;
    let x2 = tileX + this.visibleTilesPerDirection;
    let y1 = tileY - this.visibleTilesPerDirection;
    let y2 = tileY + this.visibleTilesPerDirection;

    // clamp the bounds
    if (x1 < 1) {
      x1 = 0;
    }
    if (x2 > this.xTotalTiles) {
      x2 = this.xTotalTiles;
    }
    if (y1 < 1) {
      y1 = 0;
    }
    if (y2 > this.yTotalTiles) {
      y2 = this.yTotalTiles;
    }

    // create visible tile array from the boundaries
    this.visibleTileArray = [];
    let visibleIndex = 0;
    for (let j = y1; j < y2; j++) {
      for (let i = x1; i < x2; i++) {
        // get the map array and visible array indexes
        const mapIndex = this.convertPosToIndex(i, j);

        // if the map array value is -1
        // then it has not been visible yet
        // create a tile at that index
        if (typeof this.mapArray[mapIndex] === 'undefined') {
          const tile = this.TileUtil.create();
          this.mapArray[mapIndex] = tile;
        }

        // add the x/y data to the object
        const visibleTile = this.TileUtil.unpack(this.mapArray[mapIndex]);
        visibleTile.x = i;
        visibleTile.y = j;
        visibleTile.xPixel = i * this.tileWidth;
        visibleTile.yPixel = j * this.tileHeight;
        visibleTile.width = this.tileWidth;
        visibleTile.height = this.tileHeight;

        // add the unpacked version of the tile to the visible tile array
        this.visibleTileArray[visibleIndex++] = [visibleTile];
        ;
      }
    }
  }

  /**
   * Check if a coordinate is a collision and return the collision boundaries
   *
   * @param {*} x pixel position
   * @param {*} y pixel position
   * @returns
   * @memberof Map
   */
  getCollision(xPixel, yPixel) {
    // hardcode the hero
    const x1 = xPixel + 10;
    const x2 = xPixel + 40;
    const y1 = yPixel + 10;
    const y2 = yPixel + 40;
    
    // map boundaries
    if (
      x1 < 0
      || y1 < 0
      || x2 > this.widthInPixels
      || y2 > this.heightInPixels
    ) {
      return true;
    }

    // tile blocking
    for (let i = 0; i < this.visibleTileArray.length; i++) {
      const tile = this.visibleTileArray[i][0];
      if (tile.blocking) {
        if (
          x2 > tile.xPixel
          && x1 < tile.xPixel + tile.width
          && y2 > tile.yPixel
          && y1 < tile.yPixel + tile.height
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
