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
  this.load.json('levels', 'assets/levels.json')
}

function create() {
  const objectProps = this.cache.json.get('objectProps')
  const levels = this.cache.json.get('levels')
  
  const self = this

  // TODO: Check team of cookie and compare it to goal, only add points if they're opposites
  this.collisionEvent = function (event) {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair
  
      if (bodyA.type === 'goal' && bodyB.gameObject && bodyB.gameObject.type === 'cookie') {
        const id = bodyB.gameObject.objectId
        removeObject(self, id)
        delete objects[id]
        self.scores[bodyA.team] += 1
        io.emit('destroyobject', id)
        io.emit('updateScore', self.scores)
      } else if (bodyB.type === 'goal' && bodyA.gameObject && bodyA.gameObject.type === 'cookie') {
        const id = bodyA.gameObject.objectId
        removeObject(self, id)
        delete objects[id]
        self.scores[bodyB.team] += 1
        io.emit('destroyobject', id)
        io.emit('updateScore', self.scores)
      }
    })
  }

  this.objects = this.add.group()

  // Set up score tracker
  this.scores = {
    blue: 0,
    red: 0
  }

  this.matter.world.setBounds(0, 0, game.config.width, game.config.height)

  this.bluegoal = this.matter.add.rectangle(275, 540, 350, 250, {
    isStatic: true,
    isSensor: true
  })
  this.bluegoal.label = 'bluegoal'
  this.bluegoal.type = 'goal'
  this.bluegoal.team = 'blue'
  this.redgoal = this.matter.add.rectangle(1645, 540, 250, 150, {
    isStatic: true,
    isSensor: true
  })
  this.redgoal.label = 'redgoal'
  this.redgoal.type = 'goal'
  this.redgoal.team = 'red'

  objects['a0s8dgnasndg0'] = {
    type: objectProps.cookies.smlcookie.type,
    label: objectProps.cookies.smlcookie.label,
    angle: Math.floor(Math.random() * 360),
    x: Math.floor(Math.random() * 700) + 50,
    y: Math.floor(Math.random() * 500) + 50,
    objectId: 'a0s8dgnasndg0'
  }
  addObject(self, objects['a0s8dgnasndg0'], objectProps.cookies.smlcookie)

  this.setup = function (levelType) {
    levels[levelType].cookies.forEach((cookie) => {
      objectId = createId()
      objects[objectId] = {
        type: 'cookie',
        label: cookie.label,
        angle: cookie.angle || Math.floor(Math.random() * 360),
        x: cookie.x,
        y: cookie.y,
        team: cookie.team || undefined,
        objectId: objectId
      }
      addObject(self, objects[objectId], objectProps.cookies[cookie.label])
    })
  }

  this.setup('basic')

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
      io.emit('destroyobject', socket.id)
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

  this.matter.world.on('collisionstart', this.collisionEvent)

  io.emit('objectUpdates', objects)
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
  object.setFriction(props.friction)
  object.setBounce(props.bounce)
  object.setMass(props.mass)
  object.setAngle(info.angle)
  object.type = props.type
  object.label = props.label
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

function randomPosition(max) {
  return Math.floor(Math.random() * max) + 50
}

function randomNumber(max) {
  return Math.floor(Math.random() * max)
}

function createId() {
  let S4 = function() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
 }
 return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4())
}

const game = new Phaser.Game(config)

window.gameLoaded()