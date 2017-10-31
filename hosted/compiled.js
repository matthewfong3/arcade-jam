'use strict';

var directions = {
  UP: 0,
  DOWN: 1
};

// try to find another way to display points
var redPts = 0;
var bluePts = 0;

var winMsg = '';
var loseMsg = '';

var displayPoints = function displayPoints(data) {
  redPts = data.redPts;
  bluePts = data.bluePts;
};

var displayWinLose = function displayWinLose(data) {
  winMsg = data.win;
  loseMsg = data.lose;
};

var lerp = function lerp(v0, v1, alpha) {
  return (1 - alpha) * v0 + alpha * v1;
};

var redraw = function redraw(time) {
  updatePosition();

  // set screen default settings
  ctx.clearRect(0, 0, 1152, 648);
  ctx.save();
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

  // display points
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText("Red Points: " + redPts, 10, canvas.height * 0.04);
  ctx.fillText("Blue Points: " + bluePts, canvas.width * 0.88, canvas.height * 0.04);
  ctx.restore();

  // display win/lose messages
  ctx.fillStyle = 'black';
  if (redPts >= 3) {
    if (circles[hash].x < canvas.width / 2) {
      ctx.fillText(winMsg, canvas.width / 2, canvas.height / 2);
    } else {
      ctx.fillText(loseMsg, canvas.width / 2, canvas.height / 2);
    }
  } else if (bluePts >= 3) {
    if (circles[hash].x < canvas.width / 2) {
      ctx.fillText(loseMsg, canvas.width / 2, canvas.height / 2);
    } else {
      ctx.fillText(winMsg, canvas.width / 2, canvas.height / 2);
    }
  }

  var keys = Object.keys(circles);

  for (var i = 0; i < keys.length; i++) {
    var circle = circles[keys[i]];

    if (circle.alpha < 1) circle.alpha += 0.05;

    if (circle.hash === hash) {
      ctx.filter = 'none';
    } else {
      ctx.filter = 'hue-rotate(40deg)';
    }

    circle.y = lerp(circle.prevY, circle.destY, circle.alpha);

    // draw player
    if (circle.roomMember === 1 || circle.roomMember === 2) ctx.fillStyle = 'red';else if (circle.roomMember === 3 || circle.roomMember === 4) ctx.fillStyle = 'blue';

    ctx.beginPath();
    ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2, false);
    ctx.closePath();
    ctx.fill();

    // draw bullet
    for (var _i = 0; _i < circle.shotsFired.length; _i++) {
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

var keyDownHandler = function keyDownHandler(e) {
  var keyPressed = e.which;
  var circle = circles[hash];

  if (keyPressed === 87 || keyPressed === 38) circle.moveUp = true;else if (keyPressed === 83 || keyPressed === 40) circle.moveDown = true;else if (keyPressed === 32 && e.target === document.body && !circle.shooting) {
    e.preventDefault();
    console.log('spacebar pressed: activate shield');
    circle.shielding = true;
  } else if (keyPressed === 70 && circle.bullets.length > 0) {
    console.log('f pressed: fire bullet');
    circle.shooting = true;
  }
};

var keyUpHandler = function keyUpHandler(e) {
  var keyPressed = e.which;
  var circle = circles[hash];

  if (keyPressed === 87 || keyPressed === 38) circle.moveUp = false;else if (keyPressed === 83 || keyPressed === 40) circle.moveDown = false;else if (keyPressed === 32 && e.target === document.body) {
    e.preventDefault();
    circle.shielding = false;
  } else if (keyPressed === 70) {
    circle.shooting = false;
  }
};

var init = function init() {
  canvas = document.querySelector("#canvas");
  ctx = canvas.getContext("2d");

  socket = io.connect();

  socket.on('joined', setUser);
  socket.on('displayPoints', displayPoints);
  socket.on('displayWinLose', displayWinLose);
  socket.on('reload', function (data) {
    circles[data.hash].bullets = data.bullets;
  });
  socket.on('updatedMovement', update);
  socket.on('left', removeUser);

  document.body.addEventListener('keydown', keyDownHandler);
  document.body.addEventListener('keyup', keyUpHandler);
};

window.onload = init;
'use strict';

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
    circle.shotsFired = data.shotsFired;
    circle.shield = data.shield;
  }

  circle.alpha = 0.05;
};

var removeUser = function removeUser(data) {
  if (circles[data.hash]) delete circles[data.hash];
};

var setUser = function setUser(data) {
  if (!circles[data.hash]) {
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
  }
};

var updatePosition = function updatePosition() {
  var circle = circles[hash];

  circle.prevY = circle.y;

  if (circle.moveUp && circle.destY > 0 + circle.radius) circle.destY -= 5;
  if (circle.moveDown && circle.destY < canvas.height - circle.radius) circle.destY += 5;

  if (circle.moveUp) circle.direction = directions.UP;
  if (circle.moveDown) circle.direction = directions.DOWN;

  // set bullet's position to player's current position and fire
  if (circle.shooting) {
    circle.bullets[0].fired = true;
  }

  if (circle.bullets.length > 0) {
    if (circle.bullets[0].fired && !circle.shooting) {
      circle.bullets[0].x = circle.x;
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
    // determine which direction the bullet fires depending on player position
    if (circle.x < canvas.width / 2) circle.shotsFired[i].x += 5;else circle.shotsFired[i].x -= 5;

    // determine which team gets a point depending on which side the bullet leaves the canvas
    if (circle.shotsFired[i].x > canvas.width) {
      socket.emit('updatePoints', { redPoints: 1, bluePoints: 0 });
      circle.shotsFired.splice(0, 1);
    } else if (circle.shotsFired[i].x < 0) {
      socket.emit('updatePoints', { redPoints: 0, bluePoints: 1 });
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

  circle.alpha = 0.05;

  socket.emit('movementUpdate', circle);
};
