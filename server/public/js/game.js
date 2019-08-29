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
  this.load.image('smlcrumb', 'assets/20x20_Crumb.png')
  this.load.image('smlcrumbsnitch', 'assets/20x20_Crumb_Snitch.png')
  this.load.image('lrgcrumb', 'assets/50x50_Crumb.png')
  this.load.image('lrgcrumbblue', 'assets/50x50_Crumb_Blue.png')
  this.load.image('lrgcrumbred', 'assets/50x50_Crumb_Red.png')
  this.load.image('smlcookie', 'assets/75x75_Cookie.png')
  this.load.image('smlcookieblue', 'assets/75x75_Cookie_Blue.png')
  this.load.image('smlcookiered', 'assets/75x75_Cookie_Red.png')
  this.load.image('lrgcookie', 'assets/150x150_Cookie.png')
  this.load.image('lrgcookieblue', 'assets/150x150_Cookie_Blue.png')
  this.load.image('lrgcookiered', 'assets/150x150_Cookie_Red.png')
  this.load.image('log', 'assets/50x185_Log.png')
  this.load.image('goalblue', 'assets/250x250_BlueGoal.png')
  this.load.image('goalred', 'assets/250x250_RedGoal.png')
  this.load.image('teamlineblue', 'assets/300x1080_Blue_Team_Line.png')
  this.load.image('teamlinered', 'assets/300x1080_Red_Team_Line.png')
  this.load.image('background', 'assets/1920x1080_background.png')
  this.load.image('antblue', 'assets/Antz_Blue_Player.png')
  this.load.image('antred', 'assets/Antz_Red_Player.png')
}

function create() {
  const self = this;
  this.socket = io();
  this.objects = this.add.group();

  this.background = this.add.image(960, 540, 'background').setOrigin(0.5, 0.5)

  this.blueTeamLine = this.add.image(150, 540, 'teamlineblue').setOrigin(0.5, 0.5)
  this.redTeamLine = this.add.image(1770, 540, 'teamlinered').setOrigin(0.5, 0.5)

  this.blueGoal = this.add.sprite(125, 540, 'goalblue').setOrigin(0.5, 0.5);
  this.redGoal = this.add.sprite(1795, 540, 'goalred').setOrigin(0.5, 0.5);

  this.blueScoreText = this.add.text(16, 16, '0', { fontSize: '72px', fill: '#0000FF' });
  this.redScoreText = this.add.text(1904, 16, '0', { fontSize: '72px', fill: '#FF0000' }).setOrigin(1, 0);

  // Handle currentPlayers broadcast from server - update players list and display them correctly
  this.socket.on('currentObjects', function (objects) {
    Object.keys(objects).forEach(function (id) {
      displayObjects(self, objects[id], objects[id].label);
    });
  });

  // Handle newPlayer broadcast from server - add new player to display
  this.socket.on('newPlayer', function (playerInfo) {
    displayObjects(self, playerInfo, playerInfo.label);
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
    // console.log(objects)
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

  // Handle game-over screen
  this.socket.on('gameoverText', (team, newLevel, stealObjective) => {
    const winnerMessage = team.toUpperCase() + ' WON!!!!'
    const newLevelMessage = 'The next level will be ' + newLevel
    let objectiveMessage = "Push cookies into \nthe other team's goal!"
    if (stealObjective) {
      objectiveMessage = "Steal the other team's cookies and\nbring them back to your goal!"
    }
    let fill = '#0000FF'
    if (team === 'red') {
      fill = '#FF0000'
    }
    this.gameoverText = this.add.text(960, 260, winnerMessage, {
      fontSize: '256px',
      fill: fill,
      backgroundColor: '#33333388'
    }).setOrigin(0.5, 0.5)
    this.newLevelText = this.add.text(960, 640, newLevelMessage, {
      fontSize: '84px',
      fill: '#ffffff',
      backgroundColor: '#33333388'
    }).setOrigin(0.5, 0.5)
    this.objectiveText = this.add.text(960, 840, objectiveMessage, {
      fontSize: '72px',
      fill: '#ffffff',
      backgroundColor: '#33333388'
    }).setOrigin(0.5, 0.5).setAlign('center')
  })

  // Handle new game screen
  this.socket.on('destroyGameoverText', () => {
    this.gameoverText.destroy()
    this.newLevelText.destroy()
    this.objectiveText.destroy()
  })

  // this.blueScoreText = this.add.text(16, 16, '0', { fontSize: '72px', fill: '#0000FF' });

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
  const object = self.add.sprite(objectInfo.x, objectInfo.y, sprite).setOrigin(0.5, 0.5)
  object.objectId = objectInfo.objectId;
  self.objects.add(object);
}