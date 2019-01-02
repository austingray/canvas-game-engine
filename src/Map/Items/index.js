import MapBaseClass from '../MapBaseClass';
import itemList from './itemList.js';

class Items extends MapBaseClass {
  init() {
    // holds all items currently on the map
    this.array = [];
    this.visible = [];

    // reference the item list
    this.itemList = itemList;
  }

  generateItems() {
    // generate items for the map
    for (var i = 0; i < this.totalTiles; i++) {
      for (var j = 0; j < this.itemList.length; j++) {
        const item = this.itemList[j];

        const shouldSpawn = item.spawnRate > Math.random();
        
        if (shouldSpawn) {
          let x, y;

          if (item.snapToGrid) {
            const tile = this.getRandomTileCoordinate();
            x = tile.x * this.tileWidth;
            y = tile.y * this.tileHeight
          } else {
            const coords = this.getRandomPixelCoordinate();
            x = coords.x;
            y = coords.y;
          }
          
          const Item = Object.assign({}, item, { x, y });
          if (typeof Item.createMesh !== 'undefined') {
            // create the three.js mesh for this object
            Item.createMesh();
          }

          this.array.push(Item);
        }
      }
    }
  }

  draw(Canvas) {
    for (var i = 0; i < this.visible.length; i++) {
      const item = this.visible[i];
      item.draw(Canvas);
    }
  }

  /**
   * Calculate visible characters
   *
   * @param {*} inViewport
   * @memberof Characters
   */
  calculateVisible() {
    const visible = [];

    for (var i = 0; i < this.array.length; i++) {
      const item = this.array[i];
      if (this.Canvas.Camera.inViewport(item.x, item.y, item.x + item.width, item.y + item.height)) {
        visible.push(item);

        if (typeof item.mesh !== 'undefined') {
          this.Canvas.Shadows.scene.add(item.mesh);
        }
      } else {
        if (typeof item.mesh !== 'undefined') {
          this.Canvas.Shadows.scene.remove(item.mesh);
        }
      }
    }

    this.visible = visible;
  }
}

export default Items;
