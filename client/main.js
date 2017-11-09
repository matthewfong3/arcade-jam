let canvas;
let ctx;

let socket; 
let hash; 
let animationFrame;

let circles = {};

let roomMember = 0;

let avatarImg1;
let avatarImg2;

// function that handles key down events
const keyDownHandler = (e) => {
  let keyPressed = e.which;
  const circle = circles[hash];
  
  if(!gameOver){
    if(keyPressed === 87 || keyPressed === 38) 
      circle.moveUp = true;
    else if(keyPressed === 83 || keyPressed === 40)
      circle.moveDown = true;
    else if(keyPressed === 32 && e.target === document.body && !circle.shooting){
      e.preventDefault(); 
      circle.shielding = true;
    }
    else if(keyPressed === 70 && circle.bullets.length > 0 && !circle.shielding)
      circle.shooting = true;
  }
};

// function that handles key up events
const keyUpHandler = (e) => {
  let keyPressed = e.which;
  const circle = circles[hash];
  
  if(keyPressed === 87 || keyPressed === 38) 
    circle.moveUp = false;
  else if(keyPressed === 83 || keyPressed === 40)
    circle.moveDown = false;
  else if(keyPressed === 32 && e.target === document.body){
    e.preventDefault(); 
    circle.shielding = false;
  }
  else if(keyPressed === 70)
    circle.shooting = false;
};

// helper function to get mouse position in canvas
const getMousePos = (canvas, e) => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

// helper function that checks if mouse position is inside bounding box
const isInside = (pos, rect) => {
  return pos.x > rect.x && pos.x < rect.x+rect.width && pos.y < rect.y+rect.height && pos.y > rect.y;
}

// function that creates a canvas button
const createCanvasButton = (rectX, rectY, textX, textY, text) => {
  ctx.beginPath();
  ctx.fillStyle = 'white';
  ctx.font = '14px Overpass';
  ctx.fillRect(rectX, rectY, 160, 50);
  ctx.strokeStyle = 'black';
  ctx.strokeRect(rectX, rectY, 160, 50);
  ctx.fillStyle = 'black';
  ctx.fillText(text, textX, textY);
  ctx.closePath();
};

const init = () => {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  
  avatarImg1 = document.querySelector("#avatar1");
  avatarImg2 = document.querySelector("#avatar2");
  
  socket = io.connect();
  
  if(onStart){
    drawBG();
    
    // draw Red Team 1 Button
    createCanvasButton(canvas.width/4, canvas.height * 0.2, canvas.width/4 + 17, canvas.height * 0.245, 'Red Team (Player 1)');
    
    // draw Red Team 2 Button
    createCanvasButton(canvas.width/4, canvas.height * 0.4, canvas.width/4 + 17, canvas.height * 0.445, 'Red Team (Player 2)');
    
    // draw Blue Team 1 Button
    createCanvasButton(canvas.width * .75 - 160, canvas.height * 0.2, canvas.width * .75 - 145, canvas.height * 0.245, 'Blue Team (Player 1)');
    
    // draw Blue Team 2 Button
    createCanvasButton(canvas.width * .75 - 160, canvas.height * 0.4, canvas.width * .75 - 145, canvas.height * 0.445, 'Blue Team (Player 2)');
    
    canvas.addEventListener('click', (e) => {
      let mousePos = getMousePos(canvas, e);
      
      let redRect1 = { x: canvas.width/4, y: canvas.height * 0.2, width: 160, height: 50 };
      
      let redRect2 = { x: canvas.width/4, y: canvas.height * 0.4, width: 160, height: 50 };
      
      let blueRect3 = { x: canvas.width * .75 - 160, y: canvas.height * 0.4, width: 160, height: 50 };
      
      let blueRect4 = { x: canvas.width * .75 - 160, y: canvas.height * 0.2, width: 160, height: 50 };
      
      let playRect = { x: canvas.width/2 - 80, y: canvas.height * 0.75, width: 160, height: 50 };
      
      if(onStart){
        if(isInside(mousePos, redRect1)){
          roomMember = 1;
        } 
        else if(isInside(mousePos, redRect2)){
          roomMember = 2;
        }
        else if(isInside(mousePos, blueRect3)){
          roomMember = 3;
        }
        else if(isInside(mousePos, blueRect4)){
          roomMember = 4;
        }
        
        if(roomMember !== 0){
          // draw play button
          createCanvasButton(canvas.width/2 - 80, canvas.height * 0.75, canvas.width/2 - 15, canvas.height * 0.8, 'Play');
          
          if(isInside(mousePos, playRect)) socket.emit('join', {roomMember: roomMember});
        }
      }
    });
  }
  
  socket.on('errorJoining', displayErrorJoin);
  socket.on('joined', setUser);
  socket.on('displayPoints', updatePoints);
  socket.on('displayWinLose', updateWinLose);
  socket.on('updatedMovement', update);
  socket.on('updatedBullets', updateBullets);
  socket.on('reload', reloadBullets);
  socket.on('displayPlayAgain', handleGameOver);
  socket.on('resetPos', resetPosition);
  socket.on('left', removeUser);
  
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;