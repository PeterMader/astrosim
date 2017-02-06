module.exports = {

  viewportDialog: null,
  objectDialog: null,
  newObjectDialog: null,
  deserializeDialog: null,

  initialize () {
    this.viewportDialog = require('./viewport-dialog.js')
    this.objectDialog = require('./object-dialog.js')
    this.newObjectDialog = require('./new-object-dialog.js')
    this.deserializeDialog = require('./deserialize-dialog.js')
  },
  validPositionInput (input, value) {
    return true
  },
  validMassInput (input, value) {
    let floatValue = Number(value)
    return floatValue > 0
  }
}
