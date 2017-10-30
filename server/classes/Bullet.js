class Bullet {
  constructor() {
    this.lastUpdate = new Date().getTime();
    this.x = 0;
    this.y = 0;
    this.radius = 5;
    this.fired = false;
  }
}

module.exports = Bullet;
