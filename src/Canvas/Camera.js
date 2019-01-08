/**
 * Calculates drawing x/y offsets
 *
 * @class Camera
 */
class Camera {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.x = width / 2;
    this.y = height / 2;
    this.offsetX = 0;
    this.offsetY = 0;
  }

  /**
   * Sets camera focus on an object
   *
   * @param {*} object
   * @param {boolean} [centered=false]
   * @memberof Camera
   */
  setFocus(object, centered = false) {
    // if we're at the right edge of the viewport
    if (
      this.x > (this.width * .6) - this.offsetX
      && object.x >= this.x
    ) {
      this.screenPushX = this.width * .6;
      this.offsetX = this.screenPushX - this.x;
    }

    // left edge
    if (
      this.x < (this.width * .4) - this.offsetX
      && object.x <= this.x
    ) {
      this.screenPushX = this.width * .4;
      this.offsetX = this.screenPushX - this.x;
    }

    // top edge
    if (
      this.y < (this.height * .4) - this.offsetY
      && object.y <= this.y
    ) {
      this.screenPushY = this.height * .4;
      this.offsetY = this.screenPushY - this.y;
    }

    // bottom edge
    if (
      this.y > (this.height * .6) - this.offsetY
      && object.y >= this.y
    ) {
      this.screenPushY = this.height * .6;
      this.offsetY = this.screenPushY - this.y;
    }

    if (centered) {
      this.x = object.x;
      this.y = object.y;
      this.screenPushX = this.width / 2;
      this.screenPushY = this.height / 2;
      // would floor be more efficient here?
      this.offsetX = Math.round(this.width / 2 - this.x);
      this.offsetY = Math.round(this.height / 2  - this.y);
    } else {
      // convert floats to integers
      // TODO: Rounding these numbers removes gridlines from the tiles but also produces shaky player movement
      this.offsetX = Math.round(this.offsetX);
      this.offsetY = Math.round(this.offsetY);

      // this.offsetX = this.offsetX;
      // this.offsetY = this.offsetY;
    }

    // update this
    this.x = object.x;
    this.y = object.y;
  }

  /**
   * Checks if a set of coords is inside the camera viewport
   * Note: the viewport is not 1:1 with what is visible, it is larger
   *
   * @param {*} x1
   * @param {*} y1
   * @param {*} x2
   * @param {*} y2
   * @returns
   * @memberof Camera
   */
  inViewport(x1, y1, x2, y2) {
    // calc the viewport
    const vpX1 = this.x - this.width;
    const vpX2 = this.x + this.width;
    const vpY1 = this.y - this.height;
    const vpY2 = this.y + this.height;

    // if in viewport
    if (
      x2 > vpX1
      && x1 < vpX2
      && y2 > vpY1
      && y1 < vpY2
    ) {
      return true;
    }

    // if not in viewport
    return false;
  }
}

export default Camera;
