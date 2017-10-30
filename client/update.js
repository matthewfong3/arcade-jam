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
    circle.shotsFired = data.shotsFired;
    circle.shield = data.shield;
  }
  
  circle.alpha = 0.05;
};

const removeUser = (data) => {
  if(circles[data.hash])
    delete circles[data.hash];
};

const setUser = (data) => {
  if(!circles[data.hash]){
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
  }
};

const updatePosition = () => {
  const circle = circles[hash];
  
  circle.prevY = circle.y;
  
  if(circle.moveUp && circle.destY > 0 + circle.radius)
    circle.destY -= 5;
  if(circle.moveDown && circle.destY < (canvas.height - circle.radius))
    circle.destY += 5;
  
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
      circle.bullets[0].x = circle.x;
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
    // determine which direction the bullet fires depending on player position
    if(circle.x < canvas.width/2)
      circle.shotsFired[i].x += 5;
    else 
      circle.shotsFired[i].x -= 5;
    
    // determine which team gets a point depending on which side the bullet leaves the canvas
    if(circle.shotsFired[i].x > canvas.width){
      socket.emit('updatePoints',{redPoints: 1, bluePoints: 0});
      circle.shotsFired.splice(0, 1); 
    } else if(circle.shotsFired[i].x < 0){
      socket.emit('updatePoints',{redPoints: 0, bluePoints: 1});
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

  circle.alpha = 0.05;
  
  socket.emit('movementUpdate', circle);
};