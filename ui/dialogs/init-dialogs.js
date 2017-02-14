module.exports = {

  aboutDialog: null,
  settingsDialog: null,
  objectDialog: null,
  newObjectDialog: null,
  sceneDialog: null,

  initialize () {
    this.aboutDialog = require('./about-dialog.js')
    this.settingsDialog = require('./settings-dialog.js')
    this.objectDialog = require('./object-dialog.js')
    this.newObjectDialog = require('./new-object-dialog.js')
    this.sceneDialog = require('./scene-dialog.js')
  }
}
