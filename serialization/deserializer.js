const Deserializer = class {

  static deserialize (string) {
    let data
    try {
      data = JSON.parse(string)
    } catch (e) {
      console.log('Error parsing the selected file: ', e)
      return
    }

    if (Deserializer.validateData(data)) {
      ASTRO.content.objects = []
      ASTRO.content.currentId = 0
      ASTRO.content.add.apply(ASTRO.content, data.content.objects.map((item) => Body.fromSerialized(item)))
      ASTRO.content.selectedObject = Body.fromSerialized(data.content.selectedObject)
      ASTRO.animation.translation[0] = data.viewport.translationX
      ASTRO.animation.translation[1] = data.viewport.translationY
      ASTRO.animation.ratio = data.viewport.ratio
      ASTRO.ui.update()
      ASTRO.ui.pause()
      ASTRO.animation.shouldRender = true
    } else {
      console.log('Invalid file!')
    }
  }

  static validateData (data) {
    return (typeof data === 'object') &&
      (typeof data.viewport === 'object') &&
      (typeof data.viewport.translationX === 'number') && !isNaN(data.viewport.translationX) &&
      (typeof data.viewport.translationY === 'number') && !isNaN(data.viewport.translationY) &&
      (typeof data.viewport.ratio === 'number') && !isNaN(data.viewport.ratio) &&
      (typeof data.content === 'object') &&
      (typeof data.content.selectedObject === 'object') &&
      (Array.isArray(data.content.objects)) &&
      data.content.objects.filter((item) => typeof item === 'object')
  }

}
