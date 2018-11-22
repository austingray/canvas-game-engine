import ObjectCircle from './ObjectCircle';

class Hero extends ObjectCircle {
  init() {
    // allows keyboard input to the character
    this.allowInput = true;

    // if the hero can move in a certain direction
    // [ up, right, down, left ];
    this.canMove = [true, true, true, true];

    // handle character's directional velocity
    this.velocities = [0, 0, 0, 0];
    this.maxSpeed = 100; 
    this.rateOfIncrease = 1 + this.maxSpeed / 100;

    // set target x,y for easing the character movement
    this.targetX = this.x;
    this.targetY = this.y;
    this.targetXTimer;
    this.targetYTimer;

    // cooldown beteween movement
    this.inputCooldown = 30;
  }

  /**
   * Handles easing on the X axis
   *
   * @param {*} dir
   * @param {*} map
   * @memberof Hero
   */
  targetXTimerHandler(dir, map) {
    // clear the existing timer
    clearTimeout(this.targetXTimer);

    // get the difference between the current y and the target y
    const difference = Math.abs(this.x - this.targetX);

    // set a new timer
    this.targetXTimer = setTimeout(() => {
      // calculate what the new x should be
      const newX = dir === 'left'
        ? this.x - (difference / this.inputCooldown)
        : this.x + (difference / this.inputCooldown);

      // handle collision
      const collision = map.getCollision(newX, this.y, dir)

      if (collision) {
        this.targetX = this.x;
      } else {
        this.x = newX;
      }

      // calculate
      this.game.Canvas.Camera.setFocus({
        x: this.x,
        y: this.y,
      });

      // if we're not close enough to the target Y, keep moving
      if (difference > 1) {
        this.targetXTimerHandler(dir, map);
      }
    }, difference / this.inputCooldown)
  }

  /**
   * Handles easing on the Y axis
   *
   * @param {*} dir
   * @param {*} map
   * @memberof Hero
   */
  targetYTimerHandler(dir, map) {
    // clear the existing timer
    clearTimeout(this.targetYTimer);

    // get the difference between the current y and the target y
    const difference = Math.abs(this.y - this.targetY);

    // set a new timer
    this.targetYTimer = setTimeout(() => {
      // handle direction
      const newY = dir === 'up'
        ? this.y - (difference / this.inputCooldown)
        : this.y + (difference / this.inputCooldown);

      // handle collision
      const collision = map.getCollision(this.x, newY, dir);

      if (collision) {
        this.targetY = this.y
      } else {
        // update the y
        this.y = newY;
      }

      // calculate
      this.game.Canvas.Camera.setFocus({
        x: this.x,
        y: this.y,
      });

      // if we're not close enough to the target Y, keep moving
      if (difference > 1) {
        this.targetYTimerHandler(dir, map);
      }
    }, difference / this.inputCooldown)
  }

  /**
   * Handle input for the hero
   *
   * @param {*} activeKeys
   * @param {*} map
   * @returns
   * @memberof Hero
   */
  handleInput(Keyboard, map) {
    // bail if input is disabled
    if (!this.allowInput) {
      return;
    }

    // bail if no key press
    if (Keyboard.activeKeys.length === 0) {
      // cooldown velocities

      // velocity cooldown
      this.velocities = this.velocities.map((velocity) => {
        if (velocity > 0) {
          velocity = velocity - this.rateOfIncrease;
        }

        if (velocity < 0) {
          velocity = 0;
        }

        return velocity;
      });

      return;
    }

    // handle up
    if (Keyboard.dir.up) {
      this.velocities[0] = (this.velocities[0] + 1) * this.rateOfIncrease;
      if (this.velocities[0] > this.maxSpeed) {
        this.velocities[0] = this.maxSpeed;
      }

      // cancel opposite direction velocity
      this.velocities[2] = 0;

      // movement easing
      this.targetY = this.y - this.velocities[0];
      this.targetYTimerHandler('up', map);
      this.canMove[0] = 0;
    }

    // handle right
    if (Keyboard.dir.right) {
      this.velocities[1] = (this.velocities[1] + 1) * this.rateOfIncrease;
      if (this.velocities[1] > this.maxSpeed) {
        this.velocities[1] = this.maxSpeed;
      }
      
      // cancel opposite direction velocity
      this.velocities[3] = 0;

      // movement easing
      this.targetX = this.x + this.velocities[1];
      this.targetXTimerHandler('right', map);
      this.canMove[1] = 0;
    }

    // handle down
    if (Keyboard.dir.down) {
      this.velocities[2] = (this.velocities[2] + 1) * this.rateOfIncrease;
      if (this.velocities[2] > this.maxSpeed) {
        this.velocities[2] = this.maxSpeed;
      }

      // cancel opposite direction velocity
      this.velocities[0] = 0;

      // movement easing
      this.targetY = this.y + this.velocities[2];
      this.targetYTimerHandler('down', map);    
      this.canMove[2] = 0;
    }

    // handle left
    if (Keyboard.dir.left) {
      this.velocities[3] = (this.velocities[3] + 1) * this.rateOfIncrease;
      if (this.velocities[3] > this.maxSpeed) {
        this.velocities[3] = this.maxSpeed;
      }
      
      // cancel opposite direction velocity
      this.velocities[1] = 0;

      // movement easing
      this.targetX = this.x - this.velocities[3];
      this.targetXTimerHandler('left', map);
      this.canMove[3] = 0;
    }
    
    // set timeout to enable movement in the direction
    clearTimeout(this.keyboardCooldownTimer);
    const that = this;
    this.keyboardCooldownTimer = setTimeout(() => {
      this.canMove = [true, true, true, true]
    }, this.inputCooldown);
  }
}

export default Hero;
