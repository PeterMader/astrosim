const animation = require('./animation.js')
const {mainLoop} = require('../astrosim.js')
const dialogManager = require('../ui/dialogs/dialog-manager.js')
const ui = require('../ui/ui.js')

module.exports = function () {
  const {canvas} = this

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
    if (animation.dragging) {
      if (e.clientX > canvas.width * .95) {
        animation.translate(1, 0)
      } else if (e.clientX < canvas.width * .05) {
        animation.translate(-1, 0)
      } else if (e.clientY > canvas.height * .95) {
        animation.translate(0, 1)
      } else if (e.clientY < canvas.height * .05) {
        animation.translate(0, -1)
      }
      animation.draggingPosition[0] = e.clientX
      animation.draggingPosition[1] = e.clientY
      animation.shouldRender = true
      return
    }

    if (!mouseHeld) {
      return
    }

    animation.translate(startX - e.clientX, startY - e.clientY)
    document.body.position = 'absolute'
    startX = e.clientX
    startY = e.clientY
  })

  canvas.addEventListener('mouseup', (e) => {
    if (animation.dragging && dialogManager.openDialog) {
      dialogManager.openDialog.emit('drag-end')
    }
  })

  document.body.addEventListener('mouseup', () => {
    mouseHeld = false
  })

  ui.keyboard.on('keyup', (e) => {
    if (!dialogManager.openDialog) {
      // canvas is visible
      const translation = e.shiftKey ? 10 : 100
      if (e.key === 'ArrowUp') {
        animation.translate(0, translation)
      } else if (e.key === 'ArrowDown') {
        animation.translate(0, -translation)
      } else if (e.key === 'ArrowLeft') {
        animation.translate(translation, 0)
      } else if (e.key === 'ArrowRight') {
        animation.translate(-translation, 0)
      } else if (e.key === '+' || e.key === '*') {
        animation.scale(e.shiftKey ? 1.05 : 2, 0, 0)
      } else if (e.key === '-' || e.key === '_') {
        animation.scale(e.shiftKey ? .95 : .5, 0, 0)
      } else if (e.key === 't') {
        animation.drawHistory = !animation.drawHistory
        animation.shouldRender = true
      } else if (e.key === 'c') {
        animation.drawControls = !animation.drawControls
        animation.shouldRender = true
      } else if (e.key === 'l') {
        animation.drawLabels = !animation.drawLabels
        animation.shouldRender = true
      }
    }
  })

  ui.keyboard.on('x', (e) => {
    if (animation.dragging && ui.dialogs.openDialog) {
      animation.dragging = false
      ui.dialogs.openDialog.show()
    }
  })
}
