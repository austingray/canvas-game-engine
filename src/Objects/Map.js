import MapTile from './MapTile';

class Map {
  constructor() {
    this.tiles = [];

    // used for offsetting the map to follow the hero
    this.x = this.y = 0;

    // get the width and height of the map in total pixels
    this.width = this.height = 50 * 50;

    // crude tile creation
    for (let i = 0; i < 50; i++) {
      for (let j = 0; j < 50; j++) {
        this.tiles.push(new MapTile(i * 50, j * 50));
      }
    }
  }

  // draw each tile
  draw(Canvas) {
    this.tiles.forEach(tile => tile.draw(Canvas));
  }
}

export default Map;
