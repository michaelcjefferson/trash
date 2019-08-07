const players = {};

const config = {
  // Headless server to be run on the server and control game logic, as opposed to rendering graphics on client browser
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  // Set up physics
  physics: {
    default: 'arcade',
    arcade: {
      debug: false,
      gravity: { y: 0 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  },
  // Required to prevent window.focus error on headless server
  autoFocus: false
};

function preload() {
  this.load.image('ship', 'assets/spaceShips_001.png');
}

function create() {
  // Save this instance of Phaser so that it can be referenced within nested functions
  const self = this;
  // Enable Phaser to control all players in a grouped manner (use same logic etc.) so that collision check can be done once on the group rather than individually
  this.players = this.physics.add.group();

  // Socket.io is exposed to this instance in index.js
  // Handle connect
  io.on('connection', function (socket) {
    console.log('Somebody connected.')
    // Create a new player and add it to the players object
    players[socket.id] = {
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      playerId: socket.id,
      team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
      input: {
        left: false,
        right: false,
        up: false
      }
    };

    // Add player to server
    addPlayer(self, players[socket.id]);
    // Send the players object (full list of current players) to the new player
    socket.emit('currentPlayers', players);
    // Update all other players with the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Handle disconnect
    socket.on('disconnect', function () {
      console.log('Somebody disconnected.')
      // Remove player from server
      removePlayer(self, socket.id);
      // Remove player from players object
      delete players[socket.id];
      // Emit a message to all players to remove this player
      io.emit('disconnect', socket.id);
    });

    // Handle player inputs
    socket.on('playerInput', function (inputData) {
      handlePlayerInput(self, socket.id, inputData);
    });
  })
}

function update() {
  // Handle input changes
  this.players.getChildren().forEach((player) => {
    const input = players[player.playerId].input;

    if (input.left) {
      player.setAngularVelocity(-300);
    } else if (input.right) {
      player.setAngularVelocity(300);
    } else {
      player.setAngularVelocity(0);
    }

    if (input.up) {
      this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
    } else {
      player.setAcceleration(0);
    }

    players[player.playerId].x = player.x;
    players[player.playerId].y = player.y;
    players[player.playerId].rotation = player.rotation;
  });

  // Allow players to enter left side of screen from right side
  this.physics.world.wrap(this.players, 5);

  io.emit('playerUpdates', players);
}

// Logic to add a player object to the game, called in create()
function addPlayer(self, playerInfo) {
  // The 'physics' word below allows the image to use the arcade physics previously set up
  const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'ship').setOrigin(0.5, 0.5).setDisplaySize(53, 40);
  player.setDrag(100);
  player.setAngularDrag(100);
  player.setMaxVelocity(200);
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

function removePlayer(self, playerId) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      player.destroy();
    }
  });
}

function handlePlayerInput(self, playerId, input) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      players[player.playerId].input = input;
    }
  });
}

const game = new Phaser.Game(config);

window.gameLoaded();