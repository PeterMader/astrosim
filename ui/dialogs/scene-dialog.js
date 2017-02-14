const Deserializer = require('../../serialization/deserializer.js')
const Dialog = require('./dialog.js')

const sceneDialog = module.exports = new Dialog(document.getElementById('scene-dialog'))

const sceneNames = ['sun-earth.json']
const scenes = [
  require('../../scenes/sun-earth.json'),
  require('../../scenes/empty.json')
]

// get the input elements
const file = document.getElementById('deserialize-file')
const info = document.getElementById('scene-info')
const sceneName = document.getElementById('scene-name')
const sceneDescription = document.getElementById('scene-description')
const reader = new FileReader()
const select = document.getElementById('deserialize-select')
const list = document.getElementById('deserialize-default')
const fileItem = document.getElementById('deserialize-file-item')

scenes.forEach((scene) => {
  const option = document.createElement('option')
  option.value = scene.meta.name
  option.textContent = scene.meta.name
  list.appendChild(option)
})

select.addEventListener('change', () => {
  if (select.selectedIndex === 0) {
    info.classList.add('hidden')
    fileItem.classList.remove('hidden')
  } else {
    fileItem.classList.add('hidden')
    info.classList.remove('hidden')
    const scene = scenes[select.selectedIndex - 1]
    sceneName.textContent = scene.meta.name || sceneNames[select.selectedIndex - 1]
    sceneDescription.textContent = scene.meta.description || sceneName.textContent
  }
})

document.getElementById('load-scene').addEventListener('click', () => {
  if (select.selectedIndex === 0) {
    reader.onload = function () {
      Deserializer.deserialize(reader.result)
      sceneDialog.close()
    }
    reader.readAsText(file.files[0])
  } else {
    Deserializer.selectScene(scenes[select.selectedIndex - 1])
    sceneDialog.close()
  }
})
