const directions = {
  UP: 0,
  DOWN: 1,
};

let gameOver = false;
let onStart = true;

// function that lerps player's movement
const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

// helper function that draws canvas background
const drawBG = () => {
  ctx.save();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1152, 648);
  ctx.setLineDash([15, 25]);
  ctx.beginPath();
  ctx.moveTo(canvas.width/2, 0);
  ctx.lineTo(canvas.width/2, canvas.height);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
  ctx.fillRect(0, 0, canvas.width/2, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 255, 0.25)';
  ctx.fillRect(canvas.width/2, 0, canvas.width/2, canvas.height);
  ctx.restore();
};

// helper function that displays points on canvas
const displayPoints = () => {
  ctx.fillStyle = 'white';
  ctx.font = '20px Overpass';
  ctx.fillText("Red Points: " + redPts, 10, canvas.height * 0.04);
  ctx.fillText("Blue Points: " + bluePts, canvas.width * 0.88, canvas.height * 0.04);
};

// helper function that displays win/lose msg on game over state
const displayWinLoseMsg = () => {
  ctx.fillStyle = 'black';
  ctx.font = '20px Overpass';
  if(redPts >= 3){
    if(circles[hash].x < canvas.width/2){
      ctx.fillText(winMsg, canvas.width/2 - 35, canvas.height/2 - 10);
    } else {
      ctx.fillText(loseMsg, canvas.width/2 - 35, canvas.height/2 - 10);
    }
  } else if(bluePts >= 3){
    if(circles[hash].x < canvas.width/2){
      ctx.fillText(loseMsg, canvas.width/2 - 35, canvas.height/2 - 10);
    } else {
      ctx.fillText(winMsg, canvas.width/2 - 35, canvas.height/2 - 10);
    }
  }
};

// helper function that displays error joining msg on team selection
const displayErrorJoin = (data) => {
  ctx.font = '14px Overpass'; 
  ctx.fillText(data.msg, canvas.width/2 - 116, canvas.height * .605);
};

// function that redraws on canvas every requestAnimationFrame
const redraw = (time) => {
  updatePosition();
  
  // set screen default settings
  drawBG();
  
  // display points
  displayPoints();
  
  // display win/lose messages
  displayWinLoseMsg();
  
  if(gameOver){
    createCanvasButton(canvas.width/2 - 80, canvas.height * 0.75, canvas.width/2 - 35, canvas.height * 0.8, 'Play Again');
  }
  
  const keys = Object.keys(circles);
  
  for(let i = 0; i < keys.length; i++){
    const circle = circles[keys[i]];
    
    if(circle.hash === hash){
      ctx.filter = 'none';
    } else {
      ctx.filter = 'hue-rotate(40deg)';
    }
    
    // lerp player movement
    circle.y = lerp(circle.prevY, circle.destY, 0.05);
    
    // fill color for player
    if(circle.roomMember === 1 || circle.roomMember === 2)
      ctx.fillStyle = 'red';
    else if(circle.roomMember === 3 || circle.roomMember === 4)
      ctx.fillStyle = 'blue';
    
    // draw player
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius/2, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    if(circle.roomMember === 1 || circle.roomMember === 2)
      ctx.drawImage(avatarImg1, circle.x - circle.radius * 1.5, circle.y - circle.radius * 1.5, circle.radius * 3, circle.radius * 3);
    else if(circle.roomMember === 3 || circle.roomMember === 4)
      ctx.drawImage(avatarImg2, circle.x - circle.radius * 1.5, circle.y - circle.radius * 1.5, circle.radius * 3, circle.radius * 3);
    
    // draw bullets fired
    for(let i = 0; i < circle.shotsFired.length; i++){
      circle.shotsFired[i].x = lerp(circle.shotsFired[i].prevX, circle.shotsFired[i].destX, 0.05);
      
      ctx.beginPath();
      ctx.arc(circle.shotsFired[i].x, circle.shotsFired[i].y, circle.shotsFired[i].radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fillStyle = 'black';
      ctx.fill();
    }
    
    // draw shield
    if(circle.shield.active){
      ctx.save();
      ctx.beginPath();
      if(circle.x < canvas.width/2)
        ctx.arc(circle.shield.x, circle.shield.y, circle.shield.radius, -90 * Math.PI/180, Math.PI/2, false);
      else 
        ctx.arc(circle.shield.x, circle.shield.y, circle.shield.radius, 90 * Math.PI/180, -(Math.PI/2), false);
      ctx.stroke();
      ctx.restore();
    }
    ctx.filter = 'none';
  }
  
  animationFrame = requestAnimationFrame(redraw);
};