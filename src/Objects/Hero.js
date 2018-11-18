import ObjectCircle from './ObjectCircle';

class Hero extends ObjectCircle {
  init() {
    // allows keyboard input to the character
    this.allowInput = true;
    this.canMoveUp = true;
    this.canMoveRight = true;
    this.canMoveDown = true;
    this.canMoveLeft = true;

    // handle character's directional velocity
    this.velocities = [0, 0, 0, 0];
    this.maxSpeed = 30;
    this.rateOfIncrease = 1 + this.maxSpeed / 100;

    // set target x,y for easing the character movement
    this.targetX = this.x;
    this.targetY = this.y;
    this.targetXTimer;
    this.targetYTimer;

    // cooldown beteween movement
    this.inputCooldown = 30;
  }

  targetYTimerHandler(dir) {
    // clear the existing timer
    clearTimeout(this.targetYTimer);

    // get the difference between the current y and the target y
    const difference = Math.abs(this.y - this.targetY);

    // set a new timer
    this.targetYTimer = setTimeout(() => {
      // handle direction
      this.y = dir === 'up'
        ? this.y - (difference / this.inputCooldown)
        : this.y + (difference / this.inputCooldown);

      // if we're not close enough to the target Y, keep moving
      if (difference > 1) {
        this.targetYTimerHandler(dir);
      }
    }, difference / this.inputCooldown)
  }

  targetXTimerHandler(dir) {
    // clear the existing timer
    clearTimeout(this.targetXTimer);

    // get the difference between the current y and the target y
    const difference = Math.abs(this.x - this.targetX);

    // set a new timer
    this.targetXTimer = setTimeout(() => {
      // handle direction
      this.x = dir === 'left'
        ? this.x - (difference / this.inputCooldown)
        : this.x + (difference / this.inputCooldown);

      // if we're not close enough to the target Y, keep moving
      if (difference > 1) {
        this.targetXTimerHandler(dir);
      }
    }, difference / this.inputCooldown)
  }

  handleInput(activeKeys) {
    // bail if input is disabled
    if (!this.allowInput) {
      return;
    }

    // bail if no key press
    if (activeKeys.length === 0) {
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
    if (activeKeys.indexOf(38) > -1) {
      this.velocities[0] = (this.velocities[0] + 1) * this.rateOfIncrease;
      if (this.velocities[0] > this.maxSpeed) {
        this.velocities[0] = this.maxSpeed;
      }

      // cancel opposite direction velocity
      this.velocities[2] = 0;

      // movement easing
      this.targetY = this.y - this.velocities[0];
      this.targetYTimerHandler('up');
      this.canMoveUp = false;
    }

    // handle right
    if (activeKeys.indexOf(39) > -1) {
      this.velocities[1] = (this.velocities[1] + 1) * this.rateOfIncrease;
      if (this.velocities[1] > this.maxSpeed) {
        this.velocities[1] = this.maxSpeed;
      }
      
      // cancel opposite direction velocity
      this.velocities[3] = 0;

      // movement easing
      this.targetX = this.x + this.velocities[1];
      this.targetXTimerHandler('right');
      this.canMoveRight = false;
    }

    // handle down
    if (activeKeys.indexOf(40) > -1) {
      this.velocities[2] = (this.velocities[2] + 1) * this.rateOfIncrease;
      if (this.velocities[2] > this.maxSpeed) {
        this.velocities[2] = this.maxSpeed;
      }

      // cancel opposite direction velocity
      this.velocities[0] = 0;

      // movement easing
      this.targetY = this.y + this.velocities[2];
      this.targetYTimerHandler('down');
      this.canMoveDown = false;
    }

    // handle left
    if (activeKeys.indexOf(37) > -1) {
      this.velocities[3] = (this.velocities[3] + 1) * this.rateOfIncrease;
      if (this.velocities[3] > this.maxSpeed) {
        this.velocities[3] = this.maxSpeed;
      }
      
      // cancel opposite direction velocity
      this.velocities[1] = 0;

      // movement easing
      this.targetX = this.x - this.velocities[3];
      this.targetXTimerHandler('left');
      this.canMoveLeft = false;
    }
    
    // set timeout to enable key press again
    clearTimeout(this.keyboardCooldownTimer);
    const that = this;
    this.keyboardCooldownTimer = setTimeout(() => {
      this.canMoveUp = true;
      this.canMoveRight = true;
      this.canMoveDown = true;
      this.canMoveLeft = true;
    }, this.inputCooldown);
  }
}

export default Hero;
