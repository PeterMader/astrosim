const Deserializer = require('../../serialization/deserializer.js')
const Dialog = require('./dialog.js')
const scenes = require('../../scenes/list.js')

const sceneDialog = module.exports = new Dialog(document.getElementById('scene-dialog'))

// get the input elements
const file = document.getElementById('deserialize-file')
const info = document.getElementById('scene-info')
const sceneName = document.getElementById('scene-name')
const sceneDescription = document.getElementById('scene-description')
const reader = new FileReader()
const select = document.getElementById('deserialize-select')
const list = document.getElementById('deserialize-default')
const fileItem = document.getElementById('deserialize-file-item')
const invalidScene = document.getElementById('invalid-scene')
const invalidSceneMessage = document.getElementById('invalid-scene-message')

sceneDialog.showError = (msg) => {
  invalidSceneMessage.textContent = `Could not load the selected scene: ${msg}`
  invalidScene.classList.remove('hidden')
}

sceneDialog.hideError = (msg) => {
  invalidScene.classList.add('hidden')
}

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
    sceneDialog.hideError()
  }
})

document.getElementById('load-scene').addEventListener('click', sceneDialog.submit = () => {
  if (select.selectedIndex === 0) {
    reader.onload = function () {
      Deserializer.deserialize(reader.result, (err) => {
        if (err) {
          sceneDialog.showError(err)
        } else {
          sceneDialog.close()
          sceneDialog.hideError()
        }
      })
    }
    reader.readAsText(file.files[0])
  } else {
    Deserializer.selectScene(scenes[select.selectedIndex - 1])
    sceneDialog.close()
    sceneDialog.hideError()
  }
})
