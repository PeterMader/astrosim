const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const Color = require('../../animation/color.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

const objectDialog = module.exports = new Dialog(document.getElementById('object-dialog'))

// get the input elements
const name = document.getElementById('object-name')
const positionX = document.getElementById('object-position-x')
const positionY = document.getElementById('object-position-y')
const velocityX = document.getElementById('object-velocity-x')
const velocityY = document.getElementById('object-velocity-y')
const mass = document.getElementById('object-mass')
const radius = document.getElementById('object-radius')
const color = document.getElementById('object-color')

// set the filter logic of the input elements
objectDialog.registerInput(name, positionX, positionY, velocityX, velocityY, mass, radius)
objectDialog.setFilterFunction(mass, Dialog.greaterThanZero)
objectDialog.setFilterFunction(radius, Dialog.greaterThanZero)

objectDialog.on('open', () => {
  name.focus()
})

objectDialog.on('drag-end', () => {
  // convert cursor position into simulation position
  positionX.value = ((animation.draggingPositionStart[0] - animation.translation[0] - animation.canvas.width / 2) * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
  positionY.value = ((animation.draggingPositionStart[1] - animation.translation[1] - animation.canvas.height / 2) * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
  velocityX.value = ((animation.draggingPositionEnd[0] - animation.draggingPositionStart[0]) / animation.ratio).toExponential(3)
  velocityY.value = ((animation.draggingPositionEnd[1] - animation.draggingPositionStart[1]) / animation.ratio).toExponential(3)
  animation.dragging = false
  objectDialog.show()
})

document.getElementById('object-drag-position').addEventListener('click', () => {
  const radiusNumber = Number(radius.value)
  if (radiusNumber <= 0) {
    radius.classList.add('dialog-input-invalid')
    return
  } else {
    radius.classList.remove('dialog-input-invalid')
  }
  animation.dragging = true
  animation.draggingRadius = radiusNumber
  animation.draggingColor = color.value
  objectDialog.hide()
})

document.getElementById('object-position-center').addEventListener('click', () => {
  positionX.value = (-animation.translation[0] * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
  positionY.value = (-animation.translation[1] * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
})

objectDialog.setValues = () => {
  const object = content.editedObject
  color.value = object.color.hexString()
  objectDialog.set({
    'name': object.name || ('Object #' + object.id),
    'position-x': object.position[0].toExponential(3),
    'position-y': object.position[1].toExponential(3),
    'velocity-x': object.velocity[0].toExponential(3),
    'velocity-y': object.velocity[1].toExponential(3),
    'mass': object.mass.toExponential(3),
    'radius': object.radius.toExponential(3)
  })
}

document.getElementById('object-submit').addEventListener('click', objectDialog.submit = () => {
  if (objectDialog.validate()) {
    const object = content.editedObject
    object.name = name.value
    object.position[0] = Number(positionX.value)
    object.position[1] = Number(positionY.value)

    object.velocity[0] = Number(velocityX.value)
    object.velocity[1] = Number(velocityY.value)

    object.mass = Number(mass.value)
    object.radius = Number(radius.value)
    object.color = Color.fromHexString(color.value)

    object.clearHistory()
    objectDialog.close()
    ui.update()
    animation.shouldRender = true
  }
})
