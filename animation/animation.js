const ASTRO = require('../astrosim.js')
const Loop = require('./loop.js')
const {mainLoop} = ASTRO
const Vec2 = require('../content/vec2.js')
let ui

const animation = module.exports = ASTRO.animation = {
  MIN_SCALING: 2e-10,
  MAX_SCALING: 2e10,

  translation: Vec2.create(0, 0),
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
  drawControls: true,
  drawLabels: false,

  dragging: false,
  draggingPosition: Vec2.create(),
  draggingRadius: 1,
  draggingColor: '#FFFFFF',

  animationLoop: new Loop(() => {
    if ((mainLoop.running && animation.frames % 3 === 0) || animation.shouldRender) {
      // draw all the objects
      animation.render()
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
    this.ctx = canvas.getContext('2d', {
      alpha: false // since the alpha channel is not used, this will speed up drawing
    })
    this.adjust()
    ui = require('../ui/ui.js')

    require('./transformation.js')
    require('./render.js')
    require('./event-listeners.js')()

    this.animationLoop.start()
  },
  pause () {
    mainLoop.pause()
  },
  unpause () {
    mainLoop.unpause()
  }
}
