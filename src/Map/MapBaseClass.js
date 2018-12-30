/**
 * Contains descriptive properties of the map for all map classes to extend from
 *
 * @class MapBaseClass
 */
class MapBaseClass {
  constructor(game, map) {
    this.game = game;
    this.map = map;
    this.Canvas = game.Canvas;
    this.Objects = game.Objects;
    
    // map and tile description
    this.xTiles = 10;
    this.yTiles = 10;
    this.totalTiles = this.xTiles * this.yTiles;
    this.tileWidth = 50;
    this.tileHeight = 50;
    this.pixelWidth = this.xTiles * this.tileWidth;
    this.pixelHeight = this.yTiles * this.tileHeight;

    this.init();
  }

  /**
   * Gets a random tile coordinate
   *
   * @returns
   * @memberof MapBaseClass
   */
  getRandomTileCoordinate() {
    // get random tile coords
    const x = Math.round(Math.random() * this.xTiles);
    const y = Math.round(Math.random() * this.yTiles);

    return { x, y }
  }

  /**
   * Gets a random pixel coordinate
   *
   * @returns
   * @memberof MapBaseClass
   */
  getRandomPixelCoordinate() {
    // get random pixel coords
    const x = Math.round(Math.random() * this.pixelWidth);
    const y = Math.round(Math.random() * this.pixelHeight);

    return { x, y };
  }

  /**
   * Subclass constructor
   *
   * @memberof MapBaseClass
   */
  init() {
    // 
  }
}

export default MapBaseClass;
