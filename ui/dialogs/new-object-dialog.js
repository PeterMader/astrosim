const animation = require('../../animation/animation.js')
const Dialog = require('./dialog.js')
const Vec2 = require('../../content/vec2.js')
const LengthInput = require('./length-input.js')
const UnsignedLengthInput = require('./unsigned-length-input.js')
const MassInput = require('./mass-input')
const VelocityInput = require('./velocity-input.js')
const Color = require('../../animation/color.js')
const Body = require('../../content/body.js')
const content = require('../../content/content.js')

const newObjectDialog = module.exports = new Dialog(document.getElementById('new-object-dialog'))

// get the input elements
const name = document.getElementById('new-object-name')
const positionX = new LengthInput(document.getElementById('new-object-position-x'), 'position-x', 0)
const positionY = new LengthInput(document.getElementById('new-object-position-y'), 'position-y', 0)
const velocityX = new VelocityInput(document.getElementById('new-object-velocity-x'), 'velocity-x', 0)
const velocityY = new VelocityInput(document.getElementById('new-object-velocity-y'), 'velocity-y', 0)
const mass = new MassInput(document.getElementById('new-object-mass'), 'mass', 0)
const radius = new UnsignedLengthInput(document.getElementById('new-object-radius'), 'radius', 0)
const color = document.getElementById('new-object-color')

// set the filter logic of the input elements
newObjectDialog.registerInput(name, positionX, positionY, velocityX, velocityY, mass, radius)

newObjectDialog.on('drag-end', () => {
  // convert cursor position into simulation position
  positionX.value = (animation.draggingPositionStart[0] - animation.translation[0] - animation.canvas.width / 2) * content.METERS_PER_PIXEL / animation.ratio
  positionY.value = (animation.draggingPositionStart[1] - animation.translation[1] - animation.canvas.height / 2) * content.METERS_PER_PIXEL / animation.ratio
  velocityX.value = (animation.draggingPositionEnd[0] - animation.draggingPositionStart[0]) / animation.ratio
  velocityY.value = (animation.draggingPositionEnd[1] - animation.draggingPositionStart[1]) / animation.ratio
  animation.dragging = false
  newObjectDialog.show()
})

document.getElementById('new-object-drag-position').addEventListener('click', () => {
  animation.dragging = true
  animation.draggingRadius = radius.value || 1
  animation.draggingColor = color.value
  newObjectDialog.hide()
})

document.getElementById('new-object-position-center').addEventListener('click', () => {
  positionX.value = -animation.translation[0] * content.METERS_PER_PIXEL / animation.ratio
  positionY.value = -animation.translation[1] * content.METERS_PER_PIXEL / animation.ratio
})

document.getElementById('new-object-submit').addEventListener('click', newObjectDialog.submit = () => {
  if (newObjectDialog.validate()) {
    const position = Vec2.create(Number(positionX.value), Number(positionY.value))
    const velocity = Vec2.create(Number(velocityX.value), Number(velocityY.value))
    const object = new Body(position, Number(mass.value), Number(radius.value), name.value.toString())
    object.velocity = velocity
    object.color = Color.fromHexString(color.value)
    content.add(object)

    newObjectDialog.close()
    animation.shouldRender = true
  }
})
