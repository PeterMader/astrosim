const animation = require('./animation.js')
const {mainLoop} = require('../astrosim.js')
const dialogManager = require('../ui/dialogs/dialog-manager.js')

module.exports = function () {
  const {canvas} = this

  const translate = (e) => {
    if (!mouseHeld) {
      return
    }

    animation.translate(startX - e.clientX, startY - e.clientY)

    document.body.position = 'absolute'
  }

  window.addEventListener('resize', () => {
    animation.adjust()
  })

  // event for the scaling
  canvas.addEventListener('wheel', (e) => {
    const factor = e.deltaY > 0 ? .5 : 2
    const clientX = (e.clientX - canvas.offsetLeft) || (canvas.width / 2)
    const clientY = (e.clientY - canvas.offsetTop) || (canvas.height / 2)

    animation.scale(factor, clientX - canvas.width / 2, clientY - canvas.height / 2)
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
  document.addEventListener('keyup', (e) => {
    if (!dialogManager.openDialog) {
      // canvas is visible
      const translation = e.shiftKey ? 10 : 100
      if (e.key === 'ArrowUp') {
        animation.translate(0, -translation)
      } else if (e.key === 'ArrowDown') {
        animation.translate(0, translation)
      } else if (e.key === 'ArrowLeft') {
        animation.translate(-translation, 0)
      } else if (e.key === 'ArrowRight') {
        animation.translate(translation, 0)
      } else if (e.key === '+' || e.key === '*') {
        animation.scale(e.shiftKey ? 1.05 : 2, 0, 0)
      } else if (e.key === '-' || e.key === '_') {
        animation.scale(e.shiftKey ? .95 : .5, 0, 0)
      }
    }
  })
}
