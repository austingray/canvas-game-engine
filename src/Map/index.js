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
    this.Mouse = this.game.Mouse;

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
    this.generateItems();
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
   * Generate items for the map
   *
   * @memberof Map
   */
  generateItems() {
    this.Items.generateItems();
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
   * Draws the map tiles and shawdows
   * only if the map needs an update
   *
   * @param {*} Canvas
   * @memberof Map
   */
  draw(Canvas) {
    //  TODO: after adding a lot of objects it is always going to "needsUpdate" - remove it
    if (this.needsUpdate) {
      // calculate everything that's visible
      this.calculateVisible();

      // draw the tiles
      for (var i = 0; i < this.visibleTileArray.length; i++) {
        const tile = this.visibleTileArray[i];
        Canvas.drawTile(tile);
      }

      // draw the items
      this.Items.draw(Canvas);

      // draw the characters
      this.Characters.draw(Canvas);

      // draw all 3d elements
      this.Canvas.draw3d();

      // this.Canvas.Shadows.draw(this.Canvas);
      // this.Canvas.Shadows2.draw();
      // this.Canvas.Objects.draw(this.Canvas);

      // draw the shadows
      this.drawShadows();

      // draw mouse
      // TODO: refactor/optimize this garbage
      const tilePixelX = Math.abs(this.Canvas.Camera.offsetX - this.Mouse.x + 25);
      const tilePixelY = Math.abs(this.Canvas.Camera.offsetY - this.Mouse.y + 25);
      const tileX = Math.round(tilePixelX / this.tileWidth);
      const tileY = Math.round(tilePixelY / this.tileHeight);

      // TODO: This is kind of crazy, but essentially we need to check if
      // tileX or tileY is a positive number. If it is a positive number it is out of bounds to the left or top
      // tileX or tileY has a negative value greater than -(this.tileWidth - 1), then it is out of bounds right or bottom
      // don't draw the mouse cursor if that is the case
      //
      // let tileX = Math.round(tilePixelX / this.tileWidth);
      // let tileY = Math.round(tilePixelY this.tileHeight);

      const mapArrayIndex = this.Tile.convertPosToIndex(tileX, tileY);
      const drawMouseX = tileX * this.tileWidth + this.Canvas.Camera.offsetX;
      const drawMouseY = tileY * this.tileHeight + this.Canvas.Camera.offsetY;

      let itemDebugText = `mouseItem: {}`;
      let charDebugText = `mouseCharacter: {}`;

      // mouse hover
      if (typeof this.mapArray[mapArrayIndex] !== 'undefined') {
        Canvas.drawMouse(
          drawMouseX,
          drawMouseY
        );

        // get mouse hovering tile info
        const tile = this.Tile.unpack(this.mapArray[mapArrayIndex]);
        const debugTile = Object.assign({}, tile, { x: tileX, y: tileY });
        Canvas.pushDebugText('mouseTile', `mouseTile: ${JSON.stringify(debugTile)}`);

        // get mouse hovering item info
        for (var i = 0; i < this.Items.visible.length; i++) {
          const item = this.Items.visible[i];
          const itemX = item.x - 25;
          const itemY = item.y - 25;
          if (this.pointIntersects(tilePixelX, tilePixelY, itemX, itemY, itemX + item.width, itemY + item.height)) {
            itemDebugText = `mouseItem: ${JSON.stringify(item)}`
            break;
          }
        }

        // get mouse hovering character info
        for (var i = 0; i < this.Characters.visible.length; i++) {
          const char = this.Characters.visible[i];
          const charX = char.x - 25;
          const charY = char.y - 25;
          if (this.pointIntersects(tilePixelX, tilePixelY, charX, charY, charX + char.width, charY + char.height)) {
            const debugChar = {
              id: char.id,
              x: char.x,
              y: char.y,
            }
            charDebugText = `mouseCharacter: ${JSON.stringify(debugChar)}`;
            break;
          }
        }
      }
      
      if (this.debug) {	
        Canvas.pushDebugText('mouseChar', charDebugText);
        Canvas.pushDebugText('mouseItem', itemDebugText);
        Canvas.pushDebugText('hero.id', `Hero.id: ${this.hero.id}`);	
        Canvas.pushDebugText('hero.maxSpeed', `Hero.maxSpeed: ${this.hero.maxSpeed}`);	
        Canvas.pushDebugText('visibleCharacters', `Visible Characters: ${this.Characters.visible.length}`);
        Canvas.pushDebugText('visibleItems', `Visible Items: ${this.Items.visible.length}`);
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
      if (
        object.shadow
        || object.light
      ) {
        blocks.push(object);
      }
    }

    // get and draw
    const shadows = new Shadows(this.game.Canvas, origin, blocks);
    shadows.draw();
  }

  /**
   * Calculates visible items
   *
   * @memberof Map
   */
  calculateVisible() {
    // calculate the visible tiles
    this.calculateVisibleTiles();

    // calculate the visible characters
    this.Characters.calculateVisible();

    // calculate the visible items
    this.Items.calculateVisible();
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

  /**
   * Tests if a point intersects an object
   *
   * @param {*} pX
   * @param {*} pY
   * @param {*} x1
   * @param {*} y1
   * @param {*} x2
   * @param {*} y2
   * @returns
   * @memberof Map
   */
  pointIntersects(pX, pY, x1, y1, x2, y2) {
    if (pX < x1) {
      return false;
    }

    if (pX > x2) {
      return false;
    }

    if (pY < y1) {
      return false;
    }

    if (pY > y2) {
      return false;
    }

    return true;
  }

  /**
   * Delegates input handling
   *
   * @param {*} Keyboard
   * @param {*} Mouse
   * @memberof Map
   */
  handleInput(Keyboard, Mouse) {
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
