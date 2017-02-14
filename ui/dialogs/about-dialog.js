const Dialog = require('./dialog.js')

const aboutDialog = module.exports = new Dialog(document.getElementById('about-dialog'))

document.getElementById('about-submit').addEventListener('click', () => {
  aboutDialog.close()
})
