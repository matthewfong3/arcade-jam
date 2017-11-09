'use strict';

var directions = {
  UP: 0,
  DOWN: 1
};

var gameOver = false;
var onStart = true;

// function that lerps player's movement
var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

// helper function that draws canvas background
var drawBG = function drawBG() {
  ctx.save();
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 1152, 648);
  ctx.setLineDash([15, 25]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.closePath();
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 0, 0, 0.25)';
  ctx.fillRect(0, 0, canvas.width / 2, canvas.height);
  ctx.fillStyle = 'rgba(0, 0, 255, 0.25)';
  ctx.fillRect(canvas.width / 2, 0, canvas.width / 2, canvas.height);
  ctx.restore();
};

// helper function that displays points on canvas
var displayPoints = function displayPoints() {
  ctx.fillStyle = 'white';
  ctx.font = '20px Overpass';
  ctx.fillText("Red Points: " + redPts, 10, canvas.height * 0.04);
  ctx.fillText("Blue Points: " + bluePts, canvas.width * 0.88, canvas.height * 0.04);
};

// helper function that displays win/lose msg on game over state
var displayWinLoseMsg = function displayWinLoseMsg() {
  ctx.fillStyle = 'black';
  ctx.font = '20px Overpass';
  if (redPts >= 3) {
    if (circles[hash].x < canvas.width / 2) {
      ctx.fillText(winMsg, canvas.width / 2 - 35, canvas.height / 2 - 10);
    } else {
      ctx.fillText(loseMsg, canvas.width / 2 - 35, canvas.height / 2 - 10);
    }
  } else if (bluePts >= 3) {
    if (circles[hash].x < canvas.width / 2) {
      ctx.fillText(loseMsg, canvas.width / 2 - 35, canvas.height / 2 - 10);
    } else {
      ctx.fillText(winMsg, canvas.width / 2 - 35, canvas.height / 2 - 10);
    }
  }
};

// helper function that displays error joining msg on team selection
var displayErrorJoin = function displayErrorJoin(data) {
  ctx.font = '14px Overpass';
  ctx.fillText(data.msg, canvas.width / 2 - 116, canvas.height * .605);
};

// function that redraws on canvas every requestAnimationFrame
var redraw = function redraw(time) {
  updatePosition();

  // set screen default settings
  drawBG();

  // display points
  displayPoints();

  // display win/lose messages
  displayWinLoseMsg();

  if (gameOver) {
    createCanvasButton(canvas.width / 2 - 80, canvas.height * 0.75, canvas.width / 2 - 35, canvas.height * 0.8, 'Play Again');
  }

  var keys = Object.keys(circles);

  for (var i = 0; i < keys.length; i++) {
    var circle = circles[keys[i]];

    if (circle.hash === hash) {
      ctx.filter = 'none';
    } else {
      ctx.filter = 'hue-rotate(40deg)';
    }

    // lerp player movement
    circle.y = lerp(circle.prevY, circle.destY, 0.05);

    // fill color for player
    if (circle.roomMember === 1 || circle.roomMember === 2) ctx.fillStyle = 'red';else if (circle.roomMember === 3 || circle.roomMember === 4) ctx.fillStyle = 'blue';

    // draw player
    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius / 2, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();
    if (circle.roomMember === 1 || circle.roomMember === 2) ctx.drawImage(avatarImg1, circle.x - circle.radius * 1.5, circle.y - circle.radius * 1.5, circle.radius * 3, circle.radius * 3);else if (circle.roomMember === 3 || circle.roomMember === 4) ctx.drawImage(avatarImg2, circle.x - circle.radius * 1.5, circle.y - circle.radius * 1.5, circle.radius * 3, circle.radius * 3);

    // draw bullets fired
    for (var _i = 0; _i < circle.shotsFired.length; _i++) {
      circle.shotsFired[_i].x = lerp(circle.shotsFired[_i].prevX, circle.shotsFired[_i].destX, 0.05);

      ctx.beginPath();
      ctx.arc(circle.shotsFired[_i].x, circle.shotsFired[_i].y, circle.shotsFired[_i].radius, 0, Math.PI * 2, false);
      ctx.closePath();
      ctx.fillStyle = 'black';
      ctx.fill();
    }

    // draw shield
    if (circle.shield.active) {
      ctx.save();
      ctx.beginPath();
      if (circle.x < canvas.width / 2) ctx.arc(circle.shield.x, circle.shield.y, circle.shield.radius, -90 * Math.PI / 180, Math.PI / 2, false);else ctx.arc(circle.shield.x, circle.shield.y, circle.shield.radius, 90 * Math.PI / 180, -(Math.PI / 2), false);
      ctx.stroke();
      ctx.restore();
    }
    ctx.filter = 'none';
  }

  animationFrame = requestAnimationFrame(redraw);
};
'use strict';

