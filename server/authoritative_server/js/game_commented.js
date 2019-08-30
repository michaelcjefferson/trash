const objects = {};
// const cookies = {};
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
// const obstacles = {};
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
  // Headless server to be run on the server and control game logic, as opposed to rendering graphics on client browser
  type: Phaser.HEADLESS,
  parent: 'antz-io',
  width: 800,
  height: 600,
  // Set up physics
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
  // Required to prevent window.focus error on headless server
  autoFocus: false
};

function preload() {
  const self = this;

	// Object.keys(cookieProps).forEach(function (item) {
  //   self.load.image(cookieProps[item].type, cookieProps[item].url);
  // });
  // Object.keys(obstacleProps).forEach(function (item) {
  //   self.load.image(obstacleProps[item].type, obstacleProps[item].url);
  // });
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

    // this.collisionEvent = function (event) {
  //   event.pairs.forEach((pair) => {
  //     const { bodyA, bodyB } = pair
  
  //     if (bodyA.type === 'goal' && bodyB.gameObject && bodyB.gameObject.type === 'cookie') {
  //       if (!bodyB.gameObject.team || bodyB.gameObject.team !== bodyA.team) {
  //         const id = bodyB.gameObject.objectId
  //         const pointValue = bodyB.gameObject.pointValue
  //         let team = 'blue'
  //         if (self.stealObjective && bodyA.team === 'red') {
  //           team = 'red'
  //         } else if (!self.stealObjective && bodyA.team === 'blue') {
  //           team = 'red'
  //         }
  //         if (self.scores[team] + (pointValue || 1) <= self.scores.max) {
  //           self.objects.getChildren().forEach((object) => {
  //             if (object.objectId === id) {
  //               let spawnx = objects[id].spawnx
  //               let spawny = objects[id].spawny
  //               console.log('match B:', spawnx, spawny)
  //               console.log(object.x)
  //               // console.log(self.matter)
  //               self.matter.body.setPosition(object, { x: 500, y: 500 })
  //               // object.setPosition(objects[id].spawnx, objects[id].spawny)
  //               // object.translate(objects[id].spawnx, objects[id].spawny)
  //               // object.setVelocity(0)
  //               console.log(object.x)
  //             }
  //           })
  //           objects[id].x = objects[id].spawnx
  //           objects[id].y = objects[id].spawny
  //           io.emit('objectUpdates', objects)
  //           self.scores[team] = self.scores[team] + (pointValue || 1)
  //         } else {
  //           self.scores[team] = self.scores.max
  //           removeObject(self, id)
  //           delete objects[id]
  //           io.emit('destroyObject', id)
  //         }
  //         io.emit('updateScore', self.scores)
  //       }
  //     } else if (bodyB.type === 'goal' && bodyA.gameObject && bodyA.gameObject.type === 'cookie') {
  //       if (!bodyA.gameObject.team || bodyA.gameObject.team !== bodyB.team) {
  //         const id = bodyA.gameObject.objectId
  //         const pointValue = bodyA.gameObject.pointValue
  //         let team = 'blue'
  //         if (self.stealObjective && bodyB.team === 'red') {
  //           team = 'red'
  //         } else if (!self.stealObjective && bodyB.team === 'blue') {
  //           team = 'red'
  //         }
  //         if (self.scores[team] + (pointValue || 1) <= self.scores.max) {
  //           self.objects.getChildren().forEach((object) => {
  //             if (object.objectId === id) {
  //               console.log('match A')
  //               // console.log(object)
  //               object.setPosition(objects[id].spawnx, objects[id].spawny)
  //               object.setVelocity(0)
  //             }
  //           })
  //           objects[id].x = objects[id].spawnx
  //           objects[id].y = objects[id].spawny
  //           io.emit('objectUpdates', objects)
  //           self.scores[team] = self.scores[team] + (pointValue || 1)
  //         } else {
  //           self.scores[team] = self.scores.max
  //           removeObject(self, id)
  //           delete objects[id]
  //           io.emit('destroyObject', id)
  //         }
  //         io.emit('updateScore', self.scores)
  //       }
  //     }
  //   })
  // }

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
  /*let startingCookies = {
    quantity: 3,
    xPositions: [100, 600, 650],
    yPositions: [400, 100, 450]
  }

  for (const i of Array(startingCookies.quantity).keys()) {
    // TODO: Create a starting position here, which needs to include a check to make sure that it won't spawn on top of something else, or that it pushes other items out of the way
    // TODO: Create ID
    let id = 'o0';
    while (objects[id]) {
      id = 'o' + randomNumber(10000);
    }
    // Add to cookies object with ID as the key
    objects[id] = {
      base: 'cookie',
      // TODO: This is disgusting, make it pretty
      detail: Object.keys(cookieProps)[Math.floor(Object.keys(cookieProps).length * Math.random())],
      objectId: id,
      // TODO: Randomise rotation
      rotation: 0,
      // TODO: Improve spawn randomisation
      // x: Math.floor(Math.random() * 700) + 50,
      // y: Math.floor(Math.random() * 500) + 50
      x: startingCookies.xPositions[i],
      y: startingCookies.yPositions[i]
    };

    addCookie(self, objects[id]);
  }*/

  //*Various working tests
  objects['antTest'] = {
    type: objectProps.cookies.smlcookie.type,
    label: objectProps.cookies.smlcookie.label,
    angle: Math.floor(Math.random() * 360),
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    objectId: 'antTest'
  }
  addTest(self, objects['antTest'], objectProps.cookies.smlcookie)
  
  objects['vertTest'] = {
    type: 'cookie',
    label: 'halfcookie',
    x: 675,
    y: 125,
    objectId: 'vertTest'
  }
  addVertTest(self, objects['vertTest'])

  // Add obstacles to the world on generation
  let startingObstacles = {
    quantity: 1,
    xPositions: [500],
    yPositions: [300]
  }

  for (const i of Array(startingObstacles.quantity).keys()) {
    // TODO: Create a starting position here, which needs to include a check to make sure that it won't spawn on top of something else, or that it pushes other items out of the way
    // TODO: Create ID
    let id = 'o1';
    while (objects[id]) {
      id = 'o' + randomNumber(10000);
    }
    // Add to obstacles object with ID as the key
    objects[id] = {
      base: 'obstacle',
      detail: Object.keys(obstacleProps)[Math.floor(Object.keys(obstacleProps).length * Math.random())],
      objectId: id,
      // TODO: Randomise rotation
      rotation: 0,
      // TODO: Improve spawn randomisation
      // x: Math.floor(Math.random() * 700) + 50,
      // y: Math.floor(Math.random() * 500) + 50
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
    // console.log("objects", objects)

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
      // console.log('Server received playerInput')
      handlePlayerInput(self, socket.id, inputData);
    });
  })
}

