const Serializer = class {

  // create the data to serialize
  static createData () {
    const data = {}
    data.viewport = {
      translationX: ASTRO.ui.translation[0],
      translationY: ASTRO.ui.translation[1],
      ratio: ASTRO.ui.ratio
    }
    data.content = {
      selectedObject: ASTRO.ui.selectedObject ? ASTRO.ui.selectedObject.serialize() : null,
      objects: ASTRO.content.objects.map((body) => body.serialize())
    }
    return data
  }

  static serialize (data) {
    const a = document.createElement('a')
    const file = new Blob([JSON.stringify(data, null, '  ')], {
      type: 'application/json'
    })
    a.href = URL.createObjectURL(file)
    a.download = 'ASTRO-scene.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

}
