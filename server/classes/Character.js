class Character {
  constructor(hash) {
    this.hash = hash;
    this.lastUpdate = new Date().getTime();
    this.roomMember = 0;
    this.x = 0;
    this.y = 0;
    this.prevY = 0;
    this.destY = 0;
    this.radius = 25;
    this.alpha = 0; // used for animation (?)
    this.direction = -1;
    this.frame = 0; // ?
    this.frameCount = 0; // ?
    this.moveUp = false;
    this.moveDown = false;
    this.shooting = false;
    this.shielding = false;

    this.bulletsTimer = 0;
    this.bullets = [];
    this.shotsFired = [];
    // this.shield; // assign shield property when instantiating
  }
}

module.exports = Character;
