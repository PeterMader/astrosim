const Deserializer = require('../../serialization/deserializer.js')
const Dialog = require('./dialog.js')

const deserializeDialog = module.exports = new Dialog(document.getElementById('deserialize-dialog'))

// get the input elements
const file = document.getElementById('deserialize-file')
const reader = new FileReader()

document.getElementById('deserialize').addEventListener('click', () => {
  reader.onload = function () {
    Deserializer.deserialize(reader.result)
    deserializeDialog.close()
  }
  reader.readAsText(file.files[0])
})
