import MapBaseClass from './MapBaseClass';
import TileUtil from './TileUtil';
import TerrainUtil from './TerrainUtil';
import ItemUtil from './ItemUtil';
import Characters from './Characters/index';
import Shadows from './Shadows';

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
 *  Map has a property MainCharacter which is a reference to a character
 *  in the character array, and is controlled by user input
 *
 *  Map has a property Camera
 *    The Camera contains a focal point which is used to
 *    calculate pixel offsets when drawing map objects
 *
 */
class Map extends MapBaseClass {
  init() {
    this.Tile = new TileUtil(this.game);
    this.Terrain = new TerrainUtil(this.game);
    this.Items = new ItemUtil(this.game);
    this.Characters = new Characters(this.game, this);

    // stores the data about what exists at a particular position
    this.mapArray = [];

    // stores the objects on the current map
    this.objectArray = [];

    // keep track of visible tiles
    this.visibleTilesPerDirection = 16;
    this.visibleTileArray = [];
    this.visibleTileX = 0;
    this.visibleTileY = 0;

    // create the main character
    this.createHero();

    // and some random characters
    for (var i = 0; i < 10; i++) {
      this.Characters.generateRandom();
    }

    // put them in random locations on the map
    for (var i = 0; i < this.Characters.array.length; i++) {
      this.moveObjectToRandomLocation(this.Characters.array[i], false);
    }

    // debug mode on
    this.debug = true;
  }

  /**
   * TODO: assign the hero as a member of the character array
   *
   * @memberof Map
   */
  createHero() {
    this.heroId = this.Characters.create('hero');
    
    this.changeHero(this.heroId);

    // set focus to hero
    this.Canvas.Camera.x = this.hero.x;
    this.Canvas.Camera.y = this.hero.y;
    this.Canvas.Camera.setFocus(this.hero);
  }

  changeHero(id) {
    this.heroId = id;

    if (id >= this.Characters.array.length) {
      this.heroId = 0;
    }

    this.hero = this.Characters.getById(this.heroId);

    // set focus to hero
    this.Canvas.Camera.x = this.hero.x;
    this.Canvas.Camera.y = this.hero.y;
    this.Canvas.Camera.setFocus(this.hero);

    this.needsUpdate = true;
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

      // draw the characters
      for (var i = 0; i < this.Characters.array.length; i++) {
        const character = this.Characters.array[i];
        character.draw(Canvas);
      }

      // draw the shadows
      this.drawShadows();

      if (this.debug) {	
        Canvas.pushDebugText('hero.id', `Hero.id: ${this.hero.id}`);	
        Canvas.pushDebugText('hero.maxSpeed', `Hero.maxSpeed: ${this.hero.maxSpeed}`);	
      }
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
    const origin = { x: this.hero.x, y: this.hero.y };

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
   * Gets a random x/y coord
   *
   * @memberof Hero
   */
  moveObjectToRandomLocation(object, needsUpdate = true) {
    // get random pixel coordinate
    const { x, y } = this.getRandomPixelCoordinate();

    // calculate visible tiles so we can check for collisions
    this.calculateVisibleTiles(x, y);

    // check if blocking, try again if so
    if (this.getCollision(x, y)) {
      return this.moveObjectToRandomLocation(object, needsUpdate);
    }

    // clear existing movements
    clearTimeout(object.targetXTimer);
    clearTimeout(object.targetYTimer);
    object.targetX = x;
    object.targetY = y;
    object.x = x;
    object.y = y;

    // extra handling if it is the hero
    if (this.heroId === object.id) {
      // set the camera focus
      this.Canvas.Camera.setFocus({ x, y }, true);

      // tell the map to redraw
      this.needsUpdate = needsUpdate;
    }
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
    if (x2 > this.xTiles) {
      x2 = this.xTiles;
    }
    if (y1 < 1) {
      y1 = 0;
    }
    if (y2 > this.yTiles) {
      y2 = this.yTiles;
    }

    // create visible tile array from the boundaries
    this.visibleTileArray = [];
    let visibleIndex = 0;
    for (let j = y1; j < y2; j++) {
      for (let i = x1; i < x2; i++) {
        // get the map array and visible array indexes
        const mapIndex = this.Tile.convertPosToIndex(i, j);

        // if the map array value is -1
        // then it has not been visible yet
        // create a tile at that index
        if (typeof this.mapArray[mapIndex] === 'undefined') {
          const tile = this.Tile.create();
          this.mapArray[mapIndex] = tile;
        }

        // add the x/y data to the object
        const visibleTile = this.Tile.unpack(this.mapArray[mapIndex]);
        visibleTile.x = i;
        visibleTile.y = j;
        visibleTile.xPixel = i * this.tileWidth;
        visibleTile.yPixel = j * this.tileHeight;
        visibleTile.width = this.tileWidth;
        visibleTile.height = this.tileHeight;

        // add the unpacked version of the tile to the visible tile array
        this.visibleTileArray[visibleIndex++] = [visibleTile];
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
      || x2 > this.pixelWidth
      || y2 > this.pixelHeight
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

  handleInput(Keyboard) {
    if (this.debug) {
      if (Keyboard.active.tab) {
        const newId = this.heroId + 1;
        this.changeHero(newId);
        Keyboard.cooldown(200);
      }
    }

    this.hero.handleInput(Keyboard);
  }
}

export default Map;
