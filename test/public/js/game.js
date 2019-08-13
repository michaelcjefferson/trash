const players = {};
// const cookies = {};
const cookieProps = {
  smlcrumb: {
    type: 'smlcrumb',
    url: '../assets/20x20_Crumb.png',
    mass: 1
  },
  lrgcrumb: {
    type: 'lrgcrumb',
    url: '../assets/50x50_Crumb.png',
    mass: 1.5
  },
  smlcookie: {
    type: 'smlcookie',
    url: './assets/75x75_Cookie.png',
    mass: 5
  },
  halfcookie: {
    type: 'halfcookie',
    url: './assets/90x150_HalfCookie.png',
    mass: 7
  },
  lrgcookie: {
    type: 'lrgcookie',
    url: '../assets/150x150_Cookie.png',
    mass: 12
  }
}
// const obstacles = {};
const obstacleProps = {
  log: {
    type: 'log',
    url: './assets/50x185_Log.png',
    mass: 10
  },
  leaf: {
    type: 'leaf',
    url: './assets/350x150_Leaf.png',
    mass: 6
  }  
}

//? Add player to players object with this ID
const socket = {
  id: 'one'
}

const config = {
  // Will automatically default to display mode i.e. render graphics
  type: Phaser.AUTO,
  parent: 'antz-io',
  width: 800,
  height: 600,
  backgroundColor: '#EFDFD0',
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
  }
};

function preload() {
  const self = this;

	Object.keys(cookieProps).forEach(function (item) {
    self.load.image(cookieProps[item].type, cookieProps[item].url);
  });
  Object.keys(obstacleProps).forEach(function (item) {
    self.load.image(obstacleProps[item].type, obstacleProps[item].url);
  });

  this.load.image('ant', 'assets/Antz_Player.jpg');
}

function create() {
  const self = this;

  //? Collision groups
  this.players = this.add.group();
  //! this.playerColliderGroup = this.matter.world.nextCategory();

  this.cookies = this.add.group();
  //! this.cookieColliderGroup = this.matter.world.nextCategory();

  this.obstacles = this.add.group();
  //! this.obstacleColliderGroup = this.matter.world.nextCategory();

  //? World bounds
  this.matter.world.setBounds(0, 0, game.config.width, game.config.height);

  // Add cookies to the world on generation
  let startingCookies = 3;
  for (const i of Array(startingCookies).keys()) {
    // TODO: Create a starting position here, which needs to include a check to make sure that it won't spawn on top of something else, or that it pushes other items out of the way
    let id = 0;
    while (cookies[id]) {
      id = randomNumber(10000);
    }
    cookies[id] = {
      // TODO: This is disgusting, make it pretty
      type: Object.keys(cookieProps)[Math.floor(Object.keys(cookieProps).length * Math.random())],
      cookieId: id,
      // TODO: Randomise rotation
      rotation: 0,
      // TODO: Improve spawn randomisation
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50
    };

    addCookie(self, cookies[id]);
  }

  // Add obstacles to the world on generation
  let startingObstacles = 1;
  for (const i of Array(startingObstacles).keys()) {
    // TODO: Create a starting position here, which needs to include a check to make sure that it won't spawn on top of something else, or that it pushes other items out of the way
    let id = 0;
    while (obstacles[id]) {
      id = randomNumber(10000);
    }
    obstacles[id] = {
      type: Object.keys(obstacleProps)[Math.floor(Object.keys(obstacleProps).length * Math.random())],
      obstacleId: id,
      // TODO: Randomise rotation
      rotation: 0,
      // TODO: Improve spawn randomisation
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50
    };

    addObstacle(self, obstacles[id]);
  }

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

  addPlayer(self, players[socket.id]);

  //? Player controls
  this.cursors = this.input.keyboard.createCursorKeys();
  this.leftKeyPressed = false;
  this.rightKeyPressed = false;
  this.upKeyPressed = false;
  this.downKeyPressed = false;
}

