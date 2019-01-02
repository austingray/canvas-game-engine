class Shadows {
  constructor(Canvas, origin, objects) {
    this.Canvas = Canvas;

    // set the context to the shadow layer
    this.ctx = this.Canvas.shadowLayer.context;

    // origin point where lighting is based off of, which is always the hero x/y
    this.origin = {
      x: origin.x + 25,
      y: origin.y + 25,
    };

    // get all blocking objects
    this.blocks = [];
    this.lights = [];

    for (let i = 0; i < objects.length; i++) {
      const object = objects[i];
      const x1 = object.x;
      const y1 = object.y;
      const block = {
        x1: object.x,
        y1: object.y,
        x2: object.x + object.width,
        y2: object.y + object.height,
        width: object.width,
        height: object.height,
      };

      if (object.shadow) {
        this.blocks.push(block);
      }

      // TODO: Add light handling
      if (object.light === true) {
        this.lights.push(block);
      }
    }
  }

  draw() {
    this.Canvas.shadowLayer.clear();

    // get the camera offset
    const offsetX = this.Canvas.Camera.offsetX;
    const offsetY = this.Canvas.Camera.offsetY;

    this.ctx.globalCompositeOperation = 'source-over';

    // gradient 1
    const grd = this.ctx.createRadialGradient(
      this.origin.x + offsetX,
      this.origin.y + offsetY,
      0,
      this.origin.x + offsetX,
      this.origin.y + offsetY,
      360
    );
    
    grd.addColorStop(0, 'rgba(0, 0, 0, .1)');
    grd.addColorStop(0.9, 'rgba(0, 0, 0, .5');
    this.ctx.fillStyle = grd;
    this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

    // gradient 2
    this.ctx.globalCompositeOperation = 'source-over';
    const grd2 = this.ctx.createRadialGradient(
      this.origin.x + offsetX,
      this.origin.y + offsetY,
      0,
      this.origin.x + offsetX,
      this.origin.y + offsetY,
      360
    );
    grd2.addColorStop(0, 'rgba(0, 0, 0, .1)');
    grd2.addColorStop(0.9, 'rgba(0, 0, 0, 1');
    this.ctx.fillStyle = grd2;
    this.ctx.fillRect(0, 0, this.Canvas.width, this.Canvas.height);

    // lights
    this.ctx.globalCompositeOperation = 'destination-out';
    this.lights.forEach(light => {
      const gradient = this.ctx.createRadialGradient(
        light.x1 + offsetX + light.width / 2,
        light.y1 + offsetY + light.height / 2,
        0,
        light.x1 + offsetX + light.width / 2,
        light.y1 + offsetY + light.height / 2,
        100
      );
      gradient.addColorStop(0, `rgba(0, 0, 0, ${Math.random() + .7})`);
      gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        light.x1 + offsetX - 100 + light.width / 2,
        light.y1 + offsetY - 100 + light.height / 2,
        200,
        200
      );
    });

    // object shadows
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = '1px';

    for (let i = 0; i < this.blocks.length; i++) {
      const pos = this.blocks[i];

      // get all 4 corners
      const points = [
        { x: pos.x1, y: pos.y1 },
        { x: pos.x2, y: pos.y1 },
        { x: pos.x1, y: pos.y2 },
        { x: pos.x2, y: pos.y2 },
      ];

      // this.drawShadows(points, pos, offsetX, offsetY);
    }
  }

  drawShadows(points, pos, offsetX, offsetY) {
    
    this.ctx.globalCompositeOperation = 'source-over';
    
    // calculate the angle of each line
    const raw = points.map(point => Object.assign({}, point, {
      angle: this.calculateAngle(point),
      distance: this.calculateDistance(point),
    }));

    const minMaxDistance = 1000;

    const angles = raw.slice(0).sort((a, b) => {
      // sort by angle
      if (b.angle > a.angle) {
        return 1;
      }

      if (b.angle < a.angle) {
        return -1;
      }

      return 0;
    });

    const furthest = raw.slice(0).sort((a, b) => {
      // sort by angle
      if (b.distance > a.distance) {
        return 1;
      }

      if (b.distance < a.distance) {
        return -1;
      }

      return 0;
    });
    
    // TODO: Don't read this next block of code
    // TODO: it's just a bunch of spaghett
    this.ctx.fillStyle = `rgb(0, 0, 0)`;
    this.ctx.beginPath();
    if (
      this.origin.x > pos.x2
      && this.origin.y > pos.y1
      && this.origin.y < pos.y2
    ) {
      let min = this.calculatePoint(angles[2].angle, minMaxDistance);
      let max = this.calculatePoint(angles[1].angle, minMaxDistance);
      this.ctx.moveTo(angles[1].x + offsetX, angles[1].y + offsetY);
      this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
      this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
      this.ctx.lineTo(angles[2].x + offsetX, angles[2].y + offsetY);
      if (this.origin.y > pos.y1 + pos.width / 2) {
        this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
        this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
      } else {
        this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
        this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
      }
      this.ctx.lineTo(angles[1].x + offsetX, angles[1].y + offsetY);
    } else {
      if (
        this.origin.y > pos.y1
        && this.origin.y < pos.y2
      ) {
        // handle being left of the object
        const max = this.calculatePoint(angles[0].angle, minMaxDistance);
        const min = this.calculatePoint(angles[3].angle, minMaxDistance);
        this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
        this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
        this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
        this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
        if (this.origin.y > pos.y1 + pos.width / 2) {
          this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
        } else {
          this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
          this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
        }
        this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
      } else if ( // above/beneath object
        this.origin.x > pos.x1
        && this.origin.x < pos.x2
      ) {
        // below the object
        if (this.origin.y > pos.y1) {
          // below the object
          const max = this.calculatePoint(angles[0].angle, minMaxDistance);
          const min = this.calculatePoint(angles[3].angle, minMaxDistance);
          this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
          this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
          this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
          this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
          if (this.origin.x > pos.x1 + pos.width / 2) {
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
          } else {
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          }
          this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
        } else { // above the object
          // below the object
          const max = this.calculatePoint(angles[0].angle, minMaxDistance);
          const min = this.calculatePoint(angles[3].angle, minMaxDistance);
          this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
          this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
          this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
          this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
          if (this.origin.x > pos.x1 + pos.width / 2) {
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
          } else {
            this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
            this.ctx.lineTo(furthest[1].x + offsetX, furthest[1].y + offsetY);
          }
          this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
        }
      } else { // northwest of object
        const max = this.calculatePoint(angles[0].angle, minMaxDistance);
        const min = this.calculatePoint(angles[3].angle, minMaxDistance);
        this.ctx.moveTo(angles[0].x + offsetX, angles[0].y + offsetY);
        this.ctx.lineTo(max.x + offsetX, max.y + offsetY);
        this.ctx.lineTo(min.x + offsetX, min.y + offsetY);
        this.ctx.lineTo(angles[3].x + offsetX, angles[3].y + offsetY);
        this.ctx.lineTo(furthest[0].x + offsetX, furthest[0].y + offsetY);
        this.ctx.lineTo(angles[0].x + offsetX, angles[0].y + offsetY);
      }
    }
    this.ctx.closePath();
    this.ctx.fill();
  }

  /**
   * Calculates the angle between 2 points
   *
   * @param {*} point
   * @param {*} [origin={ x: this.origin.x, y: this.origin,y }]
   * @returns
   * @memberof Shadows
   */
  calculateAngle(point, origin = { x: this.origin.x, y: this.origin.y }) {
    return Math.atan2(point.y - origin.y, point.x - origin.x) * 180 / Math.PI;
  }

  /**
   * Calculates a new point given an angle, distance from, and starting point
   *
   * @param {*} angle
   * @param {*} distance
   * @returns {object} x, y
   * @memberof Shadows
   */
  calculatePoint(angle, distanceFrom, point = { x: this.origin.x, y: this.origin.y }) {
    return {
      x: Math.round(Math.cos(angle * Math.PI / 180) * distanceFrom + point.x),
      y: Math.round(Math.sin(angle * Math.PI / 180) * distanceFrom + point.y),
    };
  }

  /**
   * Calculate the distance between two points
   * AKA Pythagorean theorem
   *
   * @param {*} pos1
   * @param {*} pos2
   * @returns
   * @memberof Shadows
   */
  calculateDistance(pos1, pos2 = { x: this.origin.x, y: this.origin.y }) {
    const a = pos1.x - pos2.x;
    const b = pos1.y - pos2.y;

    // return the distance
    return Math.sqrt(a * a + b * b);
  }
}

export default Shadows;
