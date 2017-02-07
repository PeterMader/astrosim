const ASTRO = require('../astrosim.js')
const {mainLoop} = ASTRO
const content = require('../content/content.js')
const Body = require('../content/body.js')
const animation = require('../animation/animation.js')

const ui = module.exports = ASTRO.ui = {

  selectedObject: null,

  dialogs: require('./dialogs/init-dialogs.js'),

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

      const item = document.createElement('li')
      item.style.color = object.color.hexString()
      item.classList.add('object-list-item')
      item.addEventListener('click', (e) => {
        if (e.target !== selectButton) {
          // open properties dialog
          ui.pause()
          content.editedObject = object
          const {objectDialog} = this.dialogs
          objectDialog.setValues()
          objectDialog.open()
        }
      })

      const contentElt = document.createElement('span')
      // todo: bodies must have names!
      contentElt.textContent = object.name || 'Object #' + object.id
      contentElt.style.color = '#000000'

      const selectButton = document.createElement('button')
      selectButton.textContent = 'Center'
      selectButton.addEventListener('click', () => {
        animation.selectedObject = object
        this.updateSelection()
        animation.shouldRender = true
      })

      item.appendChild(contentElt)
      item.appendChild(selectButton)
      list.appendChild(item)
    }

    this.updateSelection()
  },
  updateSelection () {
    const selection = animation.selectedObject
    if (selection !== null && !(selection instanceof Body)) {
      return
    }

    const index = content.objects.indexOf(selection)
    if (index < 0) {
      animation.selectedObject = null
    }
    const {list} = this
    Array.prototype.slice.call(list.children).forEach((item, itemIndex) => {
      if (index === itemIndex) {
        item.classList.add('selected-object')
      } else if (item.classList.contains('selected-object')) {
        item.classList.remove('selected-object')
      }
    })
  },

  pause () {
    animation.pause()
    this.togglePauseButton.textContent = 'Play'
  },
  unpause () {
    animation.unpause()
    this.togglePauseButton.textContent = 'Pause'
  }

}
