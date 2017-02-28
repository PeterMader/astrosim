const animation = require('../../animation/animation.js')
const Dialog = require('./dialog.js')
const Vec2 = require('../../content/vec2.js')
const Color = require('../../animation/color.js')
const Body = require('../../content/body.js')
const content = require('../../content/content.js')

const newObjectDialog = module.exports = new Dialog(document.getElementById('new-object-dialog'))

// get the input elements
const name = document.getElementById('new-object-name')
const positionX = document.getElementById('new-object-position-x')
const positionY = document.getElementById('new-object-position-y')
const velocityX = document.getElementById('new-object-velocity-x')
const velocityY = document.getElementById('new-object-velocity-y')
const mass = document.getElementById('new-object-mass')
const radius = document.getElementById('new-object-radius')
const color = document.getElementById('new-object-color')

// set the filter logic of the input elements
newObjectDialog.registerInput(name, positionX, positionY, velocityX, velocityY, mass, radius)
newObjectDialog.setFilterFunction(mass, Dialog.greaterThanZero)
newObjectDialog.setFilterFunction(radius, Dialog.greaterThanZero)

newObjectDialog.on('open', () => {
  name.focus()
})

newObjectDialog.on('drag-end', () => {
  // convert cursor position into simulation position
  positionX.value = ((animation.draggingPosition[0] - animation.translation[0] - animation.canvas.width / 2) * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
  positionY.value = ((animation.draggingPosition[1] - animation.translation[1] - animation.canvas.height / 2) * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
  animation.dragging = false
  newObjectDialog.show()
})

document.getElementById('new-object-drag-position').addEventListener('click', () => {
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
  newObjectDialog.hide()
})

document.getElementById('new-object-position-center').addEventListener('click', () => {
  positionX.value = (-animation.translation[0] * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
  positionY.value = (-animation.translation[1] * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
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
