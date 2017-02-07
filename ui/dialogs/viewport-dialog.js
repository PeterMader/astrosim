const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

const viewportDialog = module.exports = new Dialog(document.getElementById('viewport-dialog'))

// get the input elements
const translationX = document.getElementById('viewport-translation-x')
const translationY = document.getElementById('viewport-translation-y')
const scalingFactor = document.getElementById('viewport-scaling-factor')

// set the filter logic of the input elements
viewportDialog.registerInput(translationX, translationY, scalingFactor)

viewportDialog.setValues = () => {
  viewportDialog.set({
    'translation-x': animation.translation[0].toExponential(3),
    'translation-y': animation.translation[1].toExponential(3),
    'scaling-factor': animation.ratio.toExponential(3)
  })
}

document.getElementById('center-viewport').addEventListener('click', () => {
  animation.translation[0] = 0
  animation.translation[1] = 0
  ui.selectedObject = null
  viewportDialog.setValues()
})

document.getElementById('viewport-submit').addEventListener('click', () => {
  if (viewportDialog.validate()) {
    animation.translation[0] = Number(translationX.value)
    animation.translation[1] = Number(translationY.value)
    animation.ratio = Number(scalingFactor.value)
    viewportDialog.close()
    animation.shouldRender = true
  }
})
