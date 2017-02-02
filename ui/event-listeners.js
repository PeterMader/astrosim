ASTRO.ui.addEventListeners = function () {

  // events for the buttons
  document.getElementById('serialize-button').addEventListener('click', () => {
    const data = Serializer.createData()
    Serializer.serialize(data)
  })
  document.getElementById('deselect-button').addEventListener('click', () => {
    this.selectedObject = null
    this.updateSelection()
  })
  this.togglePauseButton.addEventListener('click', () => {
    if (ASTRO.mainLoop.running) {
      ASTRO.ui.pause()
    } else {
      ASTRO.ui.unpause()
    }
  })
  document.getElementById('open-new-object-dialog').addEventListener('click', () => {
    ASTRO.animation.pause()
    this.dialogs.newObjectDialog.open()
  })
  document.getElementById('object-delete').addEventListener('click', () => {
    const object = ASTRO.content.editedObject
    const index = ASTRO.content.objects.indexOf(object)
    if (index > -1) {
      ASTRO.content.objects.splice(index, 1)
      this.update()
      ASTRO.animation.shouldRender = true
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
