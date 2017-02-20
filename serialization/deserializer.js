const animation = require('../animation/animation.js')
const Body = require('../content/body.js')
const content = require('../content/content.js')
const ui = require('../ui/ui.js')

module.exports = class Deserializer {

  static selectScene (data) {
    if (Deserializer.validateData(data)) {
      content.objects = []
      content.histories = []
      content.currentId = 0
      content.add.apply(content, data.content.objects.map((item) => Body.fromSerialized(item)))
      content.TIME_FACTOR = data.content.timeFactor

      animation.translation[0] = data.viewport.translationX
      animation.translation[1] = data.viewport.translationY
      animation.ratio = data.viewport.ratio
      animation.width = animation.canvas.width * animation.ratio
      animation.height = animation.canvas.height * animation.ratio
      ui.selectedObjects = data.content.selectedObjectIndices.map((index) => {
        return content.objects[index]
      })

      animation.shouldRender = true
      ui.update()
      ui.pause()
    } else {
      console.log('Error: Invalid scene.')
    }
  }

  static deserialize (string) {
    let data
    try {
      data = JSON.parse(string)
    } catch (e) {
      console.log('Error parsing the selected file: ', e)
      return
    }

    Deserializer.selectScene(data)
  }

  static validateData (data) {
    return (typeof data === 'object') &&
      (typeof data.meta === 'object') &&
      (typeof data.meta.name === 'string') &&
      (typeof data.meta.description === 'string') &&
      (typeof data.viewport === 'object') &&
      (typeof data.viewport.translationX === 'number') && !isNaN(data.viewport.translationX) &&
      (typeof data.viewport.translationY === 'number') && !isNaN(data.viewport.translationY) &&
      (typeof data.viewport.ratio === 'number') && !isNaN(data.viewport.ratio) &&
      (typeof data.content === 'object') &&
      (typeof data.content.timeFactor === 'number') &&
      (Array.isArray(data.content.objects)) &&
      (Array.isArray(data.content.selectedObjectIndices)) &&
      (data.content.selectedObjectIndices.every((index) => index > -1 && index < data.content.selectedObjectIndices.length)) &&
      data.content.objects.filter((item) => typeof item === 'object')
  }

}
