const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

// create the settings dialog
const settingsDialog = module.exports = new Dialog(document.getElementById('settings-dialog'))

// get the input elements
const translationX = document.getElementById('settings-translation-x')
const translationY = document.getElementById('settings-translation-y')
const scalingFactor = document.getElementById('settings-scaling-factor')
const drawHistory = document.getElementById('settings-draw-history')
const drawControls = document.getElementById('settings-draw-controls')
const drawLabels = document.getElementById('settings-draw-labels')
const timeFactor = document.getElementById('settings-time-factor')

// the checked state of checkboxes is cached, so we need to check and uncheck them ourselves if we want them to be (un)checked by default
drawHistory.checked = true
drawControls.checked = true
drawLabels.checked = false

// set the filter logic of the input elements
settingsDialog.registerInput(translationX, translationY, scalingFactor, timeFactor)
settingsDialog.setFilterFunction(scalingFactor, Dialog.greaterThanZero)
settingsDialog.setFilterFunction(timeFactor, Dialog.greaterThanZero)

// set the input values when the dialog is opened
settingsDialog.setValues = () => {
  drawHistory.checked = animation.drawHistory
  drawControls.checked = animation.drawControls
  drawLabels.checked = animation.drawLabels
  settingsDialog.set({
    'translation-x': animation.translation[0].toExponential(3),
    'translation-y': animation.translation[1].toExponential(3),
    'scaling-factor': animation.ratio.toExponential(3),
    'time-factor': content.TIME_FACTOR.toExponential(3)
  })
}

document.getElementById('center-viewport').addEventListener('click', () => {
  animation.translation[0] = translationX.value = 0
  animation.translation[1] = translationY.value = 0

  ui.selectedObject = null
})

document.getElementById('settings-submit').addEventListener('click', settingsDialog.submit = () => {
  if (settingsDialog.validate()) {
    animation.translation[0] = Number(translationX.value)
    animation.translation[1] = Number(translationY.value)
    animation.ratio = Number(scalingFactor.value)
    animation.drawHistory = drawHistory.checked
    animation.drawControls = drawControls.checked
    animation.drawLabels = drawLabels.checked
    settingsDialog.close()
    content.TIME_FACTOR = Number(timeFactor.value)
    animation.shouldRender = true
  }
})
