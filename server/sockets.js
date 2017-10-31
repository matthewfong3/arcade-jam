const xxh = require('xxhashjs');
const Character = require('./classes/Character.js');
const Bullet = require('./classes/Bullet.js');
const Shield = require('./classes/Shield.js');
const physics = require('./physics.js');

const characters = {};

let io;

let roomMember = 1;

let redPoints = 0;
let bluePoints = 0;

const setupSockets = (ioServer) => {
  io = ioServer;

  io.on('connection', (sock) => {
    const socket = sock;

    socket.join('room1'); // multiple rooms?

    const hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);

    // initial character setup
    socket.hash = hash;
    characters[hash] = new Character(hash);
    characters[hash].roomMember = roomMember;
    for (let i = 0; i < 3; i++) {
      characters[hash].bullets.push(new Bullet());
    }
    characters[hash].shield = new Shield();
    roomMember++;

    socket.emit('joined', characters[hash]);

    io.sockets.in('room1').emit('displayPoints', { redPts: redPoints, bluePts: bluePoints });

    socket.on('updatePoints', (data) => {
      redPoints += data.redPoints;
      bluePoints += data.bluePoints;

      io.sockets.in('room1').emit('displayPoints', { redPts: redPoints, bluePts: bluePoints });

      if (redPoints >= 3 || bluePoints >= 3) {
        io.sockets.in('room1').emit('displayWinLose', { win: 'You Win', lose: 'You Lose' });
      }
    });

    socket.on('reloadRequest', (data) => {
      for (let i = 0; i < 3; i++) {
        data.bullets.push(new Bullet());
      }
      socket.emit('reload', { hash: socket.hash, bullets: data.bullets });
    });

    socket.on('movementUpdate', (data) => {
      characters[socket.hash] = data;

      characters[socket.hash].lastUpdate = new Date().getTime();

      physics.setCharacter(characters[socket.hash]);

      io.sockets.in('room1').emit('updatedMovement', characters[socket.hash]);
    });

    socket.on('disconnect', () => {
      io.sockets.in('room1').emit('left', characters[socket.hash]);

      delete characters[socket.hash];

      physics.setCharacterList(characters);

      socket.leave('room1');
    });
  });
};

module.exports.setupSockets = setupSockets;
