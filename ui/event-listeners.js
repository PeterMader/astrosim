const animation = require('../animation/animation.js')
const content = require('../content/content.js')
const {mainLoop} = require('../astrosim.js')
const Serializer = require('../serialization/serializer.js')
const ui = require('../ui/ui.js')

module.exports = function () {

  // events for the buttons
  document.getElementById('serialize-button').addEventListener('click', () => {
    const data = Serializer.createData()
    Serializer.serialize(data)
  })
  document.getElementById('deselect-button').addEventListener('click', () => {
    animation.selectedObject = null
    this.updateSelection()
  })
  this.togglePauseButton.addEventListener('click', () => {
    if (mainLoop.running) {
      ui.pause()
    } else {
      ui.unpause()
    }
  })
  document.getElementById('open-new-object-dialog').addEventListener('click', () => {
    animation.pause()
    this.dialogs.newObjectDialog.open()
  })
  document.getElementById('object-delete').addEventListener('click', () => {
    const object = content.editedObject
    const index = content.objects.indexOf(object)
    if (index > -1) {
      content.objects.splice(index, 1)
      this.update()
      animation.shouldRender = true
    }
    this.dialogs.objectDialog.close()
  })
  document.getElementById('object-cancel').addEventListener('click', () => {
    this.dialogs.objectDialog.close()
  })
  document.getElementById('new-object-cancel').addEventListener('click', () => {
    this.dialogs.newObjectDialog.close()
  })
  document.getElementById('open-viewport-dialog').addEventListener('click', () => {
    const {viewportDialog} = this.dialogs
    viewportDialog.setValues()
    viewportDialog.open()
  })
  document.getElementById('open-deserialize-button').addEventListener('click', () => {
    this.dialogs.deserializeDialog.open()
  })
  document.getElementById('cancel-deserialize').addEventListener('click', () => {
    this.dialogs.deserializeDialog.close()
  })
  document.getElementById('viewport-cancel').addEventListener('click', () => {
    this.dialogs.viewportDialog.close()
  })
}
