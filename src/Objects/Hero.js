import ObjectCircle from './ObjectCircle';

class Hero extends ObjectCircle {
  init() {
    this.allowInput = true;

    // up, right, down, left
    this.velocities = [0, 0, 0, 0];

    this.maxVelocity = 30;

    this.rateOfIncrease = 5;

    this.inputCooldown = 100;
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
      if (this.velocities[0] > this.maxVelocity) {
        this.velocities[0] = this.maxVelocity;
      }
      
      this.y = this.y - this.velocities[0];
      this.allowInput = false;
    }

    // handle right
    if (activeKeys.indexOf(39) > -1) {
      this.velocities[1] = (this.velocities[1] + 1) * this.rateOfIncrease;
      if (this.velocities[1] > this.maxVelocity) {
        this.velocities[1] = this.maxVelocity;
      }
      
      this.x = this.x + this.velocities[1];
      this.allowInput = false;
    }

    // handle down
    if (activeKeys.indexOf(40) > -1) {
      this.velocities[2] = (this.velocities[2] + 1) * this.rateOfIncrease;
      if (this.velocities[2] > this.maxVelocity) {
        this.velocities[2] = this.maxVelocity;
      }
            
      this.y = this.y + this.velocities[2];
      this.allowInput = false;
    }

    // handle left
    if (activeKeys.indexOf(37) > -1) {
      this.velocities[3] = (this.velocities[3] + 1) * this.rateOfIncrease;
      if (this.velocities[3] > this.maxVelocity) {
        this.velocities[3] = this.maxVelocity;
      }
      
      this.x = this.x - this.velocities[3];
      this.allowInput = false;
    }
    
    // set timeout to enable key press again
    window.clearTimeout(this.keyboardCooldownTimer);
    const that = this;
    this.keyboardCooldownTimer = window.setTimeout(function() {
      that.allowInput = true;
    }, 100);
  }
}

export default Hero;
