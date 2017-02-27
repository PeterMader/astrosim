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

    camera.rotateY((startX - e.clientX) * .001)
    camera.rotateX((startY - e.clientY) * -.001)

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
  const speed = 1
  keyboard.on('w', () => {
    camera.moveForward(speed)
  })

  keyboard.on('s', () => {
    camera.moveForward(-speed)
  })

  keyboard.on('a', () => {
    camera.moveLeft(-speed)
  })

  keyboard.on('d', () => {
    camera.moveLeft(speed)
  })

  keyboard.on('Enter', () => {
    camera.upwards = [0, 0, camera.upwards[2] === 1 ? -1 : 1]
  })

  keyboard.on('PageUp', () => {
    camera.position[1] += speed
  })

  keyboard.on('PageDown', () => {
    camera.position[1] -= speed
  })

  keyboard.on('ArrowUp', () => {
    camera.rotationX -= .05
  })

  keyboard.on('ArrowDown', () => {
    camera.rotationX += .05
  })

  keyboard.on('ArrowLeft', () => {
    camera.rotateY(-.05)
  })

  keyboard.on('ArrowRight', () => {
    camera.rotateY(.05)
  })
}
