let redPts = 0;
let bluePts = 0;

let winMsg = '';
let loseMsg = '';

// function that updates client's points variables
const updatePoints = (data) => {
  redPts = data.redPts;
  bluePts = data.bluePts;
};

// function that updates win/lose msg on game over 
const updateWinLose = (data) => {
  winMsg = data.win;
  loseMsg = data.lose;
};

// function that updates client's bullets array
const reloadBullets = (data) => {
  circles[data.hash].bullets = data.bullets;
};

// function that updates data for all circles when server sends response
const update = (data) => {
  if(!circles[data.hash]){
    circles[data.hash] = data;
    return;
  }
  
  if(circles[data.hash].lastUpdate >= data.lastUpdate)
    return;
  
  const circle = circles[data.hash];
  
  if(data.hash === hash){
    circle.destY = data.destY;
  } else {
    circle.prevY = data.prevY;
    circle.destY = data.destY;
    circle.direction = data.direction;
    circle.moveDown = data.moveDown;
    circle.moveUp = data.moveUp;
    circle.bullets = data.bullets;
    circle.shield = data.shield;
  }
  circle.shotsFired = data.shotsFired;
};

// function that handles game over state
const handleGameOver = () => {
  gameOver = true;
  canvas.addEventListener('click', (e) => {
    let mousePos = getMousePos(canvas, e);
    
    let gameOverRect = {
      x: canvas.width/2 - 80,
      y: canvas.height * 0.75, 
      width: 160,
      height: 50
    }
    
    if(gameOver && isInside(mousePos, gameOverRect)){
      redPts = 0;
      bluePts = 0;
      winMsg = '';
      loseMsg = '';
      gameOver = false;
      socket.emit('restartGame', {});
    } 
  });
};

// function that removes disconnected user from client's circles
const removeUser = (data) => {
  if(circles[data.hash]) delete circles[data.hash];
};

// function that sets up newly connected users client-side
const setUser = (data) => {
  onStart = false;
  hash = data.hash;
  circles[hash] = data;
  
  // set X positions
  switch(circles[hash].roomMember){
    case 1:
      circles[hash].x = canvas.width * 0.1;
      break;
    case 2:
      circles[hash].x = canvas.width * 0.3;
      break;
    case 3:
      circles[hash].x = canvas.width * 0.7;
      break;
    case 4:
      circles[hash].x = canvas.width * 0.9;
      break;
  }
  
  // set Y positions
  circles[hash].prevY = canvas.height/2;
  circles[hash].y = canvas.height/2;
  circles[hash].destY = canvas.height/2;
  
  requestAnimationFrame(redraw);
};

// function that resets client's position on game's restart
const resetPosition = () => {
  // set Y positions 
  circles[hash].prevY = canvas.height/2;
  circles[hash].y = canvas.height/2;
  circles[hash].destY = canvas.height/2;
};

// function that updates client's movements and sends updated data to server
const updatePosition = () => {
  const circle = circles[hash];
  
  circle.prevY = circle.y;
  
  if(circle.moveUp && circle.destY > 0 + circle.radius)
    circle.destY -= 10;
  if(circle.moveDown && circle.destY < (canvas.height - circle.radius))
    circle.destY += 10;
  
  if(circle.moveUp)
    circle.direction = directions.UP;
  if(circle.moveDown)
    circle.direction = directions.DOWN;

  // set bullet's position to player's current position and fire
  if(circle.shooting){
    circle.bullets[0].fired = true;
  }
  
  if(circle.bullets.length > 0){
    if(circle.bullets[0].fired && !circle.shooting){
      circle.bullets[0].prevX = circle.x;
      circle.bullets[0].x = circle.x;
      circle.bullets[0].destX = circle.x;
      circle.bullets[0].y = circle.y;
      circle.shotsFired.push(circle.bullets[0]);
      circle.bullets.splice(0, 1);
    }
  } else {
    circle.bulletsTimer++;
    
    if(circle.bulletsTimer >= 200){
      socket.emit('reloadRequest', {bullets: circle.bullets});
      circle.bulletsTimer = 0;
    }
  }
  
  for(let i = 0; i < circle.shotsFired.length; i++){
    circle.shotsFired[i].prevX = circle.shotsFired[i].x;
    // determines which direction fired projectiles travel in
    if(circle.roomMember === 1 || circle.roomMember === 2){
      circle.shotsFired[i].destX += 10;
      circle.shotsFired[i].direction = 'right';
    } else if(circle.roomMember === 3 || circle.roomMember === 4){
      circle.shotsFired[i].destX -= 10;
      circle.shotsFired[i].direction = 'left';
    }
    
    // determine which team gets a point depending on which side the bullet leaves the canvas
    if(circle.shotsFired[i].x > canvas.width){
      socket.emit('updatePoints',{roomNum: circle.roomNum, redPoints: 1, bluePoints: 0});
      circle.shotsFired.splice(0, 1);
    } else if(circle.shotsFired[i].x < 0){
      socket.emit('updatePoints',{roomNum: circle.roomNum, redPoints: 0, bluePoints: 1});
      circle.shotsFired.splice(0, 1); 
    }
  } 
  
  // set shield position to character position
  if(circle.shielding){
    circle.shield.active = true;
  } else {
    circle.shield.active = false;
  }
  
  // set shield position to character position
  if(circle.shield.active){
    circle.shield.x = circle.x;
    circle.shield.y = circle.y;
  }
  
  socket.emit('movementUpdate', circle);
};