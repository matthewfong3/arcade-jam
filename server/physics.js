let charList = {};

// const bullets = [];

/* const checkCollisions = (circle1, circle2) => {
  const dx = (circle1.x - circle2.x) ** 2;
  const dy = (circle1.y - circle2.y) ** 2;

  const distance = Math.sqrt(dx + dy);

  const sumRad = circle1.radius + circle2.radius;

  if (distance > sumRad) {
    return false; // false = no collision
  }
  return true; // true = collision
};

/* const checkBulletCollision = (bullet, shield) => {
  // check if bullet and shield is on the same side, if so, return false

  // return checkCollisions(bullet, shield);
};

const checkBullets = () => {
  // const keys = Object.keys(charList);
  // console.log(bullets);

  /* for(let i = 0; i < keys.length; i++) {
    for(let k = 0; k < charList[keys[i]].shotsFired.length; k++) {
      //console.log(charList[keys[i]].shotsFired[k].x);

      if(checkCollisions(charList[keys[i]].shotsFired[k], charList[keys[i]])){
        console.log('in here');
      }
      /*if(checkBulletCollision(charList[keys[i]].shotsFired[k], charList[keys[i]])) {
        console.log('hit');

        // delete the bullet from shotsFired array
      } else {

      }
    }
  }
}; */

const setCharacterList = (characterList) => {
  charList = characterList;
};

const setCharacter = (character) => {
  charList[character.hash] = character;
};

/* setInterval(() => {
  checkBullets();
}, 20); */

module.exports.setCharacterList = setCharacterList;
module.exports.setCharacter = setCharacter;