var canvas = void 0;
var ctx = void 0;

var socket = void 0;
var hash = void 0;
var animationFrame = void 0;

var circles = {};

var roomMember = 0;

var avatarImg1 = void 0;
var avatarImg2 = void 0;

// function that handles key down events
var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var circle = circles[hash];

  if (!gameOver) {
    if (keyPressed === 87 || keyPressed === 38) circle.moveUp = true;else if (keyPressed === 83 || keyPressed === 40) circle.moveDown = true;else if (keyPressed === 32 && e.target === document.body && !circle.shooting) {
      e.preventDefault();
      circle.shielding = true;
    } else if (keyPressed === 70 && circle.bullets.length > 0 && !circle.shielding) circle.shooting = true;
  }
};

// function that handles key up events
var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var circle = circles[hash];

  if (keyPressed === 87 || keyPressed === 38) circle.moveUp = false;else if (keyPressed === 83 || keyPressed === 40) circle.moveDown = false;else if (keyPressed === 32 && e.target === document.body) {
    e.preventDefault();
    circle.shielding = false;
  } else if (keyPressed === 70) circle.shooting = false;
};

// helper function to get mouse position in canvas
var getMousePos = function getMousePos(canvas, e) {
  var rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

// helper function that checks if mouse position is inside bounding box
var isInside = function isInside(pos, rect) {
  return pos.x > rect.x && pos.x < rect.x + rect.width && pos.y < rect.y + rect.height && pos.y > rect.y;
};

// function that creates a canvas button
var createCanvasButton = function createCanvasButton(rectX, rectY, textX, textY, text) {
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

var init = function init() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");

  avatarImg1 = document.querySelector("#avatar1");
  avatarImg2 = document.querySelector("#avatar2");

  socket = io.connect();

  if (onStart) {
    drawBG();

    // draw Red Team 1 Button
    createCanvasButton(canvas.width / 4, canvas.height * 0.2, canvas.width / 4 + 17, canvas.height * 0.245, 'Red Team (Player 1)');

    // draw Red Team 2 Button
    createCanvasButton(canvas.width / 4, canvas.height * 0.4, canvas.width / 4 + 17, canvas.height * 0.445, 'Red Team (Player 2)');

    // draw Blue Team 1 Button
    createCanvasButton(canvas.width * .75 - 160, canvas.height * 0.2, canvas.width * .75 - 145, canvas.height * 0.245, 'Blue Team (Player 1)');

    // draw Blue Team 2 Button
    createCanvasButton(canvas.width * .75 - 160, canvas.height * 0.4, canvas.width * .75 - 145, canvas.height * 0.445, 'Blue Team (Player 2)');

    canvas.addEventListener('click', function (e) {
      var mousePos = getMousePos(canvas, e);

      var redRect1 = { x: canvas.width / 4, y: canvas.height * 0.2, width: 160, height: 50 };

      var redRect2 = { x: canvas.width / 4, y: canvas.height * 0.4, width: 160, height: 50 };

      var blueRect3 = { x: canvas.width * .75 - 160, y: canvas.height * 0.4, width: 160, height: 50 };

      var blueRect4 = { x: canvas.width * .75 - 160, y: canvas.height * 0.2, width: 160, height: 50 };

      var playRect = { x: canvas.width / 2 - 80, y: canvas.height * 0.75, width: 160, height: 50 };

      if (onStart) {
        if (isInside(mousePos, redRect1)) {
          roomMember = 1;
        } else if (isInside(mousePos, redRect2)) {
          roomMember = 2;
        } else if (isInside(mousePos, blueRect3)) {
          roomMember = 3;
        } else if (isInside(mousePos, blueRect4)) {
          roomMember = 4;
        }

        if (roomMember !== 0) {
          // draw play button
          createCanvasButton(canvas.width / 2 - 80, canvas.height * 0.75, canvas.width / 2 - 15, canvas.height * 0.8, 'Play');

          if (isInside(mousePos, playRect)) socket.emit('join', { roomMember: roomMember });
        }
      }
    });
  }

  socket.on('errorJoining', displayErrorJoin);
  socket.on('joined', setUser);
  socket.on('displayPoints', updatePoints);
  socket.on('displayWinLose', updateWinLose);
  socket.on('updatedMovement', update);
  socket.on('reload', reloadBullets);
  socket.on('displayPlayAgain', handleGameOver);
  socket.on('resetPos', resetPosition);
  socket.on('left', removeUser);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
'use strict';

var redPts = 0;
var bluePts = 0;

var winMsg = '';
var loseMsg = '';

// function that updates client's points variables
var updatePoints = function updatePoints(data) {
  redPts = data.redPts;
  bluePts = data.bluePts;
};

// function that updates win/lose msg on game over 
var updateWinLose = function updateWinLose(data) {
  winMsg = data.win;
  loseMsg = data.lose;
};

// function that updates client's bullets array
var reloadBullets = function reloadBullets(data) {
  circles[data.hash].bullets = data.bullets;
};

// function that updates data for all circles when server sends response
var update = function update(data) {
  if (!circles[data.hash]) {
    circles[data.hash] = data;
    return;
  }

  if (circles[data.hash].lastUpdate >= data.lastUpdate) return;

  var circle = circles[data.hash];

  if (data.hash === hash) {
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
var handleGameOver = function handleGameOver() {
  gameOver = true;
  canvas.addEventListener('click', function (e) {
    var mousePos = getMousePos(canvas, e);

    var gameOverRect = {
      x: canvas.width / 2 - 80,
      y: canvas.height * 0.75,
      width: 160,
      height: 50
    };

    if (gameOver && isInside(mousePos, gameOverRect)) {
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
var removeUser = function removeUser(data) {
  if (circles[data.hash]) delete circles[data.hash];
};

// function that sets up newly connected users client-side
var setUser = function setUser(data) {
  onStart = false;
  hash = data.hash;
  circles[hash] = data;

  // set X positions
  switch (circles[hash].roomMember) {
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
  circles[hash].prevY = canvas.height / 2;
  circles[hash].y = canvas.height / 2;
  circles[hash].destY = canvas.height / 2;

  requestAnimationFrame(redraw);
};

// function that resets client's position on game's restart
var resetPosition = function resetPosition() {
  // set Y positions 
  circles[hash].prevY = canvas.height / 2;
  circles[hash].y = canvas.height / 2;
  circles[hash].destY = canvas.height / 2;
};

// function that updates client's movements and sends updated data to server
var updatePosition = function updatePosition() {
  var circle = circles[hash];

  circle.prevY = circle.y;

  if (circle.moveUp && circle.destY > 0 + circle.radius) circle.destY -= 10;
  if (circle.moveDown && circle.destY < canvas.height - circle.radius) circle.destY += 10;

  if (circle.moveUp) circle.direction = directions.UP;
  if (circle.moveDown) circle.direction = directions.DOWN;

  // set bullet's position to player's current position and fire
  if (circle.shooting) {
    circle.bullets[0].fired = true;
  }

  if (circle.bullets.length > 0) {
    if (circle.bullets[0].fired && !circle.shooting) {
      circle.bullets[0].prevX = circle.x;
      circle.bullets[0].x = circle.x;
      circle.bullets[0].destX = circle.x;
      circle.bullets[0].y = circle.y;
      circle.shotsFired.push(circle.bullets[0]);
      circle.bullets.splice(0, 1);
    }
  } else {
    circle.bulletsTimer++;

    if (circle.bulletsTimer >= 200) {
      socket.emit('reloadRequest', { bullets: circle.bullets });
      circle.bulletsTimer = 0;
    }
  }

  for (var i = 0; i < circle.shotsFired.length; i++) {
    circle.shotsFired[i].prevX = circle.shotsFired[i].x;
    // determines which direction fired projectiles travel in
    if (circle.roomMember === 1 || circle.roomMember === 2) {
      circle.shotsFired[i].destX += 10;
      circle.shotsFired[i].direction = 'right';
    } else if (circle.roomMember === 3 || circle.roomMember === 4) {
      circle.shotsFired[i].destX -= 10;
      circle.shotsFired[i].direction = 'left';
    }

    // determine which team gets a point depending on which side the bullet leaves the canvas
    if (circle.shotsFired[i].x > canvas.width) {
      socket.emit('updatePoints', { roomNum: circle.roomNum, redPoints: 1, bluePoints: 0 });
      circle.shotsFired.splice(0, 1);
    } else if (circle.shotsFired[i].x < 0) {
      socket.emit('updatePoints', { roomNum: circle.roomNum, redPoints: 0, bluePoints: 1 });
      circle.shotsFired.splice(0, 1);
    }
  }

  // set shield position to character position
  if (circle.shielding) {
    circle.shield.active = true;
  } else {
    circle.shield.active = false;
  }

  // set shield position to character position
  if (circle.shield.active) {
    circle.shield.x = circle.x;
    circle.shield.y = circle.y;
  }

  socket.emit('movementUpdate', circle);
};
