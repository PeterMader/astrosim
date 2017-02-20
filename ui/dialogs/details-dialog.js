const Dialog = require('./dialog.js')

const detailsDialog = module.exports = new Dialog(document.getElementById('details-dialog'))

document.getElementById('details-submit').addEventListener('click', () => {
  detailsDialog.close()
})
