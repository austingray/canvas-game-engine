import MapBaseClass from './MapBaseClass';
import Tiles from './Tiles';
import Items from './Items/index';
import Characters from './Characters/index';
import Shadows from './Shadows';

/**
 * @class Map
 * 
 *  Types of information stored in the Map class are
 *    - Tiles
 *    - Items
 *    - Characters
 *
 *  All of the above types are stored in their each respective array
 *  keyed by the map coordinates [ x + (y * xWidth)]
 *
 *  Map has a property hero which is a reference to a character
 *  in the character array, and is controlled by user input
 *
 */
class Map extends MapBaseClass {
  init() {
    // debug mode on
    this.debug = true;

    // class utilites
    this.Tile = new Tiles(this.game);
    this.Items = new Items(this.game);
    this.Characters = new Characters(this.game, this);

    // stores the data about what exists at a particular position
    this.mapArray = [];

    // keep track of visible tiles
    this.visibleTilesPerDirection = 16;
    this.visibleTileArray = [];
    this.visibleTileX = 0;
    this.visibleTileY = 0;

    this.generateCharacters();
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
        const tile = this.visibleTileArray[i];
        Canvas.drawTile(tile);
      }

      // draw the items
      this.Items.draw(Canvas);

      // draw the characters
      this.Characters.draw(Canvas);

      // draw the shadows
      this.drawShadows();

      if (this.debug) {	
        Canvas.pushDebugText('hero.id', `Hero.id: ${this.hero.id}`);	
        Canvas.pushDebugText('hero.maxSpeed', `Hero.maxSpeed: ${this.hero.maxSpeed}`);	

        let visibleCharacterIds = [];
        for (var i = 0; i < this.Characters.array.length; i++) {
          if (this.Characters.array[i].isVisible) {
            visibleCharacterIds.push(this.Characters.array[i].id);
          }
        }
        Canvas.pushDebugText('visibleCharacters', `Visible Characters: ${JSON.stringify(visibleCharacterIds)}`);
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

    const objectsToCheck = [
      // ...this.visibleTileArray,
      ...this.Items.array,
      ...this.Characters.array,
    ];

    // get the shadow objects
    const blocks = [];
    for (var i = 0; i < objectsToCheck.length; i++) {
      const object = objectsToCheck[i];
      if (object.shadow) {
        blocks.push(object);
      }
    }

    // get and draw
    const shadows = new Shadows(this.game.Canvas, origin, blocks);
    shadows.draw();
  }

  /**
   * Generates the characters on the map and sets the player's character
   *
   * @memberof Map
   */
  generateCharacters() {
    // and some random characters
    for (var i = 0; i < 100; i++) {
      this.Characters.generateRandom();
    }

    // put them in random locations on the map
    for (var i = 0; i < this.Characters.array.length; i++) {
      this.moveObjectToRandomLocation(this.Characters.array[i], false);
    }

    // set the hero to the first generated character
    this.setHeroCharacter(0);
  }

  /**
   * Changes the player's hero character to the specified id
   *
   * @param {*} id
   * @memberof Map
   */
  setHeroCharacter(id) {
    this.heroId = id;

    if (id >= this.Characters.array.length) {
      this.heroId = 0;
    }

    // change previous hero to npc
    if (typeof this.hero !== 'undefined') {
      this.hero.isPlayer = false;
      this.hero.doMovement();
    }

    this.hero = this.Characters.getById(this.heroId);
    this.hero.isPlayer = true;

    // set focus to hero
    this.Canvas.Camera.x = this.hero.x;
    this.Canvas.Camera.y = this.hero.y;
    this.Canvas.Camera.setFocus(this.hero);

    this.needsUpdate = true;
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
        visibleTile.xTile = i;
        visibleTile.yTile = j;
        visibleTile.x = i * this.tileWidth;
        visibleTile.y = j * this.tileHeight;
        visibleTile.width = this.tileWidth;
        visibleTile.height = this.tileHeight;

        // add the unpacked version of the tile to the visible tile array
        this.visibleTileArray[visibleIndex++] = visibleTile;
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
  getCollision(x, y) {
    // hardcode the hero
    const x1 = x + 10;
    const x2 = x + 40;
    const y1 = y + 10;
    const y2 = y + 40;
    
    // map boundaries
    if (
      x1 < 0
      || y1 < 0
      || x2 > this.pixelWidth
      || y2 > this.pixelHeight
    ) {
      return true;
    }

    const objectsToCheck = [
      ...this.visibleTileArray,
      ...this.Items.array,
    ];

    // tile blocking
    for (let i = 0; i < objectsToCheck.length; i++) {
      const object = objectsToCheck[i];
      if (object.blocking) {
        if (
          x2 > object.x
          && x1 < object.x + object.width
          && y2 > object.y
          && y1 < object.y + object.height
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
        this.setHeroCharacter(newId);
        Keyboard.cooldown(200);
      }
    }

    this.hero.handleInput(Keyboard);
  }
}

export default Map;
