class Bullet {
  constructor() {
    this.prevX = 0;
    this.x = 0;
    this.destX = 0;
    this.y = 0;
    this.radius = 5;
    this.fired = false;
    this.direction = 'none';
  }
}

module.exports = Bullet;
