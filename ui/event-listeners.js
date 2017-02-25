const animation = require('../animation/animation.js')
const content = require('../content/content.js')
const {mainLoop} = require('../astrosim.js')
const Serializer = require('../serialization/serializer.js')
const ui = require('../ui/ui.js')

module.exports = function () {
  const sideBar = document.getElementById('side-bar')

  // events for the buttons
  document.getElementById('serialize-button').addEventListener('click', () => {
    const data = Serializer.createData()
    Serializer.serialize(data)
  })
  this.togglePauseButton.addEventListener('click', () => {
    if (mainLoop.running) {
      ui.pause()
    } else {
      ui.unpause()
    }
  })
  document.getElementById('open-new-object-dialog').addEventListener('click', () => {
    this.dialogs.newObjectDialog.open()
  })
  document.getElementById('open-about').addEventListener('click', () => {
    this.dialogs.aboutDialog.open()
  })
  document.getElementById('open-details').addEventListener('click', () => {
    ui.updateHistory()
    this.dialogs.detailsDialog.open()
  })
  document.getElementById('object-delete').addEventListener('click', () => {
    const object = content.editedObject
    content.remove(object)
    this.update()
    animation.shouldRender = true
    this.dialogs.objectDialog.close()
  })
  document.getElementById('object-cancel').addEventListener('click', () => {
    this.dialogs.objectDialog.close()
  })
  document.getElementById('new-object-cancel').addEventListener('click', () => {
    this.dialogs.newObjectDialog.close()
  })
  document.getElementById('open-settings-dialog').addEventListener('click', () => {
    const {settingsDialog} = this.dialogs
    settingsDialog.setValues()
    settingsDialog.open()
  })
  document.getElementById('open-scene').addEventListener('click', () => {
    this.dialogs.sceneDialog.open()
  })
  document.getElementById('cancel-scene').addEventListener('click', () => {
    this.dialogs.sceneDialog.hideError()
    this.dialogs.sceneDialog.close()
  })
  document.getElementById('settings-cancel').addEventListener('click', () => {
    this.dialogs.settingsDialog.close()
  })

  document.getElementById('open-side-bar').addEventListener('click', () => {
    sideBar.classList.remove('side-bar-closed')
  })
  document.getElementById('close-side-bar').addEventListener('click', () => {
    sideBar.classList.add('side-bar-closed')
  })

  document.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
      if (ui.dialogs.openDialog) {
        ui.dialogs.openDialog.submit()
      } else {
        if (mainLoop.running) {
          ui.pause()
        } else {
          ui.unpause()
        }
      }
    }
  })
}
