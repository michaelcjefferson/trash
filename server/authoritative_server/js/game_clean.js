const objects = {}

let totalPlayers = {
  total: 0,
  blue: 0,
  red: 0
}
let totalCookies = 0
let totalObstacles = 0

const config = {
  type: Phaser.HEADLESS,
  parent: 'antz-io',
  width: 1920,
  height: 1080,
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
}

function preload() {
  this.load.image('smlcrumb', 'assets/20x20_Crumb.png')
  this.load.image('lrgcrumb', 'assets/50x50_Crumb.png')
  this.load.image('smlcookie', 'assets/75x75_Cookie.png')
  this.load.image('halfcookie', 'assets/90x150_HalfCookie.png')
  this.load.image('lrgcookie', 'assets/150x150_Cookie.png')
  this.load.image('log', 'assets/50x185_Log.png')
  this.load.image('leaf', 'assets/350x150_Leaf.png')
  this.load.image('ant', 'assets/Antz_Player.jpg')
  this.load.image('redgoal', 'assets/350x250_RedTeamGoal.png')
  this.load.image('bluegoal', 'assets/350x250_BlueTeamGoal.png')

  this.load.json('objectProps', 'assets/objectProps.json')
}

function create() {
  const objectProps = this.cache.json.get('objectProps')
  
  const self = this

  this.objects = this.add.group()

  this.matter.world.setBounds(0, 0, game.config.width, game.config.height)

  this.bluegoal = this.matter.add.rectangle(275, 540, 250, 150, {
    isStatic: true
  })
  this.redgoal = this.matter.add.rectangle(1645, 540, 250, 150, {
    isStatic: true
  })

  objects['a0s8dgnasndg0'] = {
    type: objectProps.cookies.halfcookie.type,
    label: objectProps.cookies.halfcookie.label,
    angle: Math.floor(Math.random() * 360),
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    objectId: 'a0s8dgnasndg0'
  }
  addObject(self, objects['a0s8dgnasndg0'], objectProps.cookies.halfcookie)

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

  io.on('connection', function (socket) {
    console.log('Somebody connected.')
    objects[socket.id] = {
      type: 'player',
      label: 'ant',
      angle: Math.floor(Math.random() * 360),
      x: Math.floor(Math.random() * 700) + 50,
      y: Math.floor(Math.random() * 500) + 50,
      objectId: socket.id,
      team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue',
      input: {
        left: false,
        right: false,
		    up: false
      }
    }

    totalPlayers.total += 1
    objects[socket.id].team === 'red' ? totalPlayers.red += 1 : totalPlayers.blue += 1

    addPlayer(self, objects[socket.id])

    socket.emit('currentObjects', objects)
    socket.broadcast.emit('newPlayer', objects[socket.id])

    socket.on('disconnect', function () {
      console.log('Somebody disconnected.')
      totalPlayers.total -= 1
      objects[socket.id].team === 'red' ? totalPlayers.red -= 1 : totalPlayers.blue -= 1
      removeObject(self, socket.id)
      delete objects[socket.id]
      io.emit('disconnect', socket.id)
    })

    socket.on('playerInput', function (inputData) {
      handlePlayerInput(self, socket.id, inputData)
    })
  })
}

function update() {
  this.objects.getChildren().forEach((object) => {
    if (object.type === 'player') {
      const input = objects[object.objectId].input

      if (input.left) {
        object.setAngularVelocity(-0.15)
      } else if (input.right) {
        object.setAngularVelocity(0.15)
      } else {
        object.setAngularVelocity(0)
      }

      if (input.up) {
        object.thrust(0.005)
      } else {
        object.thrust(0)
      }

      objects[object.objectId].x = object.x
      objects[object.objectId].y = object.y
      objects[object.objectId].angle = object.angle
    } else {
      object.thrust(0.0000002)

      objects[object.objectId].x = object.x
      objects[object.objectId].y = object.y
      objects[object.objectId].angle = object.angle
    }
  })

  // this.matter.world.on('collisionstart', collisionEvent)

  io.emit('objectUpdates', objects)
}

function collisionEvent(event) {
  console.log(event)
}

function addObject(self, info, props) {
  // TODO: Need to register nothing for players
  info.type === 'cookie' ? totalCookies += 1 : totalObstacles += 1
  const object = self.matter.add.sprite(info.x, info.y, props.label).setOrigin(0.5, 0.5)
  if (props.isCircle) {
    object.setCircle()
  }
  // console.log(props.hasVertices)
  // console.log(props.vertices)
  // if (props.hasVertices) {
  //   object.setBody({
  //     type: 'fromVertices',
  //     verts: props.vertices,
  //     x: info.x,
  //     y: info.y
  //   })
  // }
  object.setFrictionAir(props.frictionAir)
  object.setMass(props.mass)
  object.setAngle(info.angle)
  object.type = props.type
  object.objectId = info.objectId
  self.objects.add(object)
  // console.log(object)
  // console.log(object.vertices)
}

function addPlayer(self, playerInfo) {
  const player = self.matter.add.sprite(playerInfo.x, playerInfo.y, 'ant').setOrigin(0.5, 0.5)
  //* This value manipulates top speed - lower value = higher top speed
  player.setFrictionAir(0.4)
  //* This value manipulates acceleration - lower value = higher acceleration
  player.setMass(1)
  player.setAngle(playerInfo.angle)
  player.type = 'player'
  player.objectId = playerInfo.objectId
  self.objects.add(player)
}

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
      object.destroy()
    }
  })
}

function handlePlayerInput(self, playerId, input) {
  self.objects.getChildren().forEach((player) => {
    if (playerId === player.objectId) {
      objects[player.objectId].input = input
    }
  })
}

function addObstacle(self, obstacleInfo) {
  const obstacle = self.matter.add.sprite(obstacleInfo.x, obstacleInfo.y, obstacleInfo.label)
  obstacle.setFrictionAir(0.4)
  obstacle.setMass(obstacleInfo.mass)
  obstacle.type = 'obstacle'
  obstacle.objectId = obstacleInfo.objectId
  self.objects.add(obstacle)
}

function randomPosition(max) {
  return Math.floor(Math.random() * max) + 50
}

function randomNumber(max) {
  return Math.floor(Math.random() * max)
}

function createId() {
  let id = 'nasdf'
  return id
}

const game = new Phaser.Game(config)

window.gameLoaded()