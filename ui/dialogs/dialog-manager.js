module.exports = {

  aboutDialog: null,
  detailsDialog: null,
  settingsDialog: null,
  objectDialog: null,
  newObjectDialog: null,
  sceneDialog: null,

  openDialog: null,

  initialize () {
    this.aboutDialog = require('./about-dialog.js')
    this.detailsDialog = require('./details-dialog.js')
    this.settingsDialog = require('./settings-dialog.js')
    this.objectDialog = require('./object-dialog.js')
    this.newObjectDialog = require('./new-object-dialog.js')
    this.sceneDialog = require('./scene-dialog.js')
  }
}
