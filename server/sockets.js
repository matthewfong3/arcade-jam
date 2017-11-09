const xxh = require('xxhashjs');
const Character = require('./classes/Character.js');
const Bullet = require('./classes/Bullet.js');
const Shield = require('./classes/Shield.js');
const physics = require('./physics.js');

let io;

const rooms = {};
let roomNum = 1;

// helper function that updates client's bullets when collision has been detected
const deleteBullet = (rN, rM, index) => {
  rooms[`room${rN}`][`roomMember${rM}`].shotsFired.splice(index, 1);

  io.sockets.in(`room${rN}`).emit('updatedMovement', rooms[`room${rN}`][`roomMember${rM}`]);
};

const setupSockets = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;

    socket.on('join', (data) => {
      socket.join(`room${roomNum}`);

      // create a new room in rooms object
      if (!rooms[`room${roomNum}`]) {
        rooms[`room${roomNum}`] = {};
        rooms[`room${roomNum}`].redPts = 0;
        rooms[`room${roomNum}`].bluePts = 0;
        rooms[`room${roomNum}`].memberCount = 0;
      }

      const keys = Object.keys(rooms[`room${roomNum}`]);

      // loop through room members in room
      // and if newly connected client selects an already existing roomMember,
      // send them an error joining message
      for (let i = 0; i < keys.length; i++) {
        if (rooms[`room${roomNum}`][keys[i]].roomMember) {
          if (rooms[`room${roomNum}`][keys[i]].roomMember === data.roomMember) {
            socket.emit('errorJoining', { msg: 'That player has already been selected' });
            return;
          }
        }
      }

      const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

      // initial character setup
      socket.hash = hash;
      rooms[`room${roomNum}`][`roomMember${data.roomMember}`] = new Character(hash);
      rooms[`room${roomNum}`][`roomMember${data.roomMember}`].roomMember = data.roomMember;
      rooms[`room${roomNum}`][`roomMember${data.roomMember}`].roomNum = roomNum;
      for (let i = 0; i < 3; i++) {
        rooms[`room${roomNum}`][`roomMember${data.roomMember}`].bullets.push(new Bullet());
      }
      rooms[`room${roomNum}`][`roomMember${data.roomMember}`].shield = new Shield();

      rooms[`room${roomNum}`].memberCount++;

      socket.roomNum = roomNum;
      socket.roomMember = data.roomMember;

      socket.emit('joined', rooms[`room${roomNum}`][`roomMember${data.roomMember}`]);
      io.sockets.in(`room${roomNum}`).emit('displayPoints', { redPts: rooms[`room${roomNum}`].redPts, bluePts: rooms[`room${roomNum}`].bluePts });

      if (rooms[`room${roomNum}`].memberCount === 4) {
        roomNum++;
      }
    });

    socket.on('updatePoints', (data) => {
      if (rooms[`room${data.roomNum}`].memberCount === 4 && rooms[`room${data.roomNum}`].redPts < 3 && rooms[`room${data.roomNum}`].bluePts < 3) {
        rooms[`room${data.roomNum}`].redPts += data.redPoints;
        rooms[`room${data.roomNum}`].bluePts += data.bluePoints;
      }

      io.sockets.in(`room${data.roomNum}`).emit('displayPoints', { redPts: rooms[`room${data.roomNum}`].redPts, bluePts: rooms[`room${data.roomNum}`].bluePts });

      // win state: if either red/blue gets 3 points, restart game
      if (rooms[`room${data.roomNum}`].redPts >= 3 || rooms[`room${data.roomNum}`].bluePts >= 3) {
        io.sockets.in(`room${data.roomNum}`).emit('displayWinLose', { win: 'You Win', lose: 'You Lose' });
        io.sockets.in(`room${data.roomNum}`).emit('displayPlayAgain', {});
      }
    });

    socket.on('reloadRequest', (data) => {
      for (let i = 0; i < 3; i++) {
        data.bullets.push(new Bullet());
      }
      socket.emit('reload', { hash: socket.hash, bullets: data.bullets });
    });

    socket.on('movementUpdate', (data) => {
      rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`] = data;

      rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].lastUpdate = new Date().getTime();

      // determines which direction fired projectiles travel in
      /*for (let i = 0; i < rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].shotsFired.length; i++) {
        if (rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].roomMember === 1 || rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].roomMember === 2) {
          rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].shotsFired[i].x += 5;
          rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].shotsFired[i].direction = 'right';
        } else if (rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].roomMember === 3 || rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].roomMember === 4) {
          rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].shotsFired[i].x -= 5;
          rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`].shotsFired[i].direction = 'left';
        }
      }*/

      physics.setCharacter(rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`]);

      io.sockets.in(`room${data.roomNum}`).emit('updatedMovement', rooms[`room${data.roomNum}`][`roomMember${data.roomMember}`]);
    });

    socket.on('restartGame', () => {
      // reset character properties
      rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`] = new Character();

      rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`].hash = socket.hash;
      rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`].roomMember = socket.roomMember;
      rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`].roomNum = socket.roomNum;
      for (let i = 0; i < 3; i++) {
        rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`].bullets.push(new Bullet());
      }
      rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`].shield = new Shield();

      // reset game room properties
      rooms[`room${socket.roomNum}`].redPts = 0;
      rooms[`room${socket.roomNum}`].bluePts = 0;

      rooms[`room${socket.roomNum}`].memberCount--;
      if (rooms[`room${socket.roomNum}`].memberCount === 0) {
        rooms[`room${socket.roomNum}`].memberCount = 4;
        io.sockets.in(`room${socket.roomNum}`).emit('resetPos', {});
      }

      io.sockets.in(`room${socket.roomNum}`).emit('displayPoints', { redPts: rooms[`room${socket.roomNum}`].redPts, bluePts: rooms[`room${socket.roomNum}`].bluePts });
    });

    socket.on('disconnect', () => {
      if (socket.roomMember) {
        io.sockets.in(`room${socket.roomNum}`).emit('left', rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`]);

        physics.setCharacterList(rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`]);

        delete rooms[`room${socket.roomNum}`][`roomMember${socket.roomMember}`];
      }

      socket.leave(`room${socket.roomNum}`);
    });
  });
};

module.exports.setupSockets = setupSockets;
module.exports.rooms = rooms;
module.exports.deleteBullet = deleteBullet;
