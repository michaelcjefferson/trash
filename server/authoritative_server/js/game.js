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
	//this.load.image('ship', 'assets/spaceShips_001.png');
	this.load.image('antplayer', 'assets/Antz_Player.jpg');
  this.load.image('star', 'assets/star_gold.png');
}

function create() {
  // Save this instance of Phaser so that it can be referenced within nested functions
  const self = this;
  // Enable Phaser to control all players in a grouped manner (use same logic etc.) so that collision check can be done once on the group rather than individually
  this.players = this.physics.add.group();

  // Set up score tracker
  this.scores = {
    blue: 0,
    red: 0
  };

  // Add first star to map and give it collision physics
  this.star = this.physics.add.image(randomPosition(700), randomPosition(500), 'star');
  this.physics.add.collider(this.players);

  // When a player touches a star (overlaps the star), a new score is calculated and broadcast, and a new star position is created and broadcast
  this.physics.add.overlap(this.players, this.star, function (star, player) {
    if (players[player.playerId].team === 'red') {
      self.scores.red += 10;
    } else {
      self.scores.blue += 10;
    }
    self.star.setPosition(randomPosition(700), randomPosition(500));
    io.emit('updateScore', self.scores);
    io.emit('starLocation', { x: self.star.x, y: self.star.y});
  })

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
		up: false,
		down: false,
      }
    };

    // Add player to server
    addPlayer(self, players[socket.id]);
    // Send the players object (full list of current players) to the new player
    socket.emit('currentPlayers', players);
    // Update all other players with the new player
    socket.broadcast.emit('newPlayer', players[socket.id]);

    // Update game scores
    socket.emit('starLocation', { x: self.star.x, y: self.star.y });
    socket.emit('updateScore', self.scores);

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
      player.setVelocityX(-300);
    } else if (input.right) {
      player.setVelocityX(300);
    } else {
      player.setVelocityX(0);
    }

    if (input.up) {
      //this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
        player.setVelocityY(-300);
    } else if (input.down) {
      //this.physics.velocityFromRotation(player.rotation + 1.5, 200, player.body.acceleration);
        player.setVelocityY(300);
    } else {
      //player.setAcceleration(0);
     player.setVelocityY(0);
    }

    players[player.playerId].x = player.x;
    players[player.playerId].y = player.y;
    //players[player.playerId].rotation = player.rotation;
  });

  // Allow players to enter left side of screen from right side
  this.physics.world.wrap(this.players, 5);

  io.emit('playerUpdates', players);
}

// Logic to add a player object to the game, called in create()
function addPlayer(self, playerInfo) {
  // The 'physics' word below allows the image to use the arcade physics previously set up
  const player = self.physics.add.image(playerInfo.x, playerInfo.y, 'antplayer').setOrigin(0.5, 0.5).setDisplaySize(10, 10);
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

function randomPosition(max) {
  return Math.floor(Math.random() * max) + 50;
}

const game = new Phaser.Game(config);

window.gameLoaded();