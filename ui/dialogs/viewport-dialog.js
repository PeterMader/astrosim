ASTRO.ui.dialogs.initViewportDialog = (function () {
  const viewportDialog = new Dialog(document.getElementById('viewport-dialog'))

  // get the input elements
  const translationX = document.getElementById('viewport-translation-x')
  const translationY = document.getElementById('viewport-translation-y')
  const scalingFactor = document.getElementById('viewport-scaling-factor')

  // set the filter logic of the input elements
  viewportDialog.registerInput(translationX, translationY, scalingFactor)

  viewportDialog.setValues = () => {
    viewportDialog.set({
      'translation-x': ASTRO.ui.translation[0].toExponential(3),
      'translation-y': ASTRO.ui.translation[1].toExponential(3),
      'scaling-factor': ASTRO.ui.ratio.toExponential(3)
    })
  }

  document.getElementById('center-viewport').addEventListener('click', () => {
    ASTRO.ui.translation[0] = 0
    ASTRO.ui.translation[1] = 0
    ASTRO.ui.selectedObject = null
    ASTRO.ui.dialogs.viewportDialog.setValues()
  })

  document.getElementById('viewport-submit').addEventListener('click', () => {
    if (viewportDialog.validate()) {
      ASTRO.ui.translation[0] = Number(translationX.value)
      ASTRO.ui.translation[1] = Number(translationY.value)
      ASTRO.ui.ratio = Number(scalingFactor.value)
      viewportDialog.close()
      ASTRO.ui.shouldRender = true
    }
  })

  return viewportDialog
})
