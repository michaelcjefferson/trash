const objects = {};

let totalPlayers = {
  total: 0,
  blue: 0,
  red: 0
}
let totalCookies = 0
let totalObstacles = 0

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
  this.load.image('Antz_Player', 'assets/Antz_Player.jpg');

  this.load.json('shapes', 'assets/GameObject_Collisions.json')
}

function create() {
  const shapes = this.cache.json.get('shapes')
  
  const self = this;

  this.objects = this.add.group();

  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);

  objects['a0s8dgnasndg0'] = {
    label: 'obstacle',
    detail: 'log',
    rotation: Math.floor(Math.random() * 360),
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    originx: 0.5,
    originy: 0.5,
    objectId: 'a0s8dgnasndg0'
  }
  addObject(self, objects['a0s8dgnasndg0'], shapes)

  objects['antTest'] = {
    label: 'test',
    detail: 'smlcookie',
    rotation: 0,
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    objectId: 'antTest'
  }
  addTest(self, objects['antTest'], shapes)

  io.on('connection', function (socket) {
    console.log('Somebody connected.')
    objects[socket.id] = {
      label: 'player',
      detail: 'Antz_Player',
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

    totalPlayers.total += 1
    objects[socket.id].team === 'red' ? totalPlayers.red += 1 : totalPlayers.blue += 1

    addPlayer(self, objects[socket.id], shapes);

    socket.emit('currentObjects', objects);
    socket.broadcast.emit('newPlayer', objects[socket.id]);

    socket.on('disconnect', function () {
      console.log('Somebody disconnected.')
      totalPlayers.total -= 1
      objects[socket.id].team === 'red' ? totalPlayers.red -= 1 : totalPlayers.blue -= 1
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
    if (object.label === 'player') {
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

function addObject(self, info) {
  info.label === 'cookie' ? totalCookies += 1 : totalObstacles += 1
  const object = self.matter.add.sprite(info.x, info.y, info.detail).setOrigin(info.originx, info.originy);
  // object.setFrictionAir(info.frictionAir)
  // object.setMass(info.mass)
  object.label = info.label
  object.objectId = info.objectId
  self.objects.add(object)
}

function addPlayer(self, playerInfo, shapes) {
  const player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'Antz_Player', {shape: shapes.Antz_Player}).setOrigin(0.5, 0.5);
  //* This value manipulates top speed - lower value = higher top speed
  player.setFrictionAir(0.4);
  //* This value manipulates acceleration - lower value = higher acceleration
  player.setMass(1)
  player.label = 'player'
  player.objectId = playerInfo.objectId;
  self.objects.add(player);
}

function addTest(self, info, shapes) {
  const test = self.matter.add.sprite(info.x, info.y, 'smlcookie')
  test.setCircle()
  test.setFrictionAir(0.4)
  test.setMass(1)
  test.label = 'test'
  test.objectId = info.objectId
  self.objects.add(test)
  console.log(test)
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

function addObstacle(self, obstacleInfo) {
  const obstacle = self.matter.add.sprite(obstacleInfo.x, obstacleInfo.y, obstacleInfo.detail);
  obstacle.setFrictionAir(0.4);
  obstacle.setMass(obstacleInfo.mass);
  obstacle.label = 'obstacle'
  obstacle.objectId = obstacleInfo.objectId;
  self.objects.add(obstacle);
}

function randomPosition(max) {
  return Math.floor(Math.random() * max) + 50;
}

function randomNumber(max) {
  return Math.floor(Math.random() * max);
}

const game = new Phaser.Game(config);

window.gameLoaded();