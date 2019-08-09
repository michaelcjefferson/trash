const players = {};
const cookies = {};

const config = {
  // Headless server to be run on the server and control game logic, as opposed to rendering graphics on client browser
  type: Phaser.HEADLESS,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  // Set up physics
  physics: {
    default: 'matter',
    matter: {
      debug: false,
      gravity: {
        x: 0,
        y: 0
      }
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
	// this.load.image('ship', 'assets/spaceShips_001.png');
	// this.load.image('antplayer', 'assets/Antz_Player.jpg');
  // this.load.image('star', 'assets/star_gold.png');
  this.load.image('ant', 'assets/Antz_Player.jpg');
}

function create() {
  // Save this instance of Phaser so that it can be referenced within nested functions
  const self = this;

  // Enable Phaser to control all players in a grouped manner (use same logic etc.) so that collision check can be done once on the group rather than individually
  //? Set up a group to add ants to
  this.players = this.add.group();
  //? Set up a collision category to add ants to
  this.antColliderGroup = this.matter.world.nextCategory();

  //? World bounds
  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);

  // Set up score tracker
  this.scores = {
    blue: 0,
    red: 0
  };

  // Add first star to map and give it collision physics
  //! this.star = this.physics.add.image(randomPosition(700), randomPosition(500), 'star');
  //! this.physics.add.collider(this.players);

  // When a player touches a star (overlaps the star), a new score is calculated and broadcast, and a new star position is created and broadcast
  //! this.physics.add.overlap(this.players, this.star, function (star, player) {
  //   if (players[player.playerId].team === 'red') {
  //     self.scores.red += 10;
  //   } else {
  //     self.scores.blue += 10;
  //   }
  //   self.star.setPosition(randomPosition(700), randomPosition(500));
  //   io.emit('updateScore', self.scores);
  //   io.emit('starLocation', { x: self.star.x, y: self.star.y});
  //! })

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
    //! socket.emit('starLocation', { x: self.star.x, y: self.star.y });
    //! socket.emit('updateScore', self.scores);

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

  //* Rotation controls. Set up compass controls below and test both

    if (input.left) {
      player.setAngularVelocity(-0.15);
    } else if (input.right) {
      player.setAngularVelocity(0.15);
    } else {
      player.setVelocityX(0);
    }

    if (input.up) {
      player.thrust(0.005);
    } else {
      player.thrust(0);
    }

    players[player.playerId].x = player.x;
    players[player.playerId].y = player.y;
    players[player.playerId].rotation = player.rotation;
  });

  io.emit('playerUpdates', players);
}

// Logic to add a player object to the game, called in create()
function addPlayer(self, playerInfo) {
  const player = self.matter.add.image(playerInfo.x, playerInfo.y, 'ant').setOrigin(0.5, 0.5);
  player.setBody({
    type: 'rectangle',
    width: 11,
    height: 11
  });
  //* This value manipulates top speed - lower value = higher top speed
  player.setFrictionAir(0.4);
  //* This value manipulates acceleration - lower value = higher acceleration
  player.setMass(1)
  player.setCollisionCategory(self.antColliderGroup);
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