function update() {
  // Handle input changes
  this.objects.getChildren().forEach((object) => {
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

      //* Kind of working applyForce acceleration
      // if (input.up) {
      //   Phaser.Physics.Matter.Matter.Body.applyForce(object.body, {x: object.x, y: object.y}, {
      //     x: Math.cos(object.angle) * .010,
      //     y: Math.sin(object.angle) * .010
      //   })
      // } else {
      //   Phaser.Physics.Matter.Matter.Body.applyForce(object.body, {x:0,y:0}, {x:0,y:0})
      // }

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

  // Update cookie and obstacle positions
  // io.emit('cookieObstacleUpdates', cookies, obstacles);
}

function collisionEvent(event) {
  console.log(event)
}

// Logic to add a player object to the game, called in create()
function addPlayer(self, playerInfo) {
  console.log('playerInfo:', playerInfo)
  const player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'ant').setOrigin(0.5, 0.5);
  // player.setBody({
  //   type: 'rectangle',
  //   width: 50,
  //   height: 50
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
  player.base = 'player'
  player.objectId = playerInfo.objectId;
  // console.log('player object:', player)
  self.objects.add(player);
  // console.log("self.objects:", self.objects)
}

//* Various working tests
function addTest(self, info, props) {
  const test = self.matter.add.sprite(info.x, info.y, props.label)
  if (props.isCircle) {
    test.setCircle()
  }
  test.setFrictionAir(props.frictionAir)
  test.setMass(props.mass)
  test.setAngle(info.angle)
  test.type = props.type
  test.objectId = info.objectId
  self.objects.add(test)
}

// setBody works, but only with one set of vertices - at the moment, the objects with verts are set up as composites, so they have several sets of verts, which doesn't work with this method
function addVertTest(self, info) {
  const test = self.matter.add.sprite(675, 125, 'halfcookie')
  test.setBody({
    type: 'fromVertices',
    verts: [ { "x":1, "y":6 }, { "x":4, "y":14 }, { "x":31, "y":58 }, { "x":88, "y":98 }, { "x":68, "y":25 }, { "x":53, "y":14 }, { "x":30, "y":5 }, { "x":9, "y":3 } ],
    x: 675,
    y: 125
  })
  test.type = 'cookie'
  test.objectId = info.objectId
  self.objects.add(test)
  // console.log(test.vertices)
  // console.log(test)
}

function removeObject(self, objectId) {
  self.objects.getChildren().forEach((object) => {
    if (objectId === object.objectId) {
      object.destroy();
    }
  });
}

function handlePlayerInput(self, playerId, input) {
  // console.log('handlePlayerInput called:', playerId, input)
  self.objects.getChildren().forEach((player) => {
    // console.log('Socket ID match found')
    if (playerId === player.objectId) {
      objects[player.objectId].input = input;
    }
  });
}

function addCookie(self, cookieInfo) {
  console.log('cookieInfo:', cookieInfo)
  const cookie = self.matter.add.sprite(cookieInfo.x, cookieInfo.y, cookieInfo.detail).setOrigin(0.5, 0.5);
  // const cookie = self.matter.add.sprite(cookieInfo.x, cookieInfo.y, 'ant').setOrigin(0.5, 0.5);
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
  cookie.base = 'cookie'
  cookie.objectId = cookieInfo.objectId;
  self.objects.add(cookie);
}

function addObstacle(self, obstacleInfo) {
  console.log('obstacleInfo:', obstacleInfo)
  // const obstacle = self.matter.add.sprite(obstacleInfo.x, obstacleInfo.y, obstacleInfo.type).setOrigin(0.5, 0.5);
  const obstacle = self.matter.add.sprite(obstacleInfo.x, obstacleInfo.y, obstacleInfo.detail);
  obstacle.setBody({
    type: 'rectangle',
    width: 75,
    height: 75
  })
  obstacle.setFrictionAir(0.4);
  obstacle.setMass(obstacleInfo.mass);
  // obstacle.setCollisionCategory(self.obstacleColliderGroup);
  // Set up collisions
  // obstacle.setCollidesWith([ self.playerColliderGroup, self.cookieColliderGroup, self.obstacleColliderGroup ]);
  obstacle.base = 'obstacle'
  obstacle.objectId = obstacleInfo.objectId;
  console.log('obstacle object:', obstacle)
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
  // test.setBody({
  //   type: 'rectangle',
  //   width: 11,
  //   height: 11
  // })
  test.setFrictionAir(0.4)
  test.setMass(1)
  test.base = 'test'
  test.objectId = info.objectId
  console.log('test object:', test)
  self.objects.add(test)
}

const game = new Phaser.Game(config);

window.gameLoaded();


  // "maze": {
  //   "maxPlayers": 100,
  //   "maxScore": 5,
  //   "stealObjective": false,
  //   "randomObstacles": {
  //     "logs": {
  //       "label": "log",
  //       "number": 6
  //     }
  //   },
  //   "randomCookies": {},
  //   "obstacles": [
  //     {
  //       "label": "log",
  //       "x": 700,
  //       "y": 200,
  //       "team": null,
  //       "angle": 90
  //     }
  //   ],
  //   "cookies": [
  //     {
  //       "label": "smlcookie",
  //       "x": 960,
  //       "y": 540,
  //       "team": null,
  //       "pointValue": 1,
  //       "frictionAir": 0.004,
  //       "bounce": 1,
  //       "mass": 0.4
  //     }
  //   ]
  // }