ASTRO.ui.dialogs = {

  viewportDialog: null,
  objectDialog: null,
  newObjectDialog: null,
  deserializeDialog: null,

  initialize () {
    this.viewportDialog = this.initViewportDialog()
    this.objectDialog = this.initObjectDialog()
    this.newObjectDialog = this.initNewObjectDialog()
    this.deserializeDialog = this.initDeserializeDialog()
  },
  validPositionInput (input, value) {
    return true
  },
  validMassInput (input, value) {
    let floatValue = Number(value)
    return floatValue > 0
  }
}
