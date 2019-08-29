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
  this.load.image('antblue', 'assets/Antz_Blue_Player.png')
  this.load.image('antred', 'assets/Antz_Red_Player.png')

  this.load.json('objectProps', 'assets/objectProps.json')
  this.load.json('levels', 'assets/levels.json')
}

function create() {
  const objectProps = this.cache.json.get('objectProps')
  const levels = this.cache.json.get('levels')
  
  this.objects = this.add.group()

  const self = this

  this.resetGame = function (team) {
    io.emit('updateScore', self.scores)
    self.setup('football')
  }

  this.startResetGame = function (team) {
    self.scores.blue = 0
    self.scores.red = 0
    for (const id of Object.keys(objects)) {
      if (objects[id].type === 'cookie' || objects[id].type === 'obstacle') {
        removeObject(self, id)
        io.emit('destroyObject', id)
        delete objects[id]
      }
    }
    console.log(team, ' won the game!!!!!')
    window.setTimeout(this.resetGame, 5000, team)
  }

  this.collisionEvent = function (event) {
    event.pairs.forEach((pair) => {
      const { bodyA, bodyB } = pair
  
      if (bodyA.type === 'goal' && bodyB.gameObject && bodyB.gameObject.type === 'cookie') {
        if (!bodyB.gameObject.team || bodyB.gameObject.team !== bodyA.team) {
          const id = bodyB.gameObject.objectId
          const pointValue = bodyB.gameObject.pointValue
          removeObject(self, id)
          delete objects[id]
          if (self.scores[bodyA.team] + (pointValue || 1) <= self.scores.max) {
            self.scores[bodyA.team] += pointValue || 1
          } else {
            self.scores[bodyA.team] = self.scores.max
          }
          io.emit('destroyObject', id)
          io.emit('updateScore', self.scores)
        }
      } else if (bodyB.type === 'goal' && bodyA.gameObject && bodyA.gameObject.type === 'cookie') {
        if (!bodyA.gameObject.team || bodyA.gameObject.team !== bodyB.team) {
          const id = bodyA.gameObject.objectId
          const pointValue = bodyA.gameObject.pointValue
          removeObject(self, id)
          delete objects[id]
          if (self.scores[bodyB.team] + (pointValue || 1) <= self.scores.max) {
            self.scores[bodyB.team] += pointValue || 1
          } else {
            self.scores[bodyB.team] = self.scores.max
          }
          io.emit('destroyObject', id)
          io.emit('updateScore', self.scores)
        }
      }
    })
  }

  // Set up score tracker
  this.scores = {
    blue: 0,
    red: 0,
    max: undefined
  }

  // Set up player maximum
  this.maxPlayers = 100

  this.matter.world.setBounds(0, 0, game.config.width, game.config.height)

  this.goalblue = this.matter.add.rectangle(125, 540, 250, 250, {
    isStatic: true,
    isSensor: true
  })
  this.goalblue.label = 'goalblue'
  this.goalblue.type = 'goal'
  this.goalblue.team = 'blue'
  this.goalred = this.matter.add.rectangle(1795, 540, 250, 250, {
    isStatic: true,
    isSensor: true
  })
  this.goalred.label = 'goalred'
  this.goalred.type = 'goal'
  this.goalred.team = 'red'

  this.setup = function (levelType) {
    this.maxPlayers = levels[levelType].maxPlayers
    this.scores.max = levels[levelType].maxScore
    levels[levelType].cookies.forEach((cookie) => {
      objectId = createId()
      objects[objectId] = {
        type: 'cookie',
        label: cookie.label,
        angle: cookie.angle || Math.floor(Math.random() * 360),
        x: cookie.x,
        y: cookie.y,
        team: cookie.team || undefined,
        pointValue: cookie.pointValue,
        objectId: objectId
      }
      addObject(self, objects[objectId], objectProps.cookies[cookie.label], cookie)
    })
    io.emit('currentObjects', objects)
  }

  this.setup('hogwarts')

  io.on('connection', function (socket) {
    console.log('Somebody connected.')
    if (totalPlayers.total < self.maxPlayers) {
      let team = (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
      if (totalPlayers.red > totalPlayers.blue) {
        team = 'blue'
      } else if (totalPlayers.blue > totalPlayers.red) {
        team = 'red'
      }
      let label = 'ant' + team
      objects[socket.id] = {
        team: team,
        type: 'player',
        label: label,
        angle: Math.floor(Math.random() * 360),
        x: Math.floor(Math.random() * 1350) + 285,
        y: Math.floor(Math.random() * 980) + 50,
        objectId: socket.id,
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
    } else {
      socket.disconnect()
      console.log('Connection rejected because the game is full!')
    }

    socket.on('disconnect', function () {
      console.log('Somebody disconnected.')
      totalPlayers.total -= 1
      objects[socket.id].team === 'red' ? totalPlayers.red -= 1 : totalPlayers.blue -= 1
      removeObject(self, socket.id)
      delete objects[socket.id]
      io.emit('destroyObject', socket.id)
    })

    socket.on('playerInput', function (inputData) {
      handlePlayerInput(self, socket.id, inputData)
    })
  })
}

function update() {
  if (this.scores.blue >= this.scores.max) {
    this.startResetGame('blue')
  } else if (this.scores.red >= this.scores.max) {
    this.startResetGame('red')
  }

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

function addObject(self, info, props, levelInfo) {
  info.type === 'cookie' ? totalCookies += 1 : totalObstacles += 1
  const object = self.matter.add.sprite(info.x, info.y, props.label).setOrigin(0.5, 0.5)
  if (props.isCircle) {
    object.setCircle()
  }
  object.setFrictionAir(levelInfo.frictionAir || props.frictionAir)
  object.setFriction(levelInfo.friction || props.friction)
  object.setBounce(levelInfo.bounce || props.bounce)
  object.setMass(levelInfo.mass || props.mass)
  object.setAngle(info.angle)
  object.type = props.type
  object.label = props.label
  object.team = levelInfo.team
  object.pointValue = levelInfo.pointValue || props.pointValue
  object.objectId = info.objectId
  self.objects.add(object)
}

function addPlayer(self, playerInfo) {
  const player = self.matter.add.sprite(playerInfo.x, playerInfo.y, playerInfo.label).setOrigin(0.5, 0.5)
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