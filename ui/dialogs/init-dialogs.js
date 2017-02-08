module.exports = {

  settingsDialog: null,
  objectDialog: null,
  newObjectDialog: null,
  deserializeDialog: null,

  initialize () {
    this.settingsDialog = require('./settings-dialog.js')
    this.objectDialog = require('./object-dialog.js')
    this.newObjectDialog = require('./new-object-dialog.js')
    this.deserializeDialog = require('./deserialize-dialog.js')
  }
}
