const ASTRO = require('../astrosim.js')
const Loop = require('./loop.js')
const {mainLoop} = ASTRO
const Renderer = require('./renderer.js')
const Camera = require('./camera.js')
const Controls = require('../content/controls.js')
const Vec3 = require('../content/vec3.js')

const animation = module.exports = ASTRO.animation = {
  MIN_SCALING: 2e-5,
  MAX_SCALING: 2e5,

  translation: Vec3.create(0, 0, 1),
  ratio: 1,
  size: 0,
  width: 0,
  height: 0,
  canvas: null,
  ctx: null,

  frames: 0, // frames counter
  traceFrequency: 10,

  shouldRender: true,
  drawHistory: true,

  controls: {model: new Controls()},

  animationLoop: new Loop(() => {
    if ((mainLoop.running && animation.frames % 10 === 0) || animation.shouldRender) {
      // draw all the objects
      if (animation.selectedObject) {
        animation.center(animation.selectedObject.position)
      }
      animation.renderer.render(animation.camera, animation.controls)
      animation.shouldRender = false

    }
    animation.frames += 1
  }),

  adjust () {
    this.width = this.canvas.width = window.innerWidth
    this.height = this.canvas.height = window.innerHeight
    this.translation[0] = 0
    this.translation[1] = 0
    this.ratio = 1
    this.shouldRender = true
  },
  initialize () {
    const canvas = this.canvas = document.getElementById('canvas')
    const camera = this.camera = new Camera()
    const renderer = this.renderer = new Renderer(canvas)
    camera.position[2] = -2
    this.adjust()

    renderer.prepareObject(this.controls)

    require('./transformation.js')
    require('./event-listeners.js').call(this)

    this.animationLoop.start()
  },
  pause () {
    mainLoop.pause()
  },
  unpause () {
    mainLoop.unpause()
  }
}
