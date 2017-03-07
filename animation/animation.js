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
  textCanvas: null,
  ctx: null,
  textCtx: null,

  frames: 0, // frames counter
  framesPerSecond: 0,
  traceFrequency: 10,

  shouldRender: true,
  drawHistory: true,
  drawControls: true,
  drawLabels: false,

  dragging: false,
  draggingPositionStart: Vec2.create(),
  draggingPositionEnd: Vec2.create(),
  draggingRadius: 1,
  draggingCenter: false,
  draggingColor: '#FFFFFF',

  mouseHeld: false,

  animationLoop: new Loop(() => {
    if (animation.shouldRender) {
      // draw all the objects
      animation.render()
      animation.renderControls()
      animation.shouldRender = false
    } else if (mainLoop.running) {
      if (animation.frames % 3 === 0) {
        // draw all the objects
        animation.render()
      }
      if (animation.frames % 30 === 0) {
        animation.renderControls()
      }
      animation.frames += 1
    }
  }),

  adjust () {
    this.width = this.canvas.width = this.textCanvas.width = window.innerWidth
    this.height = this.canvas.height = this.textCanvas.height = window.innerHeight
    this.translation[0] = 0
    this.translation[1] = 0
    this.ratio = 1
    this.shouldRender = true
  },
  initialize () {
    const canvas = this.canvas = document.getElementById('canvas')
    const textCanvas = this.textCanvas = document.getElementById('text-canvas')
    this.ctx = canvas.getContext('2d', {
      alpha: false // since the alpha channel is not used, this will speed up drawing
    })
    this.textCtx = textCanvas.getContext('2d')
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
