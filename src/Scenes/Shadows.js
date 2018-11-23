class Shadows {
  constructor(Canvas, startPos, objects) {
    this.Canvas = Canvas;

    // where the light will emit from
    this.origin = {
      x: startPos.x,
      y: startPos.y,
    };

    // get all blocking objects
    this.blocks = [];
    this.lights = [];
    objects.forEach(object => {
      const obj = {
        x1: object.x,
        y1: object.y,
        x2: object.x + object.width,
        y2: object.y + object.height,
        width: object.width,
        height: object.height,
      };

      if (object.shadow === true) {
        this.blocks.push(obj);
      }

      if (object.light === true) {
        this.lights.push(obj);
      }
    });

    this.ctx = this.Canvas.shadowLayer.context;
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
      gradient.addColorStop(0, 'rgba(0, 0, 0, .8)');
      gradient.addColorStop(0.9, 'rgba(0, 0, 0, 0');
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(
        light.x1 + offsetX - 100 + light.width / 2,
        light.y1 + offsetY - 100 + light.height / 2,
        200,
        200
      );
    });

    this.ctx.globalCompositeOperation = 'source-over';
    
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.strokeStyle = 'red';
    this.ctx.lineWidth = '1px';
    this.blocks.forEach(pos => {
      // get all 4 corners
      const points = [
        { x: pos.x1, y: pos.y1 },
        { x: pos.x2, y: pos.y1 },
        { x: pos.x1, y: pos.y2 },
        { x: pos.x2, y: pos.y2 },
      ];

      // calculate the angle of each line
      const angles = points.map(point => Object.assign({}, point, {
        angle: Math.atan2(point.y - this.origin.y, point.x - this.origin.x) * 180 / Math.PI,
      }));

      // get the min and max angles
      let min = 0
      let max = 0;
      angles.forEach((obj, i) => {
        if (obj.angle < angles[min].angle) {
          min = i;
        }

        if (obj.angle > angles[max].angle) {
          max = i;
        }
      });
      const drawAngles = [angles[min], angles[max]];
      
      drawAngles.forEach((obj, i) => {
        drawAngles[i].bounds = this.findNewPoint(obj.angle, 1000);
      });

      // connect the closest and furthest
      this.ctx.moveTo(drawAngles[0].bounds.x + offsetX, drawAngles[0].bounds.y + offsetY);
      this.ctx.lineTo(drawAngles[1].bounds.x + offsetX, drawAngles[1].bounds.y + offsetY);
      this.ctx.lineTo(drawAngles[1].x + offsetX, drawAngles[1].y + offsetY);
      this.ctx.lineTo(drawAngles[0].x + offsetX, drawAngles[0].y + offsetY);
      this.ctx.lineTo(drawAngles[0].bounds.x + offsetX, drawAngles[0].bounds.y + offsetY);
    });
    this.ctx.closePath();
    this.ctx.fill();

    // clip blocks
    // this.ctx.globalCompositeOperation = 'destination-out';
    // this.ctx.fillStyle = 'black';
    // this.blocks.forEach(block => this.ctx.fillRect(block.x1 + offsetX, block.y1 + offsetY, block.width, block.height));
  }

  findNewPoint(angle, distance) {
    var result = {};

    const x = this.origin.x;
    const y = this.origin.y;

    result.x = Math.round(Math.cos(angle * Math.PI / 180) * distance + x);
    result.y = Math.round(Math.sin(angle * Math.PI / 180) * distance + y);

    return result;
  }
}

export default Shadows;
