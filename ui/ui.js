const ASTRO = require('../astrosim.js')
const {mainLoop} = ASTRO
const content = require('../content/content.js')
const Body = require('../content/body.js')
const animation = require('../animation/animation.js')

const ui = module.exports = ASTRO.ui = {

  selectedObjects: [],
  isPlaying: true,

  dialogs: require('./dialogs/dialog-manager.js'),

  initialize () {
    this.list = document.getElementById('object-list')
    this.togglePauseButton = document.getElementById('toggle-pause-button')

    require('./event-listeners.js').call(this)
    this.dialogs.initialize()
  },
  update () {
    let index
    const {list} = this

    while (list.firstChild) {
      list.removeChild(list.firstChild)
    }

    const {objects} = content
    for (index in objects) {
      const object = objects[index]

      const item = document.createElement('div')
      item.classList.add('object-list-item')

      const beforeItem = document.createElement('div')
      beforeItem.classList.add('object-list-item-before')
      beforeItem.style.backgroundColor = object.color.hexString()

      const contentElt = document.createElement('span')
      contentElt.appendChild(beforeItem)
      contentElt.appendChild(document.createTextNode(object.name || 'Object #' + object.id))

      const optionsButton = document.createElement('button')
      optionsButton.classList.add('edit-button')
      optionsButton.addEventListener('click', () => {
        // open properties dialog
        content.editedObject = object
        const {objectDialog} = this.dialogs
        objectDialog.setValues()
        objectDialog.open()
      })

      const selectButton = document.createElement('button')
      selectButton.classList.add('center-button')
      selectButton.addEventListener('click', () => {
        // add object to selection
        const {selectedObjects} = ui
        let selectionIndex
        if ((selectionIndex = selectedObjects.indexOf(object)) > -1) {
          selectedObjects.splice(selectionIndex, 1)
          item.classList.remove('selected-object')
        } else {
          selectedObjects.push(object)
          item.classList.add('selected-object')
        }

        animation.shouldRender = true
      })

      const buttonWrapper = document.createElement('div')
      buttonWrapper.appendChild(optionsButton)
      buttonWrapper.appendChild(selectButton)

      item.appendChild(contentElt)
      item.appendChild(buttonWrapper)
      list.appendChild(item)
    }

    this.updateSelection()
  },
  updateSelection () {
    const selection = ui.selectedObjects
    const selectionIndices = selection.map((object) => {
      return content.objects.indexOf(object)
    })
    const {list} = this
    Array.prototype.slice.call(list.children).forEach((item, itemIndex) => {
      if (selectionIndices.indexOf(itemIndex) > -1) {
        item.classList.add('selected-object')
      } else {
        item.classList.remove('selected-object')
      }
    })
  },

  pause () {
    animation.pause()
    this.isPlaying = false
    this.togglePauseButton.textContent = 'Play'
    this.togglePauseButton.classList.add('play-button')
    this.togglePauseButton.classList.remove('pause-button')
  },
  unpause () {
    animation.unpause()
    this.isPlaying = true
    this.togglePauseButton.textContent = 'Pause'
    this.togglePauseButton.classList.remove('play-button')
    this.togglePauseButton.classList.add('pause-button')
  }

}
