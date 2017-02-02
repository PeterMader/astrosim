ASTRO.ui.dialogs.initNewObjectDialog = function () {
  const newObjectDialog = new Dialog(document.getElementById('new-object-dialog'))

  // get the input elements
  const positionX = document.getElementById('new-object-position-x')
  const positionY = document.getElementById('new-object-position-y')
  const velocityX = document.getElementById('new-object-velocity-x')
  const velocityY = document.getElementById('new-object-velocity-y')
  const mass = document.getElementById('new-object-mass')
  const radius = document.getElementById('new-object-radius')
  const color = document.getElementById('new-object-color')

  // set the filter logic of the input elements
  newObjectDialog.registerInput(positionX, positionY, velocityX, velocityY, mass, radius)
  newObjectDialog.setFilterFunction(mass, this.validMassInput)

  document.getElementById('new-object-submit').addEventListener('click', () => {
    if (newObjectDialog.validate()) {
      const position = Vec2.create(Number(positionX.value), Number(positionY.value))
      const velocity = Vec2.create(Number(velocityX.value), Number(velocityY.value))
      const object = new Body(position, Number(mass.value), Number(radius.value))
      object.velocity = velocity
      object.color = Color.fromHexString(color.value)
      ASTRO.content.add(object)
      newObjectDialog.close()
      ASTRO.ui.shouldRender = true
    }
  })

  return newObjectDialog
}
