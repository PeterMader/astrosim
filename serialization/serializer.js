const animation = require('../animation/animation.js')
const content = require('../content/content.js')
const ui = require('../ui/ui.js')

module.exports = class Serializer {

  // create the data to serialize
  static createData () {
    const data = {}
    data.viewport = {
      translationX: animation.translation[0],
      translationY: animation.translation[1],
      ratio: animation.ratio
    }
    data.content = {
      selectedObject: ui.selectedObject ? ui.selectedObject.serialize() : null,
      objects: content.objects.map((body) => body.serialize())
    }
    return data
  }

  static serialize (data) {
    const a = document.createElement('a')
    const file = new Blob([JSON.stringify(data, null, '  ')], {
      type: 'application/json'
    })
    a.href = URL.createObjectURL(file)
    a.download = 'astro-scene.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

}