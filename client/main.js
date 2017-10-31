let canvas;
let ctx;

let socket; 
let hash; 
let animationFrame;

let circles = {};

const keyDownHandler = (e) => {
  let keyPressed = e.which;
  const circle = circles[hash];
  
  if(keyPressed === 87 || keyPressed === 38) 
    circle.moveUp = true;
  else if(keyPressed === 83 || keyPressed === 40)
    circle.moveDown = true;
  else if(keyPressed === 32 && e.target === document.body && !circle.shooting){
    e.preventDefault();
    console.log('spacebar pressed: activate shield'); 
    circle.shielding = true;
  }
  else if(keyPressed === 70 && circle.bullets.length > 0){
    console.log('f pressed: fire bullet');
    circle.shooting = true;
  }
};

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
  else if(keyPressed === 70){
    circle.shooting = false;
  }
};

const init = () => {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");
  
  socket = io.connect();
  
  socket.on('joined', setUser);
  socket.on('displayPoints', displayPoints);
  socket.on('displayWinLose', displayWinLose);
  socket.on('reload', (data) => {
    circles[data.hash].bullets = data.bullets;
  });
  socket.on('updatedMovement', update);
  socket.on('left', removeUser);
  
  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;