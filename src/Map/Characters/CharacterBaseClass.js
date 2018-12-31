/**
 * The character base class
 * keeps track of the characters individual easing to position
 *
 * @class CharacterBaseClass
 */
class CharacterBaseClass {
  constructor(game, map, args) {
    // display debug info
    this.debug = true;

    // handle args
    this.game = game;
    this.map = map;
    this.id = args.id;
    this.x = args.x;
    this.y = args.y;
    this.width = 50;
    this.height = 50;
    this.blocking = true;

    // player input handling
    this.isPlayer = false;
    this.allowInput = true;

    // if the hero can move in a certain direction
    // [ up, right, down, left ];
    this.canMove = [true, true, true, true];

    // handle character's directional velocity
    this.velocities = [0, 0, 0, 0];
    
    //this.maxSpeed = 18;
    this.maxSpeed = Math.round(Math.random() * 50);

    this.rateOfIncrease = 1 + this.maxSpeed / 100;
    this.rateOfDecrease = 1 + this.maxSpeed;

    // set target x,y for easing the character movement
    this.targetX = this.x;
    this.targetY = this.y;
    this.targetXTimer;
    this.targetYTimer;

    // cooldown beteween movement
    this.inputCooldown = 30;

    // movement timer
    this.isVisible = false;
    this.npcMovementTimer;
    this.doMovement();

    // image
    this.image = new Image(50, 50);
    this.image.src = this.game.Canvas.createImage();

    this.init(args.map);
  }

  doMovement() {
    // bail if controlled by human
    if (this.isPlayer) {
      return;
    }

    // bail if not visible
    if (!this.isVisible) {
      return;
    }    
    
    window.clearTimeout(this.npcMovementTimer);
    const msTilNextMove = Math.random() * 1000;
    this.npcMovementTimer = window.setTimeout(() => {
      // get some potential target vals
      const targetX = (Math.random() * 4 - 2) * this.maxSpeed;
      const targetY = (Math.random() * 4 - 2) * this.maxSpeed;
    

      this.targetX = this.x + targetX;
      this.targetXTimerHandler(targetX > 0 ? 1 : 3);
      this.targetY = this.y + targetY;
      this.targetYTimerHandler(targetY > 0 ? 2 : 0);

      this.doMovement();
    }, msTilNextMove);
  }

  stopMovement() {
    window.clearTimeout(this.npcMovementTimer);
    this.targetY = this.y;
    this.targetX = this.x;
    window.clearTimeout(this.targetXTimer);
    window.clearTimeout(this.targetYTimer);
  }

  /**
   * Subclass constructor
   *
   * @param {*} map
   * @memberof CharacterBaseClass
   */
  init(map) {
    
  }

  /**
   * Currently draws a circle
   *
   * @param {*} Canvas
   * @memberof Hero
   */
  draw(Canvas) {
    Canvas.setContext('character');

    Canvas.drawCharacter({
      image: this.image,
      x: this.x,
      y: this.y,
      width: 50,
      height: 50,
    });
  }

  /**
   * Increases the hero.maxSpeed
   *
   * @memberof Hero
   */
  increaseSpeed() {
    this.maxSpeed++;
  }

  /**
   * Decreases the hero.maxSpeed
   *
   * @memberof Hero
   */
  decreaseSpeed() {
    this.maxSpeed--;
  }

  /**
   * Handles easing on the X axis
   *
   * @param {*} dir
   * @param {*} this.map
   * @memberof Hero
   */
  targetXTimerHandler(dir) {
    // clear the existing timer
    clearTimeout(this.targetXTimer);

    // get the difference between the current y and the target y
    let difference = Math.abs(this.x - this.targetX);

    // set a new timer
    this.targetXTimer = setTimeout(() => {
      // calculate what the new x should be
      const newX = dir === 1 // right
        ? this.x + (difference / this.inputCooldown)
        : this.x - (difference / this.inputCooldown); 

      // handle collision
      const collision = this.map.getCollision(newX, this.y);

      if (collision) {
        this.targetX = this.x;
        difference = 0;
      } else {
        this.x = newX;
      }

      this.afterEaseMovement();

      // if we're not close enough to the target Y, keep moving
      if (difference > 1) {
        this.targetXTimerHandler(dir, this.map);
      }
    }, difference / this.inputCooldown);
  }

  /**
   * Handles easing on the Y axis
   *
   * @param {*} dir
   * @memberof Hero
   */
  targetYTimerHandler(dir) {
    // clear the existing timer
    clearTimeout(this.targetYTimer);

    // get the difference between the current y and the target y
    let difference = Math.abs(this.y - this.targetY);

    // set a new timer
    this.targetYTimer = setTimeout(() => {
      // handle direction
      const newY = dir === 0 // up
        ? this.y - (difference / this.inputCooldown)
        : this.y + (difference / this.inputCooldown);

      // handle collision
      const collision = this.map.getCollision(this.x, newY);

      if (collision) {
        this.targetY = this.y
        difference = 0;
      } else {
        this.y = newY;
      }

      this.afterEaseMovement();

      // if we're not close enough to the target Y, keep moving
      if (difference > 1) {
        this.targetYTimerHandler(dir, this.map);
      } else {
        this.map.needsUpdate = false;
      }
    }, difference / this.inputCooldown)
  }

  /**
   * Additional actions to perform after movement easing is calculated
   *
   * @memberof Hero
   */
  afterEaseMovement() {
    if (this.id === this.map.heroId) {
      // calculate
      this.game.Canvas.Camera.setFocus({
        x: this.x,
        y: this.y,
      });
    }

    this.map.needsUpdate = true;
  }

  /**
   * Handle input for the hero
   *
   * @param {*} activeKeys
   * @param {*} this.map
   * @returns
   * @memberof Hero
   */
  handleInput(Keyboard) {
    // bail if input is disabled
    if (!this.allowInput) {
      return;
    }

    if (Keyboard.active.plus) {
      this.increaseSpeed();
    }

    if (Keyboard.active.minus) {
      this.decreaseSpeed();
    }

    // loop through each directions
    for (let i = 0; i < Keyboard.directions.length; i++) {
      // is the direction active?
      const active = Keyboard.directions[i];

      // if direction is active
      if (active) {
        this.canMove[i] = false;
        
        // make it faster
        this.velocities[i] = this.velocities[i] >= this.maxSpeed
          ? this.maxSpeed
          : (this.velocities[i] + 1) * this.rateOfIncrease;
        
        // y axis
        if (i === 0 || i === 2) {
          // opposite directions cancel eachother out
          if (!(Keyboard.active.up && Keyboard.active.down)) {
            this.targetY = i === 0
              ? this.y - this.velocities[i] // up
              : this.y + this.velocities[i] // down
            
            this.targetYTimerHandler(i);
          } else {
            this.velocities[i] = 0;
          }
        }

        // x axis
        if (i === 1 || i === 3) {
          // opposite directions cancel eachother out
          if (!(Keyboard.active.left && Keyboard.active.right)) {
            this.targetX = i === 1
              ? this.x + this.velocities[i] // right
              : this.x - this.velocities[i]; // left
            
            this.targetXTimerHandler(i);
          } else {
            this.velocities[i] = 0;
          }
        }
      } else {
        // nuke velocity if not active
        this.velocities[i] = 0;
      }
    }
    
    // set timeout to enable movement in the direction
    clearTimeout(this.keyboardCooldownTimer);
    const that = this;
    this.keyboardCooldownTimer = setTimeout(() => {
      this.canMove = [true, true, true, true]
    }, this.inputCooldown);
  }
}

export default CharacterBaseClass;
