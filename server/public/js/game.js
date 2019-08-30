const config = {
  // Will automatically default to display mode i.e. render graphics
  type: Phaser.AUTO,
  parent: 'antz-io',
  width: 1920,
  height: 1080,
  backgroundColor: '#EFDFD0',
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image('smlcrumb', 'assets/20x20_Crumb.png');
  this.load.image('lrgcrumb', 'assets/50x50_Crumb.png');
  this.load.image('smlcookie', 'assets/75x75_Cookie.png');
  this.load.image('halfcookie', 'assets/90x150_HalfCookie.png');
  this.load.image('lrgcookie', 'assets/150x150_Cookie.png');
  this.load.image('log', 'assets/50x185_Log.png');
  this.load.image('leaf', 'assets/350x150_Leaf.png');
  this.load.image('ant', 'assets/Antz_Player.jpg');
  this.load.image('redgoal', 'assets/350x250_RedTeamGoal.png');
  this.load.image('bluegoal', 'assets/350x250_BlueTeamGoal.png');
}

function create() {
  const self = this;
  this.socket = io();
  this.objects = this.add.group();

  this.blueGoal = this.add.sprite(275, 540, 'bluegoal').setOrigin(0.5, 0.5);
  this.redGoal = this.add.sprite(1645, 540, 'redgoal').setOrigin(0.5, 0.5);

  this.blueScoreText = this.add.text(16, 16, '0', { fontSize: '72px', fill: '#0000FF' });
  this.redScoreText = this.add.text(1904, 16, '0', { fontSize: '72px', fill: '#FF0000' }).setOrigin(1, 0);

  // Handle currentPlayers broadcast from server - update players list and display them correctly
  this.socket.on('currentObjects', function (objects) {
    Object.keys(objects).forEach(function (id) {
      if (objects[id].objectId === self.socket.id) {
        displayObjects(self, objects[id], 'ant');
      } else {
        displayObjects(self, objects[id], objects[id].label);
      }
    });
  });

  // Handle newPlayer broadcast from server - add new player to display
  this.socket.on('newPlayer', function (playerInfo) {
    displayObjects(self, playerInfo, 'ant');
  })

  // Handle disconnect broadcast from server - remove players as they disconnect. Also destroy objects as they need to be
  this.socket.on('destroyObject', function (objectId) {
    self.objects.getChildren().forEach(function (object) {
      if (objectId === object.objectId) {
        object.destroy();
      }
    });
  });

  // Handle all objects' movements
  this.socket.on('objectUpdates', function (objects) {
    Object.keys(objects).forEach(function (id) {
      self.objects.getChildren().forEach(function (object) {
        if (objects[id].objectId === object.objectId) {
          object.setAngle(objects[id].angle);
          object.setPosition(objects[id].x, objects[id].y);
        }
      });
    });
  });

  // Handle score updates
  this.socket.on('updateScore', function (scores) {
    self.blueScoreText.setText(scores.blue);
    self.redScoreText.setText(scores.red);
  });

  // Set up client-side controls which will be broadcast directly to server
  this.cursors = this.input.keyboard.createCursorKeys();
  this.leftKeyPressed = false;
  this.rightKeyPressed = false;
  this.upKeyPressed = false;
}

function update() {
  const left = this.leftKeyPressed;
  const right = this.rightKeyPressed;
  const up = this.upKeyPressed;

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
  } else {
    this.upKeyPressed = false;
  }

  // Check for changes between previous inputs and current ones, and if one is found, update the server
  if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed) {
    this.socket.emit('playerInput', { left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed });
  }
}

function displayObjects(self, objectInfo, sprite) {
  const object = self.add.sprite(objectInfo.x, objectInfo.y, sprite).setOrigin(0.5, 0.5);
  if (objectInfo.team) {
    if (objectInfo.team === 'blue') {
      object.setTint(0x00aaff)
    } else {
      object.setTint(0xff6666);
    }
  }
  object.objectId = objectInfo.objectId;
  self.objects.add(object);
}