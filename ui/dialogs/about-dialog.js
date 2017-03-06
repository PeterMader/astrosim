const Dialog = require('./dialog.js')

const aboutDialog = module.exports = new Dialog(document.getElementById('about-dialog'))

const closeButton = document.getElementById('about-submit')

aboutDialog.on('open', closeButton.focus.bind(closeButton))

closeButton.addEventListener('click', () => {
  aboutDialog.close()
})
