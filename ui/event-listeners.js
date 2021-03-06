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
  }, {passive: true})
  this.togglePauseButton.addEventListener('click', () => {
    if (mainLoop.running) {
      ui.pause()
    } else {
      ui.unpause()
    }
  }, {passive: true})
  document.getElementById('open-new-object-dialog').addEventListener('click', this.dialogs.newObjectDialog.open.bind(this.dialogs.newObjectDialog), {passive: true})
  document.getElementById('open-about').addEventListener('click', this.dialogs.aboutDialog.open.bind(this.dialogs.aboutDialog), {passive: true})
  document.getElementById('open-details').addEventListener('click', () => {
    ui.updateHistory()
    this.dialogs.detailsDialog.open()
  }, {passive: true})
  document.getElementById('object-delete').addEventListener('click', () => {
    const object = content.editedObject
    content.remove(object)
    this.update()
    animation.shouldRender = true
    this.dialogs.objectDialog.close()
  }, {passive: true})
  document.getElementById('object-cancel').addEventListener('click', this.dialogs.objectDialog.close.bind(this.dialogs.objectDialog))
  document.getElementById('new-object-cancel').addEventListener('click', this.dialogs.newObjectDialog.close.bind(this.dialogs.newObjectDialog))
  document.getElementById('open-settings-dialog').addEventListener('click', () => {
    const {settingsDialog} = this.dialogs
    settingsDialog.setValues()
    settingsDialog.open()
  }, {passive: true})
  document.getElementById('open-scene').addEventListener('click', this.dialogs.sceneDialog.open.bind(this.dialogs.sceneDialog))
  document.getElementById('cancel-scene').addEventListener('click', () => {
    this.dialogs.sceneDialog.hideError()
    this.dialogs.sceneDialog.close()
  }, {passive: true})
  document.getElementById('settings-cancel').addEventListener('click', this.dialogs.settingsDialog.close.bind(this.dialogs.settingsDialog), {passive: true})

  const openSideBarButton = document.getElementById('open-side-bar')
  openSideBarButton.addEventListener('click', ui.openSideBar.bind(ui))
  document.getElementById('close-side-bar').addEventListener('click', () => {
    ui.closeSideBar()
    openSideBarButton.focus()
  }, {passive: true})

  ui.keyboard.on('Enter', () => {
    if (ui.dialogs.openDialog) {
      ui.dialogs.openDialog.submit()
    } else if (document.activeElement === document.body) {
      // no element has the focus
      if (mainLoop.running) {
        ui.pause()
      } else {
        ui.unpause()
      }
    }
  })

  ui.keyboard.on('i', () => {
    if (mainLoop.running) {
      ui.pause()
    } else {
      ui.unpause()
    }
  })

  ui.keyboard.on('keyup', (e) => {
    if (ui.dialogs.openDialog) {
      return
    }
    let key = Number(e.key)
    if (key === 0 && e.key !== ' ') { // space bar get evaluated to 0
      key = 10
    }
    if (key > 0 && key < 11) {
      if (content.objects[key - 1]) {
        if (!ui.keyboard.isKeyPressed('o')) {
          ui.addObjectToSelection(content.objects[key - 1])
        } else {
          ui.openEditObject(content.objects[key - 1])
        }
      }
    }
  })

  ui.keyboard.on('a', () => {
    if (!ui.dialogs.openDialog) {
      ui.dialogs.newObjectDialog.open()
    }
  })

  ui.keyboard.on('s', () => {
    if (!ui.dialogs.openDialog) {
      ui.dialogs.sceneDialog.open()
    }
  })

  ui.keyboard.on('q', (e) => {
    if (!ui.dialogs.openDialog) {
      ui.selectedObjects = []
      ui.updateSelection()
    }
  })

  ui.keyboard.on('p', () => {
    if (!ui.dialogs.openDialog) {
      ui.dialogs.settingsDialog.open()
    }
  })

  ui.keyboard.on('x', () => {
    if (animation.dragging && ui.dialogs.openDialog) {
      animation.dragging = false
      ui.dialogs.openDialog.show()
    }
  })

  ui.keyboard.on('Escape', () => {
    if (ui.dialogs.openDialog) {
      ui.dialogs.openDialog.close()
    }
  })

  ui.keyboard.on('n', () => {
    if (document.activeElement === document.body) {
      ui.toggleSideBar()
    }
  })

  ui.keyboard.on('m', () => {
    if (!ui.dialogs.openDialog) {
      animation.translation[0] = 0
      animation.translation[1] = 0
      animation.shouldRender = true
    }
  })
}
