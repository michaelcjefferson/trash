const objects = {};

const cookieProps = {
  smlcrumb: {
    detail: 'smlcrumb',
    url: 'assets/20x20_Crumb.png',
    mass: 1
  },
  lrgcrumb: {
    detail: 'lrgcrumb',
    url: 'assets/50x50_Crumb.png',
    mass: 1.5
  },
  smlcookie: {
    detail: 'smlcookie',
    url: 'assets/75x75_Cookie.png',
    mass: 5
  },
  halfcookie: {
    detail: 'halfcookie',
    url: 'assets/90x150_HalfCookie.png',
    mass: 7
  },
  lrgcookie: {
    detail: 'lrgcookie',
    url: 'assets/150x150_Cookie.png',
    mass: 12
  }
}

const obstacleProps = {
  log: {
    detail: 'log',
    url: 'assets/50x185_Log.png',
    mass: 10
  },
  leaf: {
    detail: 'leaf',
    url: 'assets/350x150_Leaf.png',
    mass: 6
  }  
}

const config = {
  type: Phaser.HEADLESS,
  parent: 'antz-io',
  width: 800,
  height: 600,
  physics: {
    default: 'matter',
    matter: {
      debug: true,
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
  autoFocus: false
};

function preload() {
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

  this.objects = this.add.group();

  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);

  let startingObstacles = {
    quantity: 1,
    xPositions: [500],
    yPositions: [300]
  }

  for (const i of Array(startingObstacles.quantity).keys()) {
    let id = 'o1';
    while (objects[id]) {
      id = 'o' + randomNumber(10000);
    }
    objects[id] = {
      base: 'obstacle',
      detail: Object.keys(obstacleProps)[Math.floor(Object.keys(obstacleProps).length * Math.random())],
      objectId: id,
      rotation: 0,
      x: startingObstacles.xPositions[i],
      y: startingObstacles.yPositions[i]
    };
    addObstacle(self, objects[id]);
  }

  objects['antTest'] = {
    base: 'test',
    detail: 'smlcookie',
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    objectId: 'antTest'
  };
  addTest(self, objects['antTest'])

  io.on('connection', function (socket) {
    console.log('Somebody connected.')
    objects[socket.id] = {
      base: 'player',
      detail: 'ant',
      rotation: 0,
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      objectId: socket.id,
      team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
      input: {
        left: false,
        right: false,
		    up: false,
		    down: false,
      }
    };

    addPlayer(self, objects[socket.id]);

    socket.emit('currentObjects', objects);
    socket.broadcast.emit('newPlayer', objects[socket.id]);

    socket.on('disconnect', function () {
      console.log('Somebody disconnected.')
      removeObject(self, socket.id);
      delete objects[socket.id];
      io.emit('disconnect', socket.id);
    });

    socket.on('playerInput', function (inputData) {
      handlePlayerInput(self, socket.id, inputData);
    });
  })
}

function update() {
  this.objects.getChildren().forEach((object) => {
    if (object.base === 'player') {
      const input = objects[object.objectId].input;

      if (input.left) {
        object.setAngularVelocity(-0.15);
      } else if (input.right) {
        object.setAngularVelocity(0.15);
      } else {
        object.setAngularVelocity(0);
      }

      if (input.up) {
        object.thrust(0.005);
      } else {
        object.thrust(0);
      }

      objects[object.objectId].x = object.x;
      objects[object.objectId].y = object.y;
      objects[object.objectId].rotation = object.rotation;
    // }
    } else {
      object.setAngularVelocity(0)
      object.thrust(0.0000002)

      objects[object.objectId].x = object.x;
      objects[object.objectId].y = object.y;
      objects[object.objectId].rotation = object.rotation;
    }
  });

  // this.matter.world.on('collisionstart', collisionEvent)

  io.emit('objectUpdates', objects);
}

function collisionEvent(event) {
  console.log(event)
}

function addPlayer(self, playerInfo) {
  const player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'ant').setOrigin(0.5, 0.5);
  player.setFrictionAir(0.4);
  player.setMass(1)
  player.base = 'player'
  player.objectId = playerInfo.objectId;
  self.objects.add(player);
}

function removeObject(self, objectId) {
  self.objects.getChildren().forEach((object) => {
    if (objectId === object.objectId) {
      object.destroy();
    }
  });
}

function handlePlayerInput(self, playerId, input) {
  self.objects.getChildren().forEach((player) => {
    if (playerId === player.objectId) {
      objects[player.objectId].input = input;
    }
  });
}

function addCookie(self, cookieInfo) {
  const cookie = self.matter.add.sprite(cookieInfo.x, cookieInfo.y, cookieInfo.detail).setOrigin(0.5, 0.5);
  cookie.setFrictionAir(0.4);
  cookie.setMass(cookieInfo.mass);
  cookie.base = 'cookie'
  cookie.objectId = cookieInfo.objectId;
  self.objects.add(cookie);
}

function addObstacle(self, obstacleInfo) {
  const obstacle = self.matter.add.sprite(obstacleInfo.x, obstacleInfo.y, obstacleInfo.detail);
  obstacle.setFrictionAir(0.4);
  obstacle.setMass(obstacleInfo.mass);
  obstacle.base = 'obstacle'
  obstacle.objectId = obstacleInfo.objectId;
  self.objects.add(obstacle);
}

function randomPosition(max) {
  return Math.floor(Math.random() * max) + 50;
}

function randomNumber(max) {
  return Math.floor(Math.random() * max);
}

function addTest(self, info) {
  const test = self.matter.add.sprite(info.x, info.y, 'smlcookie')
  test.setFrictionAir(0.4)
  test.setMass(1)
  test.base = 'test'
  test.objectId = info.objectId
  self.objects.add(test)
}

const game = new Phaser.Game(config);

window.gameLoaded();