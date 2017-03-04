const ASTRO = require('../astrosim.js')
const {mainLoop} = ASTRO
let content
const Keyboard = require('./keyboard.js')
const Body = require('../content/body.js')
const animation = require('../animation/animation.js')

const ui = module.exports = ASTRO.ui = {

  selectedObjects: [],
  historyObject: null,
  isPlaying: true,

  dialogs: require('./dialogs/dialog-manager.js'),
  keyboard: new Keyboard(),

  sideBar: null,

  initialize () {
    this.list = document.getElementById('object-list')
    this.historyTable = document.getElementById('history')
    this.togglePauseButton = document.getElementById('toggle-pause-button')
    this.sideBar = document.getElementById('side-bar')

    content = require('../content/content.js')

    this.dialogs.initialize()
    require('./event-listeners.js').call(this)
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
      optionsButton.addEventListener('click', ui.openEditObject.bind(ui, object))

      const centerButton = document.createElement('button')
      centerButton.classList.add('center-button')
      centerButton.addEventListener('click', ui.addObjectToSelection.bind(ui, object))

      const buttonWrapper = document.createElement('div')
      buttonWrapper.appendChild(optionsButton)
      buttonWrapper.appendChild(centerButton)

      item.appendChild(contentElt)
      item.appendChild(buttonWrapper)
      list.appendChild(item)
    }

    this.updateSelection()
  },

  addObjectToSelection (object) {
    // add object to selection
    const {selectedObjects} = this
    let selectionIndex
    if ((selectionIndex = selectedObjects.indexOf(object)) > -1) {
      selectedObjects.splice(selectionIndex, 1)
    } else {
      selectedObjects.push(object)
    }
    this.updateSelection()

    animation.shouldRender = true
  },

  openEditObject (object) {
    // open properties dialog
    content.editedObject = object
    const {objectDialog} = this.dialogs
    objectDialog.setValues()
    objectDialog.open()
  },

  updateSelection () {
    const selection = ui.selectedObjects
    const selectionIndices = selection.map((object, index) => object.id)
    const {list} = this
    const children = Array.prototype.slice.call(list.children)
    const {length} = children
    let index
    for (index = 0; index < length; index += 1) {
      const item = children[index]
      if (selectionIndices.indexOf(index) > -1) {
        item.classList.add('selected-object')
      } else {
        item.classList.remove('selected-object')
      }
    }
  },

  updateHistory () {
    const {objects} = content
    const {historyTable} = this
    let child = historyTable.firstChild.nextElementSibling.nextElementSibling

    while (child) {
      const prev = child
      child = prev.nextSibling
      historyTable.removeChild(prev)
    }

    let index = 0, tdIndex = 0
    for (index in objects) {
      const tr = document.createElement('tr')
      const object = objects[index]

      for (tdIndex = 0; tdIndex < 7; tdIndex += 1) {
        const td = document.createElement('td')
        tr.appendChild(td)
      }

      const selectButton = document.createElement('span')
      selectButton.classList.add('details-list-item-before')
      selectButton.style.backgroundColor = object.color.hexString()
      selectButton.addEventListener('click', ui.updateHistoryValues.bind(ui, object))
      const name = document.createElement('span')
      name.textContent = object.name

      tr.children[0].appendChild(selectButton)
      tr.children[0].appendChild(name)

      historyTable.appendChild(tr)
    }

    this.updateHistoryValues()
  },

  updateHistoryValues (object) {
    const {objects} = content

    if (!object) {
      return
    }

    let index
    const {length} = objects
    for (index = 0; index < length; index += 1) {
      const tr = this.historyTable.children[index + 1]
      if (index === object.id) {
        tr.children[1].textContent = '-'
        tr.children[2].textContent = '-'
        tr.children[3].textContent = '-'
        tr.children[4].textContent = '-'
        tr.children[5].textContent = '-'
        tr.children[6].textContent = '-'
      } else {
        const history = content.histories[object.id][index]
        tr.children[1].textContent = history.force.average.toExponential(3)
        tr.children[2].textContent = history.force.min.toExponential(3)
        tr.children[3].textContent = history.force.max.toExponential(3)
        tr.children[4].textContent = history.distance.average.toExponential(3)
        tr.children[5].textContent = history.distance.min.toExponential(3)
        tr.children[6].textContent = history.distance.max.toExponential(3)
      }
    }
  },

  pause () {
    if (animation.dragging) {
      return
    }
    animation.pause()
    this.isPlaying = false
    this.togglePauseButton.textContent = 'Play'
    this.togglePauseButton.classList.add('play-button')
    this.togglePauseButton.classList.remove('pause-button')
  },
  unpause () {
    if (animation.dragging) {
      return
    }
    animation.unpause()
    this.isPlaying = true
    this.togglePauseButton.textContent = 'Pause'
    this.togglePauseButton.classList.remove('play-button')
    this.togglePauseButton.classList.add('pause-button')
  },
  openSideBar () {
    this.sideBar.classList.remove('side-bar-closed')
  },
  closeSideBar () {
    this.sideBar.classList.add('side-bar-closed')
  },
  toggleSideBar () {
    if (this.sideBar.classList.contains('side-bar-closed')) {
      this.sideBar.classList.remove('side-bar-closed')
    } else {
      this.sideBar.classList.add('side-bar-closed')
    }
  }

}
