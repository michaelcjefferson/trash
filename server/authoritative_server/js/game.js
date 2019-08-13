const objects = {};
// const cookies = {};
const cookieProps = {
  smlcrumb: {
    type: 'smlcrumb',
    url: 'assets/20x20_Crumb.png',
    mass: 1
  },
  lrgcrumb: {
    type: 'lrgcrumb',
    url: 'assets/50x50_Crumb.png',
    mass: 1.5
  },
  smlcookie: {
    type: 'smlcookie',
    url: 'assets/75x75_Cookie.png',
    mass: 5
  },
  halfcookie: {
    type: 'halfcookie',
    url: 'assets/90x150_HalfCookie.png',
    mass: 7
  },
  lrgcookie: {
    type: 'lrgcookie',
    url: 'assets/150x150_Cookie.png',
    mass: 12
  }
}
// const obstacles = {};
const obstacleProps = {
  log: {
    type: 'log',
    url: 'assets/50x185_Log.png',
    mass: 10
  },
  leaf: {
    type: 'leaf',
    url: 'assets/350x150_Leaf.png',
    mass: 6
  }  
}

const config = {
  // Headless server to be run on the server and control game logic, as opposed to rendering graphics on client browser
  type: Phaser.HEADLESS,
  parent: 'antz-io',
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
  // Save this instance of Phaser so that it can be referenced within nested functions
  const self = this;

  // Enable Phaser to control all players in a grouped manner (use same logic etc.) so that collision check can be done once on the group rather than individually
  //? Set up a group to add ants to
  this.objects = this.add.group();
  // //? Set up a collision category to add ants to
  // this.playerColliderGroup = this.matter.world.nextCategory();
  // //? Set up a group to add cookies to
  // this.cookies = this.add.group();
  // //? Set up a collision category to add cookies to
  // this.cookieColliderGroup = this.matter.world.nextCategory();
  // //? Set up a group to add obstacles to
  // this.obstacles = this.add.group();
  // //? Set up a collision category to add obstacles to
  // this.obstacleColliderGroup = this.matter.world.nextCategory();

  // this.players.setCollidesWith([ this.playerColliderGroup, this.cookieColliderGroup ]);

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

  // Add cookies to the world on generation
  let startingCookies = 3;
  for (const i of Array(startingCookies).keys()) {
    // TODO: Create a starting position here, which needs to include a check to make sure that it won't spawn on top of something else, or that it pushes other items out of the way
    // TODO: Create ID
    let id = 0;
    while (objects[id]) {
      id = randomNumber(10000);
    }
    // Add to cookies object with ID as the key
    objects[id] = {
      base: 'cookie',
      // TODO: This is disgusting, make it pretty
      type: Object.keys(cookieProps)[Math.floor(Object.keys(cookieProps).length * Math.random())],
      objectId: id,
      // TODO: Randomise rotation
      rotation: 0,
      // TODO: Improve spawn randomisation
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50
    };

    addCookie(self, objects[id]);
  }

  // Add obstacles to the world on generation
  let startingObstacles = 1;
  for (const i of Array(startingObstacles).keys()) {
    // TODO: Create a starting position here, which needs to include a check to make sure that it won't spawn on top of something else, or that it pushes other items out of the way
    // TODO: Create ID
    let id = 1;
    while (objects[id]) {
      id = randomNumber(10000);
    }
    // Add to obstacles object with ID as the key
    objects[id] = {
      base: 'obstacle',
      type: Object.keys(obstacleProps)[Math.floor(Object.keys(obstacleProps).length * Math.random())],
      objectId: id,
      // TODO: Randomise rotation
      rotation: 0,
      // TODO: Improve spawn randomisation
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50
    };

    addObstacle(self, objects[id]);
  }

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
    objects[socket.id] = {
      base: 'player',
      type: 'ant',
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

    // Add player to server
    addPlayer(self, objects[socket.id]);
    // Send the players object (full list of current players) to the new player
    socket.emit('currentObjects', objects);
    // Send the cookies object to the new player
    // socket.emit('currentCookies', cookies);
    // Send the obstacles object to the new player
    // socket.emit('currentObstacles', obstacles);
    // Update all other players with the new player
    socket.broadcast.emit('newPlayer', objects[socket.id]);

    // Update game scores
    //! socket.emit('starLocation', { x: self.star.x, y: self.star.y });
    //! socket.emit('updateScore', self.scores);

    // TODO: Update cookie locations

    // TODO: Update obstacle locations

    // Handle disconnect
    socket.on('disconnect', function () {
      console.log('Somebody disconnected.')
      // Remove player from server
      removeObject(self, socket.id);
      // Remove player from players object
      delete objects[socket.id];
      // Emit a message to all players to remove this player
      io.emit('disconnect', socket.id);
    });

    // Handle player inputs
    socket.on('playerInput', function (inputData) {
      console.log('Server received playerInput')
      handlePlayerInput(self, socket.id, inputData);
    });
  })
}

function update() {
  // Handle input changes
  this.objects.getChildren().forEach((object) => {
    // console.log(object.base)
    if (object.base === 'player') {
      const input = objects[object.objectId].input;

      //* Rotation controls. Set up compass controls below and test both

      if (input.left) {
        object.setAngularVelocity(-0.15);
      } else if (input.right) {
        object.setAngularVelocity(0.15);
      } else {
        object.setAngularVelocity(0);
      }

      if (input.up) {
        //! This is the culprit - object.base doesn't exist, because this.objects isn't the same as the objects declared with a base
        console.log('Input up noticed')
        object.thrust(0.005);
      } else {
        object.thrust(0);
      }

      objects[object.objectId].x = object.x;
      objects[object.objectId].y = object.y;
      objects[object.objectId].rotation = object.rotation;
    }
  });

  io.emit('objectUpdates', objects);

  // Update cookie and obstacle positions
  // io.emit('cookieObstacleUpdates', cookies, obstacles);
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
  // player.setCollisionCategory(self.playerColliderGroup);
  // Set up collisions
  // player.setCollidesWith([ self.playerColliderGroup, self.cookieColliderGroup, self.obstacleColliderGroup ]);
  //! player.setCollideWorldBounds(true);
  //! player.onWorldBounds =true;
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
  console.log('handlePlayerInput called:', playerId, input)
  self.objects.getChildren().forEach((player) => {
    console.log('Socket ID match found')
    if (playerId === player.objectId) {
      objects[player.objectId].input = input;
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
  cookie.objectId = cookieInfo.objectId;
  self.objects.add(cookie);
}

function addObstacle(self, obstacleInfo) {
  const obstacle = self.matter.add.sprite(obstacleInfo.x, obstacleInfo.y, obstacleInfo.type).setOrigin(0.5, 0.5);
  obstacle.setFrictionAir(0.4);
  obstacle.setMass(obstacleInfo.mass);
  // obstacle.setCollisionCategory(self.obstacleColliderGroup);
  // Set up collisions
  // obstacle.setCollidesWith([ self.playerColliderGroup, self.cookieColliderGroup, self.obstacleColliderGroup ]);
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