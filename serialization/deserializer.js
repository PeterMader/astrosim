const animation = require('../animation/animation.js')
const Body = require('../content/body.js')
const content = require('../content/content.js')
const ui = require('../ui/ui.js')

const isColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

module.exports = class Deserializer {

  static selectScene (data, cb) {
    if (Deserializer.validateData(data)) {
      content.objects = []
      content.histories = []
      content.currentId = content.realTime = content.simulatedTime = content.ticks = content.pendingTicks = 0
      content.add.apply(content, data.content.objects.map((item) => Body.fromSerialized(item)))
      content.TIME_FACTOR = data.content.timeFactor

      animation.frames = 0
      animation.translation[0] = data.viewport.translationX
      animation.translation[1] = data.viewport.translationY
      animation.ratio = data.viewport.ratio
      animation.width = animation.canvas.width * animation.ratio
      animation.height = animation.canvas.height * animation.ratio
      ui.selectedObjects = data.content.selectedObjectIndices.map((index) => {
        return content.objects[index]
      })

      animation.shouldRender = true
      ui.pause()
      if (typeof cb === 'function') {
        cb()
      }
    } else {
      if (typeof cb === 'function') {
        cb('Error: Invalid scene.')
      }
    }
  }

  static deserialize (string, cb) {
    let data
    try {
      data = JSON.parse(string)
    } catch (e) {
      cb(`Error parsing the selected file: ${e.getMessage()}`)
      return
    }

    Deserializer.selectScene(data, cb)
  }

  static validateData (data) {
    return (typeof data === 'object') &&
      (typeof data.meta === 'object') &&
      (typeof data.meta.name === 'string') &&
      (typeof data.meta.description === 'string') &&
      (typeof data.viewport === 'object') &&
      (typeof data.viewport.translationX === 'number') && !isNaN(data.viewport.translationX) &&
      (typeof data.viewport.translationY === 'number') && !isNaN(data.viewport.translationY) &&
      (typeof data.viewport.ratio === 'number') && !isNaN(data.viewport.ratio) && data.viewport.ratio > 0 &&
      (typeof data.content === 'object') &&
      (typeof data.content.timeFactor === 'number') &&
      (Array.isArray(data.content.objects)) &&
      (Array.isArray(data.content.selectedObjectIndices)) &&
      (data.content.selectedObjectIndices.every((index) => index > -1 && index < data.content.selectedObjectIndices.length)) &&
      data.content.objects.filter((item) =>
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.positionX === 'number' &&
        typeof item.positionY === 'number' &&
        typeof item.velocityX === 'number' &&
        typeof item.velocityY === 'number' &&
        typeof item.mass === 'number' && item.mass > 0 &&
        typeof item.radius === 'number' && item.radius > 0 &&
        typeof item.color === 'string' && isColorRegex.test(item.color))
  }

}
