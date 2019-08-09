const config = {
  // Will automatically default to display mode i.e. render graphics
  type: Phaser.AUTO,
  parent: 'phaser-example',
  width: 800,
  height: 600,
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  // TODO: Put all cookie and obstacle info in a separate dictionary to be imported by each file and iterated over
  this.load.image('smlcrumb', 'assets/20x20_Crumb.png');
  this.load.image('lrgcrumb', 'assets/50x50_Crumb.png');
  this.load.image('smlcookie', 'assets/75x75_Cookie.png');
  this.load.image('halfcookie', 'assets/90x150_HalfCookie.png');
  this.load.image('lrgcookie', 'assets/150x150_Cookie.png');
  this.load.image('log', 'assets/50x185_Log.png');
  this.load.image('leaf', 'assets/350x150_Leaf.png');
  this.load.image('ant', 'assets/Antz_Player.jpg');
}

function create() {
  const self = this;
  this.socket = io();
  this.players = this.add.group();
  this.cookies = this.add.group();
  this.obstacles = this.add.group();

  // Change background colour here
  // this.cameras.main.setBackgroundColor('#555555');

  this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  // Handle currentPlayers broadcast from server - update players list and display them correctly
  this.socket.on('currentPlayers', function (players) {
    Object.keys(players).forEach(function (id) {
      if (players[id].playerId === self.socket.id) {
        displayPlayers(self, players[id], 'ant');
      } else {
        displayPlayers(self, players[id], 'ant');
      }
    });
  });

  // Handle currentCookies broadcast from server - update cookies list and display them correctly
  this.socket.on('currentCookies', function (cookies) {
    Object.keys(cookies).forEach(function (id) {
      displayCookies(self, cookies[id], cookies[id].type);
    });
  });

  // Handle currentObstacles broadcast from server - update obstacles list and display them correctly
  this.socket.on('currentObstacles', function (obstacles) {
    Object.keys(obstacles).forEach(function (id) {
      displayObstacles(self, obstacles[id], obstacles[id].type);
    });
  });

  // Handle newPlayer broadcast from server - add new player to display
  this.socket.on('newPlayer', function (playerInfo) {
    displayPlayers(self, playerInfo, 'ant');
  })

  // Handle disconnect broadcast from server - remove players as they disconnect
  this.socket.on('disconnect', function (playerId) {
    self.players.getChildren().forEach(function (player) {
      if (playerId === player.playerId) {
        player.destroy();
      }
    });
  });

  // Handle all players' movements
  this.socket.on('playerUpdates', function (players) {
    Object.keys(players).forEach(function (id) {
      self.players.getChildren().forEach(function (player) {
        if (players[id].playerId === player.playerId) {
          player.setRotation(players[id].rotation);
          player.setPosition(players[id].x, players[id].y);
        }
      });
    });
  });

  // Handle score and star updates
  this.socket.on('updateScore', function (scores) {
    self.blueScoreText.setText('Blue: ' + scores.blue);
    self.redScoreText.setText('Red: ' + scores.red);
  });

  this.socket.on('starLocation', function (starLocation) {
    if (!self.star) {
      self.star = self.add.image(starLocation.x, starLocation.y, 'star');
    } else {
      self.star.setPosition(starLocation.x, starLocation.y);
    }
  });

  // Set up client-side controls which will be broadcast directly to server
  this.cursors = this.input.keyboard.createCursorKeys();
  this.leftKeyPressed = false;
  this.rightKeyPressed = false;
  this.upKeyPressed = false;
  this.downKeyPressed = false;
}

function update() {
  const left = this.leftKeyPressed;
  const right = this.rightKeyPressed;
  const up = this.upKeyPressed;
  const down = this.downKeyPressed;

  if (this.cursors.left.isDown) {
    this.leftKeyPressed = true;
  } else if (this.cursors.right.isDown) {
    this.rightKeyPressed = true;
  } else {
    this.leftKeyPressed = false;
    this.rightKeyPressed = false;
  }

  if (this.cursors.up.isDown) {
    this.upKeyPressed = true;
  } else if (this.cursors.down.isDown) {
    this.downKeyPressed = true;
  } else
    {
    this.upKeyPressed = false;
    this.downKeyPressed = false;
    }

  // Check for changes between previous inputs and current ones, and if one is found, update the server
  if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed|| down !== this.downKeyPressed) {
    this.socket.emit('playerInput', { left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed });
  }
}

function displayPlayers(self, playerInfo, sprite) {
  const player = self.add.sprite(playerInfo.x, playerInfo.y, sprite).setOrigin(0.5, 0.5);
  if (playerInfo.team === 'blue') {
    player.setTint(0x0000ff)
  } else {
    player.setTint(0xff0000);
  }
  player.playerId = playerInfo.playerId;
  self.players.add(player);
}

function displayCookies(self, cookieInfo, sprite) {
  const cookie = self.add.sprite(cookieInfo.x, cookieInfo.y, sprite).setOrigin(0.5, 0.5);
  cookie.cookieId = cookieInfo.cookieId;
  self.cookies.add(cookie);
}

function displayObstacles(self, obstacleInfo, sprite) {
  const obstacle = self.add.sprite(obstacleInfo.x, obstacleInfo.y, sprite).setOrigin(0.5, 0.5);
  obstacle.obstacleId = obstacleInfo.obstacleId;
  self.obstacles.add(obstacle);
}