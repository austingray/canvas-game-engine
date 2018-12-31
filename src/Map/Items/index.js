import MapBaseClass from '../MapBaseClass';
import itemList from './itemList.js';

class Items extends MapBaseClass {
  init() {
    // holds all items currently on the map
    this.array = [];

    for (var i = 0; i < 100; i++) {
      const tileCoords = this.getRandomTileCoordinate();
      const { x: xTile, y: yTile } = tileCoords;
      const item = Object.assign({}, itemList[0], { 
        x: xTile * this.tileWidth,
        y: yTile * this.tileHeight,
      });
      this.array.push(item);
    }
  }

  draw(Canvas) {
    for (var i = 0; i < this.array.length; i++) {
      const item = this.array[i];
      if (Canvas.Camera.inViewport(item.x, item.y, item.x + item.width, item.y + item.height)) {
        item.draw(Canvas);
      }
    }
  }
}

export default Items;
