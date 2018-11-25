import Shadows from './Shadows';
import TileUtil from './TileUtil';

const objects = [
  {
    id: 1,
    type: 'tree',
    blocking: true,
    shadow: false,
    light: false,
    width: 25,
    height: 25,
  },
  {
    id: 2,
    type: 'torch',
    blocking: false,
    shadow: false,
    light: true,
    width: 10,
    height: 10,
  },
];

class Map {
  constructor(args, game) {
    this.game = game;

    // map width and height in tiles
    this.xTotalTiles = 500;
    this.yTotalTiles = 500;
    
    // total amount of tiles
    this.totalTiles = this.xTotalTiles * this.yTotalTiles;

    // single tile width and height in pixels
    this.tileWidth = 50;
    this.tileHeight = 50;

    // get the width and height of the map in total pixels
    this.pixelWidth = this.xTotalTiles * this.tileWidth;
    this.pixelHeight = this.yTotalTiles * this.tileHeight;

    // stores the data about what exists at a particular position
    this.mapArray = [];

    // keep track of visible tiles
    this.visibleTilesPerDirection = 8;
    this.visibleTileArray = [];

    // tile util needs to know:
    //  width/height of a tile in pixels
    //  x / y total tile length
    this.TileUtil = new TileUtil({
      tileWidth: this.tileWidth,
      tileHeight: this.tileHeight,
      xMax: this.xTotalTiles.toString().length,
      yMax: this.yTotalTiles.toString().length,
    });

    // generate the map
    this.generateMap();
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
   * Generates empty arrays the size of the map
   * Map tiles get created as needed when they are visible
   *
   * @memberof Map
   */
  generateMap() {
    // create a map array the length of the total tiles
    // start a -1. Any tile that tries reference that position
    // in the map array will create the "not a tile" tile...
    for (let i = -1; i < this.totalTiles; i++) {
      this.mapArray[i] = -1;
    }

    // stores references to indexes in the tile array
    for (let i = 0; i < this.visibleTilesPerDirection * this.visibleTilesPerDirection; i++) {
      this.visibleTileArray[i] = -1;
    }

    // calculate the first set of visible tiles
    // tiles get created here
    this.calculateVisibleTiles(0, 0);
  }

  draw(Canvas) {
    if (this.needsUpdate) {
      for (var i = 0; i < this.visibleTileArray.length; i++) {
        Canvas.drawTile(this.visibleTileArray[i]);
      }
    }
  }

  drawShadows() {
    // get the origin
    const scene = this.game.scenes[this.game.currentScene];
    const origin = { x: scene.hero.x, y: scene.hero.y };

    // get the shadow objects
    const blocks = [];
    for (var i = 0; i < this.visibleTileArray.length; i++) {
      const tile = this.visibleTileArray[i];
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
  calculateVisibleTiles(x, y) {
    // signal to the scene that we need to draw the visible tiles
    // TODO: Look into capturing this x,y and setting it as a focus point to be used when drawing shadows??
    // TODO: Streamline the drawing logic, it's getting tangled up and convoluted
    
    // get the pixel to tile number
    // TODO: Don't proceed if the tileX/tileY is the same as the last time this was called
    const tileX = Math.round(x / this.tileWidth);
    const tileY = Math.round(y / this.tileHeight);

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
        if ( -1 === this.mapArray[mapIndex] ) {
          const tile = this.TileUtil.create({
            x: i,
            y: j,
          });
          this.mapArray[mapIndex] = tile;
        }

        // add the unpacked version of the tile to the visible tile array
        this.visibleTileArray[visibleIndex++] = this.TileUtil.unpack(this.mapArray[mapIndex]);
      }
    }

    this.needsUpdate = true;
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
    for (let i = 0; i < this.visibleTileArray.length; i++) {
      const tile = this.visibleTileArray[i];
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
