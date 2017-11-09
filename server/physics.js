const sockets = require('./sockets.js');

const charList = {};

const bullets = {};

// function that checks for sphere-to-sphere collision
const checkCollisions = (circle1, circle2) => {
  const dx = (circle1.x - circle2.x) ** 2;
  const dy = (circle1.y - circle2.y) ** 2;

  const distance = Math.sqrt(dx + dy);

  const sumRad = circle1.radius + circle2.radius;

  if (distance > sumRad) {
    return false; // false = no collision
  }
  return true; // true = collision
};

// function that checks collisions between bullets and opposing team players' shields
const checkBulletsCollision = () => {
  const charKeys = Object.keys(charList);

  const bulletsKeys = Object.keys(bullets);

  for (let i = 0; i < bulletsKeys.length; i++) {
    for (let j = 0; j < charKeys.length; j++) {
      if (bullets[bulletsKeys[i]]) {
        if (bullets[bulletsKeys[i]].direction === 'right' && charList[charKeys[j]].roomMember !== 1 && charList[charKeys[j]].roomMember !== 2 && charList[charKeys[j]].shielding) {
          if (checkCollisions(bullets[bulletsKeys[i]], charList[charKeys[j]].shield)) {
            sockets.deleteBullet(
              charList[charKeys[j]].roomNum,
              bullets[bulletsKeys[i]].roomMember,
              bullets[bulletsKeys[i]].i,
            );

            delete bullets[bulletsKeys[i]];
          }
        } else if (bullets[bulletsKeys[i]].direction === 'left' && charList[charKeys[j]].roomMember !== 3 && charList[charKeys[j]].roomMember !== 4 && charList[charKeys[j]].shielding) {
          if (checkCollisions(bullets[bulletsKeys[i]], charList[charKeys[j]].shield)) {
            sockets.deleteBullet(
              charList[charKeys[j]].roomNum,
              bullets[bulletsKeys[i]].roomMember,
              bullets[bulletsKeys[i]].i,
            );

            delete bullets[bulletsKeys[i]];
          }
        }
      }
    }
  }
};

// function that updates player bullets on server-side
const updateBullets = () => {
  const keys = Object.keys(charList);

  for (let i = 0; i < keys.length; i++) {
    for (let j = 0; j < charList[keys[i]].shotsFired.length; j++) {
      if (charList[keys[i]].shotsFired[j]) {
        bullets[`${charList[keys[i]].hash}${j}`] = charList[keys[i]].shotsFired[j];
        bullets[`${charList[keys[i]].hash}${j}`].i = j;
        bullets[`${charList[keys[i]].hash}${j}`].roomMember = charList[keys[i]].roomMember;
      }
    }
  }
};

// function that resets the character list on server-side
const setCharacterList = (character) => {
  delete charList[character.hash];
};

// function that creates a character in server-side's character list
const setCharacter = (character) => {
  charList[character.hash] = character;

  updateBullets();
};

setInterval(() => {
  checkBulletsCollision();
}, 20);

module.exports.setCharacterList = setCharacterList;
module.exports.setCharacter = setCharacter;
