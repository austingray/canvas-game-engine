const tileTypes = [
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

/**
 * Provides utility methods for tiles
 *
 * @class TileUtil
 */
class TileUtil {
  /**
   * Creates an instance of TileUtil.
   * @param {number} [tileInt=0]
   * @memberof TileUtil
   */
  constructor(args) {
    // width of tiles in pixels
    this.tileWidth = args.tileWidth;
    this.tileHeight = args.tileHeight;

    // max x / y positions
    this.xMax = args.xMax;
    this.yMax = args.yMax;

    // define substr positions for extracting tile data
    this.substr = {
      type: 1,
      blocking: 2,
      light: 3,
      shadow: 4,
      x: 5,
      y: 5 + this.xMax,
    };
  }

  /**
   * Creates a map tile
   *
   * @param {*} args
   * @returns
   * @memberof TileUtil
   */
  create(args) {
    // defaults
    let type = 0;
    let blocking = 0;
    let light = 0;
    let shadow = 0;

    // randomize the tile type
    let random = Math.random();
    if (random > .1) {
      type = 0; // grass
    } else if (random > .08) {
      type = 1 // water;
      blocking = 1;
    } else {
      type = 2; // rock
      blocking = 1;
      shadow = 1;
    }

    // left pad x so tiles are consistent lengths
    let xString = args.x += '';
    while (xString.length < this.xMax) {
      xString = '0' + xString;
    }

    // left pad y so tiles are consistent lengths
    let yString = args.y += '';
    while (yString.length < this.yMax) {
      yString = '0' + yString;
    }

    // create and return the string
    const string = '1' + type + '' + blocking + '' + light + '' + shadow + '' + xString + '' + yString + '';
    return Number(string);
  }

  /**
   * Converts a packed tile integer into a verbose object
   *
   * @param {*} int
   * @returns
   * @memberof TileUtil
   */
  unpack(int) {
    // convert the int to a string
    const raw = this.toString(int);

    // get the properties
    const type = tileTypes[raw.substr(this.substr.type, 1)].type;
    const blocking = Number(raw.substr(this.substr.blocking, 1)) === 1;
    const light = Number(raw.substr(this.substr.light, 1)) === 1;
    const shadow = Number(raw.substr(this.substr.shadow, 1)) === 1;
    const x = Number(raw.substr(this.substr.x, this.xMax));
    const y = Number(raw.substr(this.substr.y, this.yMax));
    const xPixel = x * this.tileWidth;
    const yPixel = y * this.tileHeight;
    const width = this.tileWidth;
    const height = this.tileHeight;

    const tile = {
      type,
      blocking,
      light,
      shadow,
      x,
      y,
      xPixel,
      yPixel,
      width,
      height,
    };

    return tile;
  }

  /**
   * Converts an int to string
   *
   * @param {*} int
   * @returns
   * @memberof TileUtil
   */
  toString(int) {
    return int + "";
  }

  /**
   * Get the type integer
   *
   * @returns {integer} type
   * @memberof TileUtil
   */
  typeInt(int) {
    return Number(this.toString(int).substr(this.substr.type, 1));
  }

  /**
   * Get the human readable tile type
   *
   * @returns
   * @memberof TileUtil
   */
  typeText(int) {
    const index = this.typeInt(int);
    return tileTypes[index].type;
  }

  /**
   * Get the X map position
   *
   * @returns
   * @memberof TileUtil
   */
  x(int) {
    const x = Number(this.toString(int).substr(this.substr.x, this.xMax));
    return x;
  }

  /**
   * * Get the Y map position
   *
   * @returns
   * @memberof TileUtil
   */
  y(int) {
    const y = Number(this.toString(int).substr(this.substr.y, this.yMax));
    return y;
  }

  /**
   * Check if the tile is blocking
   *
   * @returns {boolean} is blocking
   * @memberof TileUtil
   */
  blocking(int) {
    return Number(this.toString(int).substr(this.substr.blocking, 1)) === 1;
  }

  /**
   * Check if the tile casts a shadow
   *
   * @returns
   * @memberof TileUtil
   */
  shadow(int) {
    return Number(this.toString(int).substr(this.substr.shadow, 1)) === 1;
  }
}

export default TileUtil;