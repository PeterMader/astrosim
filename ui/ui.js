ASTRO.ui = {

  selectedObject: null,

  initialize () {
    this.list = document.getElementById('object-list')
    this.togglePauseButton = document.getElementById('toggle-pause-button')
    this.addEventListeners()
    this.dialogs.initialize()
  },
  update () {
    let index
    const {list} = this

    while (list.firstChild) {
      list.removeChild(list.firstChild)
    }

    const {objects} = ASTRO.content
    for (index in objects) {
      const object = objects[index]

      const item = document.createElement('li')
      item.style.color = object.color.hexString()
      item.classList.add('object-list-item')
      item.addEventListener('click', (e) => {
        if (e.target !== selectButton) {
          // open properties dialog
          ASTRO.ui.pause()
          ASTRO.content.editedObject = object
          const {objectDialog} = this.dialogs
          objectDialog.setValues()
          objectDialog.open()
        }
      })

      const content = document.createElement('span')
      content.textContent = 'Object #' + object.id
      content.style.color = '#000000'

      const selectButton = document.createElement('button')
      selectButton.textContent = 'Center'
      selectButton.addEventListener('click', () => {
        this.selectedObject = object
        this.updateSelection()
        if (!ASTRO.mainLoop.running) {
          this.render()
        }
      })

      item.appendChild(content)
      item.appendChild(selectButton)
      list.appendChild(item)
    }

    this.updateSelection()
  },
  updateSelection () {
    const selection = this.selectedObject
    if (selection !== null && !(selection instanceof Body)) {
      return
    }

    const index = ASTRO.content.objects.indexOf(selection)
    if (index < 0) {
      this.selectedObject = null
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
    ASTRO.animation.pause()
    this.togglePauseButton.textContent = 'Play'
  },
  unpause () {
    ASTRO.animation.unpause()
    this.togglePauseButton.textContent = 'Pause'
  }

}
