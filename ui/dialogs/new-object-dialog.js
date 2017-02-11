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

document.getElementById('new-object-submit').addEventListener('click', () => {
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
