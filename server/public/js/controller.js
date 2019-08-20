const socket = io()

let playerControls = {
  leftKeyPressed: false,
  rightKeyPressed: false,
  upKeyPressed: false
}

function getDirection(id) {
  if (id === 'forward-button') {
    return 'upKeyPressed'
  } else if (id === 'left-button') {
    return 'leftKeyPressed'
  } else if (id === 'right-button') {
    return 'rightKeyPressed'
  } else {
    console.error('The id of the button that was pressed does not match the controls.')
  }
}

function handleStart(event) {
  const direction = getDirection(event.target.id)
  playerControls[direction] = !playerControls[direction]
  updateServer()
}

function handleEnd(event) {
  const direction = getDirection(event.target.id)
  playerControls[direction] = !playerControls[direction]
  updateServer()
}

function updateServer() {
  socket.emit('playerInput', {
    left: playerControls.leftKeyPressed,
    right: playerControls.rightKeyPressed,
    up: playerControls.upKeyPressed
  })
}

function startup() {
  const buttons = document.getElementsByClassName("button");
  for (let button of buttons) {
    button.addEventListener("touchstart", handleStart, false)
    button.addEventListener("touchend", handleEnd, false)
    button.addEventListener("mousedown", handleStart, false)
    button.addEventListener("mouseup", handleEnd, false)
  }
}

window.onload = startup