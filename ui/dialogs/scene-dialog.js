const Deserializer = require('../../serialization/deserializer.js')
const Dialog = require('./dialog.js')
const scenes = require('../../scenes/list.js')

const sceneDialog = module.exports = new Dialog(document.getElementById('scene-dialog'))

// get the input elements
const dropArea = document.getElementById('drop-area')
const file = document.getElementById('deserialize-file')
const sceneName = document.getElementById('scene-name')
const sceneDescription = document.getElementById('scene-description')
const reader = new FileReader()
const select = document.getElementById('deserialize-select')
const list = document.getElementById('deserialize-default')
const fileItem = document.getElementById('deserialize-file-item')
const invalidScene = document.getElementById('invalid-scene')
const invalidSceneMessage = document.getElementById('invalid-scene-message')
const isJSONRegex = /^.*\.json$/

let selectedData = null
file.value = ''

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

file.addEventListener('change', () => {
  fileItem.classList.remove('hidden')
  reader.onload = function () {
    evaluate(reader.result)
  }
  if (file.files[0]) {
    reader.readAsText(file.files[0])
  }
})

select.addEventListener('change', () => {
  if (select.selectedIndex === 0) {
    fileItem.classList.remove('hidden')
    reader.onload = function () {
      evaluate(reader.result)
    }
    if (file.files[0]) {
      reader.readAsText(file.files[0])
    }
  } else {
    fileItem.classList.add('hidden')
    const scene = scenes[select.selectedIndex - 1]
    sceneName.textContent = scene.meta.name || sceneNames[select.selectedIndex - 1]
    sceneDescription.textContent = scene.meta.description || sceneName.textContent
    sceneDialog.hideError()
    selectedData = scene
  }
})

dropArea.addEventListener('drop', function(e) {
  e.stopPropagation()
  e.preventDefault()
  const files = Array.from(e.dataTransfer.files)

  let index
  for (index in files) {
    const file = files[index]
    if (file.type === 'text/json' || isJSONRegex.test(file.name)) {
      reader.readAsText(file)
      reader.onload = () => {
        evaluate(reader.result)
      }
      return
    }
  }
})

dropArea.addEventListener('dragover', (e) => {
  e.preventDefault()
})

dropArea.addEventListener('dragend', (e) => {
  const dt = e.dataTransfer
  if (dt.items) {
    const {items} = dt
    let index
    for (index in items) {
      const item = items[index]
      items.remove(index)
    }
  } else {
    e.dataTransfer.clearData()
  }
})

const evaluate = (string) => {
  let data
  try {
    data = JSON.parse(string)
  } catch (e) {
    sceneDialog.showError(`Error parsing the selected file: ${e.message}`)
    selectedData = null
    return
  }
  if (Deserializer.validateData(data)) {
    selectedData = data
    sceneName.textContent = data.meta.name || 'User defined scene'
    sceneDescription.textContent = data.meta.description || sceneName.textContent
    sceneDialog.hideError()
  } else {
    selectedData = null
    sceneDialog.showError('Error: Invalid scene.')
  }
}

document.getElementById('load-scene').addEventListener('click', sceneDialog.submit = () => {
  if (selectedData) {
    Deserializer.selectScene(selectedData)
    sceneDialog.close()
    sceneDialog.hideError()
  }
})
