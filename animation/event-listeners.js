const animation = require('./animation.js')
const math = require('../content/math.js')
const ui = require('../ui/ui.js')

module.exports = function () {
  const {canvas} = this
  const camera = animation.camera

  const translate = (e) => {
    if (!mouseHeld) {
      return
    }

    camera.rotateY((startX - e.clientX) * .0004)
    camera.rotateX((startY - e.clientY) * .0004)

    document.body.position = 'absolute'
  }

  window.addEventListener('resize', () => {
    animation.adjust()
  })

  // event for the scaling
  canvas.addEventListener('wheel', (e) => {
    const factor = e.deltaY > 0 ? -10 : 10
    camera.moveForward(factor)
  })

  // events for the canvas translation
  let startX = 0, startY = 0, mouseHeld = false
  canvas.addEventListener('mousedown', (e) => {
    mouseHeld = true
    startX = e.clientX
    startY = e.clientY
    document.body.position = 'fixed'
  })
  canvas.addEventListener('mousemove', (e) => {
    translate(e)
    startX = e.clientX
    startY = e.clientY
  })
  canvas.addEventListener('mouseup', translate)
  document.body.addEventListener('mouseup', () => {
    mouseHeld = false
  })

  const {keyboard} = ui
  keyboard.on('w', () => {
    camera.moveForward(.2)
  })

  keyboard.on('s', () => {
    camera.moveForward(-.2)
  })

  keyboard.on('a', () => {
    camera.moveLeft(-.2)
  })

  keyboard.on('d', () => {
    camera.moveLeft(.2)
  })

  keyboard.on('Enter', () => {
    camera.upwards = [0, 0, camera.upwards[2] === 1 ? -1 : 1]
  })

  keyboard.on('PageUp', () => {
    camera.position[1] += .01
  })

  keyboard.on('PageDown', () => {
    camera.position[1] -= .01
  })

  keyboard.on(' ', () => {
    camera.position[1] = 2
  })

  keyboard.on('ArrowUp', () => {
    if (camera.rotationX > -math.degToRad(20)) {
      camera.rotationX -= .1
    }
  })

  keyboard.on('ArrowDown', () => {
    if (camera.rotationX < math.degToRad(20)) {
      camera.rotationX += .1
    }
  })

  keyboard.on('ArrowLeft', () => {
    camera.rotateY(-.005)
  })

  keyboard.on('ArrowRight', () => {
    camera.rotateY(.005)
  })
}
