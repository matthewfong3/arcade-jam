const directions = {
  UP: 0,
  DOWN: 1,
};

// try to find another way to display points
let redPts = 0;
let bluePts = 0;

let winMsg = '';
let loseMsg = '';

const displayPoints = (data) => {
  redPts = data.redPts;
  bluePts = data.bluePts;
};

const displayWinLose = (data) => {
  winMsg = data.win;
  loseMsg = data.lose;
};

const lerp = (v0, v1, alpha) => {
  return (1 - alpha) * v0 + alpha * v1;
};

const redraw = (time) => {
  updatePosition();
  
  // set screen default settings
  ctx.clearRect(0, 0, 1152, 648);
  ctx.save();
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
  
  // display points
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText("Red Points: " + redPts, 10, canvas.height * 0.04);
  ctx.fillText("Blue Points: " + bluePts, canvas.width * 0.88, canvas.height * 0.04);
  ctx.restore();
  
  // display win/lose messages
  ctx.fillStyle = 'black';
   if(redPts >= 3){
     if(circles[hash].x < canvas.width/2){
       ctx.fillText(winMsg, canvas.width/2, canvas.height/2);
     } else {
       ctx.fillText(loseMsg, canvas.width/2, canvas.height/2);
     }
   } else if(bluePts >= 3){
     if(circles[hash].x < canvas.width/2){
       ctx.fillText(loseMsg, canvas.width/2, canvas.height/2);
     } else {
       ctx.fillText(winMsg, canvas.width/2, canvas.height/2);
     }
   }
  
  const keys = Object.keys(circles);
  
  for(let i = 0; i < keys.length; i++){
    const circle = circles[keys[i]];
    
    if(circle.alpha < 1) circle.alpha += 0.05;
    
    if(circle.hash === hash){
      ctx.filter = 'none';
    } else {
      ctx.filter = 'hue-rotate(40deg)';
    }
    
    circle.y = lerp(circle.prevY, circle.destY, circle.alpha);
    
    // draw player
    if(circle.roomMember === 1 || circle.roomMember === 2)
      ctx.fillStyle = 'red';
    else if(circle.roomMember === 3 || circle.roomMember === 4)
      ctx.fillStyle = 'blue';
    
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    
    // draw bullet
    for(let i = 0; i < circle.shotsFired.length; i++){
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
  }
  
  animationFrame = requestAnimationFrame(redraw);
};