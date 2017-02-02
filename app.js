
// the global namespace all data is accessible from
const ASTRO = {
  animation: null,
  ui: null
}

document.addEventListener('DOMContentLoaded', () => {
  ASTRO.animation.initialize()
  ASTRO.ui.initialize()

  ASTRO.mainLoop = new Loop((deltaTime) => {
    // update the positions and velocities
    ASTRO.content.update(deltaTime)
  })

  ASTRO.animationLoop = new Loop(() => {
    if (ASTRO.mainLoop.running || ASTRO.animation.shouldRender) {
      // draw all the objects
      ASTRO.animation.render()
      ASTRO.animation.shouldRender = false
    }
  })

  ASTRO.mainLoop.start()
  ASTRO.animationLoop.start()
})
