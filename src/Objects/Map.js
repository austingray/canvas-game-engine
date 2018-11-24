import MapTile from './MapTile';
import Shadows from './Shadows';

class Map {
  constructor(args, game) {
    this.game = game;

    // tiles that will be seen on this map
    this.tileTypes = [
      {
        id: 1,
        type: 'grass',
        blocking: false,
        shadow: false,
        light: false,
      },
      {
        id: 2,
        type: 'water',
        blocking: true,
        shadow: false,
        light: false,
      },
      {
        id: 3,
        type: 'rock',
        blocking: true,
        shadow: true,
        light: false,
      },
    ];

    // objects that will be seen on this map
    this.objects = [
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

    // the object array
    this.objectArray = [];

    // the tile array
    this.tileArray = [];

    // map width and height in tiles
    this.xTotalTiles = 500;
    this.yTotalTiles = 500;

    // single tile width and height in pixels
    this.tileWidth = 50;
    this.tileHeight = 50;

    // get the width and height of the map in total pixels
    this.pixelWidth = this.xTotalTiles * this.tileWidth;
    this.pixelHeight = this.yTotalTiles * this.tileHeight;

    this.generateMap();

    // keep track of visible tiles
    this.visibleTilesPerDirection = 8;
    this.visibleTilePos = { x: null, y: null }
    this.visibleTileArray = [];
    this.updateVisibleTiles(0, 0);

    // draw the map and convert to base64
    // this.tileArray.forEach(tile => game.Canvas.drawTile(tile));
    // this.base64encoded = game.Canvas.element.toDataURL();
    // this.image = new Image();
    // this.image.src = this.base64encoded;
  }

  // generates a random map
  generateMap() {
    // generate the tiles and objects
    for (let i = 0; i < this.xTotalTiles; i++) {
      const row = [];
      for (let j = 0; j < this.yTotalTiles; j++) {
        let random = Math.random();
        let tileIndex = 0;
        if (random > .1) {
          // grass
          tileIndex = 0;
        } else if (random > .08) {
          // water
          tileIndex = 1;
        } else {
          // rock
          tileIndex = 2;
        }
        const tile = new MapTile(Object.assign({}, this.tileTypes[tileIndex], {
          x: i * this.tileWidth,
          y: j * this.tileHeight,
          width: this.tileWidth,
          height: this.tileHeight,
        }));

        // generate objects
        random = Math.random();
        if (!tile.blocking && random < .05) {
          const x = tile.x; // + random * tile.width;
          const y = tile.y; // + random * tile.height;
          let objectIndex = random > .3 ? 0 : 1;
          const object = new MapTile(Object.assign({}, this.objects[objectIndex], { x, y }));
          tile.objects.push(object);
        }

        row.push(tile);
      }
      this.tileArray.push(row);
    }
  }

  // draw each tile
  draw(Canvas) {
    this.visibleTileArray.flat().forEach(tile => tile.draw(this.game.Canvas));
  }

  drawShadows() {
    const scene = this.game.scenes[this.game.currentScene];
    const origin = { x: scene.hero.x, y: scene.hero.y };
    const shadows = new Shadows(this.game.Canvas, origin, this.visibleTileArray.flat());
    shadows.draw();
  }

  /**
   * Updates the visible tile array based off x, y coords
   *
   * @param {*} x
   * @param {*} y
   * @memberof Map
   */
  updateVisibleTiles(x, y) {
    this.needsUpdate = true;
    // TODO: Look into capturing this x,y and setting it as a focus point to be used when drawing shadows??
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

    // get a local array
    let x1 = tileX - this.visibleTilesPerDirection;
    let x2 = tileX + this.visibleTilesPerDirection;
    let y1 = tileY - this.visibleTilesPerDirection;
    let y2 = tileY + this.visibleTilesPerDirection;

    // clamp
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

    // create visible tile array
    this.visibleTileArray = [];
    for (let i = y1; i < y2; i++) {
      let row = [];
      for (let j = x1; j < x2; j++) {
        const tile = this.tileArray[j][i];
        row.push(tile);
      }
      this.visibleTileArray.push(row);
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
    for (let i = 0; i < this.visibleTileArray.length; i++) {
      const row = this.visibleTileArray[i];
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