function update() {
  const self = this;

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
  } else {
    this.upKeyPressed = false;
    this.downKeyPressed = false;
  }

  // Check for changes between previous inputs and current ones, and if one is found, update the server
  if (left !== this.leftKeyPressed || right !== this.rightKeyPressed || up !== this.upKeyPressed|| down !== this.downKeyPressed) {
    handlePlayerInput(self, 'one', { left: this.leftKeyPressed, right: this.rightKeyPressed, up: this.upKeyPressed, down: this.downKeyPressed });
  }

  // Handle input changes
  this.players.getChildren().forEach((player) => {
    const input = players[player.playerId].input;
  
    //* Rotation controls. Set up compass controls below and test both
  
    if (input.left) {
      player.setAngularVelocity(-0.15);
    } else if (input.right) {
      player.setAngularVelocity(0.15);
    } else {
      player.setAngularVelocity(0);
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
}

// Logic to add a player object to the game, called in create()
function addPlayer(self, playerInfo) {
  const player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'ant').setOrigin(0.5, 0.5);
  // player.setBody({
  //   type: 'rectangle',
  //   width: 11,
  //   height: 11
  // });
  //* This value manipulates top speed - lower value = higher top speed
  player.setFrictionAir(0.4);
  //* This value manipulates acceleration - lower value = higher acceleration
  player.setMass(1)

  //? Don't port this to server code as it is already in client code
  if (playerInfo.team === 'blue') {
    player.setTint(0x0000ff)
  } else {
    player.setTint(0xff0000);
  }

  // player.setCollisionCategory(self.playerColliderGroup);
  // Set up collisions
  // player.setCollidesWith([ self.playerColliderGroup, self.cookieColliderGroup, self.obstacleColliderGroup ]);
  //! player.setCollideWorldBounds(true);
  //! player.onWorldBounds =true;
  player.playerId = playerInfo.playerId;
  self.players.add(player);
  //!
  // console.log(self.playerColliderGroup);
  console.log('players:', self.players);
}

function handlePlayerInput(self, playerId, input) {
  self.players.getChildren().forEach((player) => {
    if (playerId === player.playerId) {
      players[player.playerId].input = input;
    }
  });
}

function addCookie(self, cookieInfo) {
  const cookie = self.matter.add.sprite(cookieInfo.x, cookieInfo.y, cookieInfo.type).setOrigin(0.5, 0.5);
  // cookie.setBody({
  //   type: 'rectangle',
  //   width: 75,
  //   height: 75
  // });
  cookie.setFrictionAir(0.4);
  cookie.setMass(cookieInfo.mass);
  // cookie.setCollisionCategory(self.cookieColliderGroup);
  // Set up collisions
  // cookie.setCollidesWith([ self.playerColliderGroup, self.cookieColliderGroup, self.obstacleColliderGroup ]);
  cookie.cookieId = cookieInfo.cookieId;
  cookie.type = cookieInfo.type;
  self.cookies.add(cookie);
  console.log('cookies:', self.cookies);
  //!
  // console.log(self.cookieColliderGroup);
}

function addObstacle(self, obstacleInfo) {
  const obstacle = self.matter.add.sprite(obstacleInfo.x, obstacleInfo.y, obstacleInfo.type).setOrigin(0.5, 0.5);
  obstacle.setFrictionAir(0.4);
  obstacle.setMass(obstacleInfo.mass);
  // obstacle.setCollisionCategory(self.obstacleColliderGroup);
  // Set up collisions
  // obstacle.setCollidesWith([ self.playerColliderGroup, self.cookieColliderGroup, self.obstacleColliderGroup ]);
  obstacle.obstacleId = obstacleInfo.obstacleId;
  self.obstacles.add(obstacle);
  //!
  // console.log(self.obstacleColliderGroup);
}

function randomPosition(max) {
  return Math.floor(Math.random() * max) + 50;
}

function randomNumber(max) {
  return Math.floor(Math.random() * max);
}

const game = new Phaser.Game(config);