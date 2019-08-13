const config = {
  // Will automatically default to display mode i.e. render graphics
  type: Phaser.AUTO,
  parent: 'antz-io',
  width: 800,
  height: 600,
  backgroundColor: '#EFDFD0',
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
  this.objects = this.add.group();
  // this.cookies = this.add.group();
  // this.obstacles = this.add.group();


  // this.blueScoreText = this.add.text(16, 16, '', { fontSize: '32px', fill: '#0000FF' });
  // this.redScoreText = this.add.text(584, 16, '', { fontSize: '32px', fill: '#FF0000' });

  // Handle currentPlayers broadcast from server - update players list and display them correctly
  this.socket.on('currentObjects', function (objects) {
    Object.keys(objects).forEach(function (id) {
      if (objects[id].objectId === self.socket.id) {
        displayObjects(self, objects[id], 'ant');
      } else {
        displayObjects(self, objects[id], objects[id].type);
      }
    });
  });

  // Handle currentCookies broadcast from server - update cookies list and display them correctly
  // this.socket.on('currentCookies', function (cookies) {
  //   Object.keys(cookies).forEach(function (id) {
  //     displayCookies(self, cookies[id], cookies[id].type);
  //   });
  // });

  // Handle currentObstacles broadcast from server - update obstacles list and display them correctly
  // this.socket.on('currentObstacles', function (obstacles) {
  //   Object.keys(obstacles).forEach(function (id) {
  //     displayObstacles(self, obstacles[id], obstacles[id].type);
  //   });
  // });

  // Handle newPlayer broadcast from server - add new player to display
  this.socket.on('newPlayer', function (playerInfo) {
    displayObjects(self, playerInfo, 'ant');
  })

  // Handle disconnect broadcast from server - remove players as they disconnect
  this.socket.on('disconnect', function (playerId) {
    self.objects.getChildren().forEach(function (player) {
      if (playerId === player.objectId) {
        player.destroy();
      }
    });
  });

  // Handle all objects' movements
  this.socket.on('objectUpdates', function (objects) {
    Object.keys(objects).forEach(function (id) {
      self.objects.getChildren().forEach(function (object) {
        if (objects[id].objectId === object.objectId) {
          object.setRotation(objects[id].rotation);
          object.setPosition(objects[id].x, objects[id].y);
        }
      });
    });
  });

  // Handle movements of cookies and obstacles
  // this.socket.on('cookieObstacleUpdates', function (cookies, obstacles) {
  //   Object.keys(cookies).forEach(function (id) {
  //     self.cookies.getChildren().forEach(function (cookie) {
  //       if (cookies[id].cookieId === cookie.cookieId) {
  //         cookie.setRotation(cookies[id].rotation);
  //         cookie.setPosition(cookies[id].x, cookies[id].y);
  //       }
  //     });
  //   });
  //   Object.keys(obstacles).forEach(function (id) {
  //     self.obstacles.getChildren().forEach(function (obstacle) {
  //       if (obstacles[id].obstacleId === obstacle.obstacleId) {
  //         obstacle.setRotation(obstacles[id].rotation);
  //         obstacle.setPosition(obstacles[id].x, obstacles[id].y);
  //       }
  //     });
  //   });
  // });

  // Handle score and star updates
  // this.socket.on('updateScore', function (scores) {
  //   self.blueScoreText.setText('Blue: ' + scores.blue);
  //   self.redScoreText.setText('Red: ' + scores.red);
  // });

  // this.socket.on('starLocation', function (starLocation) {
  //   if (!self.star) {
  //     self.star = self.add.image(starLocation.x, starLocation.y, 'star');
  //   } else {
  //     self.star.setPosition(starLocation.x, starLocation.y);
  //   }
  // });

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
    console.log('Client called playerInput')
    this.socket.emit('playerInput', { left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed });
  }
}

function displayObjects(self, objectInfo, sprite) {
  const object = self.add.sprite(objectInfo.x, objectInfo.y, sprite).setOrigin(0.5, 0.5);
  if (objectInfo.team) {
    if (objectInfo.team === 'blue') {
      object.setTint(0x0000ff)
    } else {
      object.setTint(0xff0000);
    }
  }
  object.objectId = objectInfo.objectId;
  self.objects.add(object);
}

// function displayCookies(self, cookieInfo, sprite) {
//   const cookie = self.add.sprite(cookieInfo.x, cookieInfo.y, sprite).setOrigin(0.5, 0.5);
//   cookie.cookieId = cookieInfo.cookieId;
//   self.cookies.add(cookie);
// }

// function displayObstacles(self, obstacleInfo, sprite) {
//   const obstacle = self.add.sprite(obstacleInfo.x, obstacleInfo.y, sprite).setOrigin(0.5, 0.5);
//   obstacle.obstacleId = obstacleInfo.obstacleId;
//   self.obstacles.add(obstacle);
// }