const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const LengthInput = require('./length-input.js')
const UnsignedLengthInput = require('./unsigned-length-input.js')
const MassInput = require('./mass-input')
const VelocityInput = require('./velocity-input.js')
const Color = require('../../animation/color.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

const objectDialog = module.exports = new Dialog(document.getElementById('object-dialog'))

// get the input elements
const name = document.getElementById('object-name')
const positionX = new LengthInput(document.getElementById('object-position-x'), 'position-x', 0)
const positionY = new LengthInput(document.getElementById('object-position-y'), 'position-y', 0)
const velocityX = new VelocityInput(document.getElementById('object-velocity-x'), 'velocity-x', 0)
const velocityY = new VelocityInput(document.getElementById('object-velocity-y'), 'velocity-y', 0)
const mass = new MassInput(document.getElementById('object-mass'), 'mass', 0)
const radius = new UnsignedLengthInput(document.getElementById('object-radius'), 'radius', 0)
const color = document.getElementById('object-color')

// set the filter logic of the input elements
objectDialog.registerInput(name, positionX, positionY, velocityX, velocityY, mass, radius)

objectDialog.on('drag-end', () => {
  // convert cursor position into simulation position
  positionX.value = (animation.draggingPositionStart[0] - animation.translation[0] - animation.canvas.width / 2) * content.METERS_PER_PIXEL / animation.ratio
  positionY.value = (animation.draggingPositionStart[1] - animation.translation[1] - animation.canvas.height / 2) * content.METERS_PER_PIXEL / animation.ratio
  velocityX.value = (animation.draggingPositionEnd[0] - animation.draggingPositionStart[0]) / animation.ratio
  velocityY.value = (animation.draggingPositionEnd[1] - animation.draggingPositionStart[1]) / animation.ratio
  animation.dragging = false
  objectDialog.show()
})

document.getElementById('object-drag-position').addEventListener('click', () => {
  animation.dragging = true
  animation.draggingRadius = radius.value || 1
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
