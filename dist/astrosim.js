(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
  draggingPositionStart: Vec2.create(),
  draggingPositionEnd: Vec2.create(),
  draggingRadius: 1,
  draggingCenter: false,
  draggingColor: '#FFFFFF',

  mouseHeld: false,

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

},{"../astrosim.js":7,"../content/vec2.js":12,"../ui/ui.js":36,"./event-listeners.js":3,"./loop.js":4,"./render.js":5,"./transformation.js":6}],2:[function(require,module,exports){
module.exports = class Color {
  constructor (r, g, b) {
    this.r = Color.getInt(r || 0)
    this.g = Color.getInt(g || 0)
    this.b = Color.getInt(b || 0)
  }

  copy () {
    return new Color(this.r, this.g, this.b)
  }

  interpolate (color) {
    if (!(color instanceof Color)) {
      return this.copy()
    }
    const newR = (this.r + color.r) / 2
    const newG = (this.g + color.g) / 2
    const newB = (this.b + color.b) / 2
    return new Color(newR, newG, newB)
  }

  hexString () {
    const r = Color.decToHex(this.r)
    const g = Color.decToHex(this.g)
    const b = Color.decToHex(this.b)
    return '#' + r + g + b
  }

  static fromHexString (str) {
    const r = Color.hexToDec(str.slice(1, 3))
    const g = Color.hexToDec(str.slice(3, 5))
    const b = Color.hexToDec(str.slice(5, 7))
    return new Color(r, g, b)
  }

  static getInt (i) {
    let n = i
    if (typeof i === 'string') {
      n = Color.hexToDec(i)
    }
    if (typeof n !== 'number') {
      return 0
    }
    if (n > 255) {
      return 255
    }
    if (n < 0) {
      return 0
    }
    return Math.round(n)
  }

  static decToHex (dec) {
    const hex = dec.toString(16)
    return hex.length < 2 ? '0' + hex : hex
  }

  static hexToDec (hex) {
    return parseInt(hex, 16)
  }
}

},{}],3:[function(require,module,exports){
const animation = require('./animation.js')
const {mainLoop} = require('../astrosim.js')
const dialogManager = require('../ui/dialogs/dialog-manager.js')
const ui = require('../ui/ui.js')

module.exports = function () {
  const {canvas} = this

  window.addEventListener('resize', () => {
    animation.adjust()
  })

  // event for the scaling
  canvas.addEventListener('wheel', (e) => {
    const factor = e.deltaY > 0 ? .5 : 2
    const clientX = (e.clientX - canvas.offsetLeft) || (canvas.width / 2)
    const clientY = (e.clientY - canvas.offsetTop) || (canvas.height / 2)

    animation.scale(factor, clientX - canvas.width / 2, clientY - canvas.height / 2)
  })

  // events for the canvas translation
  let startX = 0, startY = 0
  canvas.addEventListener('mousedown', (e) => {
    animation.mouseHeld = true

    if (animation.dragging) {
      animation.draggingPositionStart[0] = e.clientX
      animation.draggingPositionStart[1] = e.clientY
      return
    }

    startX = e.clientX
    startY = e.clientY
    document.body.position = 'fixed'
  })
  canvas.addEventListener('mousemove', (e) => {
    if (animation.dragging) {
      if (e.clientX > canvas.width * .95) {
        animation.translate(1, 0)
        animation.draggingPositionStart[0] -= 1
        animation.draggingPositionEnd[0] -= 1
      } else if (e.clientX < canvas.width * .05) {
        animation.translate(-1, 0)
        animation.draggingPositionStart[0] += 1
        animation.draggingPositionEnd[0] += 1
      } else if (e.clientY > canvas.height * .95) {
        animation.translate(0, 1)
        animation.draggingPositionStart[1] -= 1
        animation.draggingPositionEnd[1] -= 1
      } else if (e.clientY < canvas.height * .05) {
        animation.translate(0, -1)
        animation.draggingPositionStart[1] += 1
        animation.draggingPositionEnd[1] += 1
      }
      if (animation.mouseHeld) {
        animation.draggingPositionEnd[0] = e.clientX
        animation.draggingPositionEnd[1] = e.clientY
      } else {
        animation.draggingPositionStart[0] = animation.draggingPositionEnd[0] = e.clientX
        animation.draggingPositionStart[1] = animation.draggingPositionEnd[1] = e.clientY
      }
      animation.shouldRender = true
      return
    }

    if (!animation.mouseHeld) {
      return
    }

    animation.translate(startX - e.clientX, startY - e.clientY)
    document.body.position = 'absolute'
    startX = e.clientX
    startY = e.clientY
  })

  canvas.addEventListener('mouseup', (e) => {
    if (animation.dragging && dialogManager.openDialog) {
      dialogManager.openDialog.emit('drag-end')
    }
  })

  document.body.addEventListener('mouseup', () => {
    animation.mouseHeld = false
  })

  ui.keyboard.on('keyup', (e) => {
    if (!dialogManager.openDialog) {
      // canvas is visible
      const translation = e.shiftKey ? 10 : 100
      if (e.key === 'ArrowUp') {
        animation.translate(0, translation)
      } else if (e.key === 'ArrowDown') {
        animation.translate(0, -translation)
      } else if (e.key === 'ArrowLeft') {
        animation.translate(translation, 0)
      } else if (e.key === 'ArrowRight') {
        animation.translate(-translation, 0)
      } else if (e.key === '+' || e.key === '*') {
        animation.scale(e.shiftKey ? 1.05 : 2, 0, 0)
      } else if (e.key === '-' || e.key === '_') {
        animation.scale(e.shiftKey ? .95 : .5, 0, 0)
      } else if (e.key === 't') {
        animation.drawHistory = !animation.drawHistory
        animation.shouldRender = true
      } else if (e.key === 'c') {
        animation.drawControls = !animation.drawControls
        animation.shouldRender = true
      } else if (e.key === 'l') {
        animation.drawLabels = !animation.drawLabels
        animation.shouldRender = true
      }
    }
  })
}

},{"../astrosim.js":7,"../ui/dialogs/dialog-manager.js":23,"../ui/ui.js":36,"./animation.js":1}],4:[function(require,module,exports){
module.exports = class Loop {
  constructor (callback, interval) {
    this.running = false
    this.started = false
    this.stopped = false
    this.interval = typeof interval === 'number' && interval > 0 ? interval : null

    let timeOfLastFrame = Date.now()

    const loop = () => {
      const now = Date.now()
      if (this.running) {
        callback(now - timeOfLastFrame)
      }
      timeOfLastFrame = now

      if (this.interval) {
        window.setTimeout(loop, this.interval)
      } else {
        window.requestAnimationFrame(loop)
      }
    }

    window.requestAnimationFrame(loop)
  }

  start () {
    if (this.stopped) {
      return false
    }
    this.running = true
    this.started = true
    return true
  }

  pause () {
    this.running = false
    return true
  }

  unpause () {
    return !this.stopped && (this.running = true)
  }

  togglePause () {
    return this.running ? this.pause() : this.unpause()
  }

  stop () {
    this.running = false
    this.stopped = true
    return true
  }
}

},{}],5:[function(require,module,exports){
const content = require('../content/content.js')
const animation = require('./animation.js')
const Body = require('../content/body.js')
const ui = require('../ui/ui.js')
const Vec2 = require('../content/vec2.js')

animation.drawCircle = function (x, y, radius, color) {
  const {canvas, ctx} = this

  if (x - radius > canvas.width || x + radius < 0 || y - radius > canvas.height || y + radius < 0) {
    // circle is out of viewport bounds
    return
  }

  // draw the circle shape and fill it
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(x, y - radius)

  ctx.arc(x, y, radius, 0, Math.PI * 2, true)
  ctx.fill()
}

animation.renderControls = function () {
  const {translation, ratio, canvas, ctx} = this

  // draw the center point
  const x = translation[0] + canvas.width / 2
  const y = translation[1] + canvas.height / 2
  ctx.strokeStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(x, y - 10)
  ctx.lineTo(x, y + 10)
  ctx.moveTo(x - 10, y)
  ctx.lineTo(x + 10, y)
  ctx.stroke()

  // draw the unit
  ctx.fillStyle = '#FFFFFF'
  const unit = 200
  const width = (unit * content.METERS_PER_PIXEL / this.ratio).toExponential(2)
  ctx.fillRect(canvas.width - unit - 20, canvas.height - 22, unit, 2)
  ctx.textAlign = 'center'
  ctx.fillText(width + 'm', canvas.width - unit / 2 - 20, canvas.height - 40)

  // draw the time stats
  ctx.textAlign = 'right'
  ctx.fillText(`Simulated time: ${content.simulatedTime.toExponential(1)}s`, canvas.width - 20, 20)
  ctx.fillText(`Real time: ${Math.round(content.realTime).toString()}s`, canvas.width - 20, 40)
  ctx.fillText(`Ticks: ${content.ticks.toExponential(1)}`, canvas.width - 20, 60)

  if (animation.dragging) {
    ctx.textAlign = 'center'
    ctx.fillText(`Click to select a position or hit X to return.`, canvas.width / 2, 80)
  }
}

animation.render = function () {
  const {ctx, canvas} = this
  const {objects} = content

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (ui.selectedObjects.length > 0) {
    // center the canvas at the selected object's center
    this.center(Vec2.scale(Vec2.center(ui.selectedObjects.map((object) => object.position), content.temp1), 1 / content.METERS_PER_PIXEL, content.temp1))
  }

  if (objects.length > 0) {
    canvasCenter = content.temp1
    canvasCenter[0] = canvas.width / 2
    canvasCenter[1] = canvas.height / 2
    const pos = content.temp2
    const offsetX = this.translation[0] + canvasCenter[0]
    const offsetY = this.translation[1] + canvasCenter[1]
    const factor = this.ratio / content.METERS_PER_PIXEL

    let index
    // walk over each object and draw it
    for (index in objects) {
      const object = objects[index]
      Vec2.scale(object.position, factor, pos)
      pos[0] += offsetX
      pos[1] += offsetY

      // calculate the circle's radius
      const radius = object.radius * this.ratio / content.METERS_PER_PIXEL
      const color = object.color.hexString()
      this.drawCircle(pos[0], pos[1], Math.max(radius, 3), color)

      if (animation.drawLabels) {
        ctx.textAlign = 'left'
        ctx.fillText(object.name, pos[0] + radius + 3, pos[1])
      }

      if (animation.drawHistory) {
        // draw the object's trace
        ctx.beginPath()
        ctx.strokeStyle = color
        let i
        const {history} = object
        if (object.historyOverflow) {
          // start at the index
          const length = history.length
          ctx.moveTo(history[object.historyIndex] * factor + offsetX, history[object.historyIndex + 1] * factor + offsetY)
          for (i = object.historyIndex + 2; i < length; i += 2) {
            ctx.lineTo(history[i] * factor + offsetX, history[i + 1] * factor + offsetY)
          }
          for (i = 0; i < object.historyIndex; i += 2) {
            ctx.lineTo(history[i] * factor + offsetX, history[i + 1] * factor + offsetY)
          }
        } else {
          // start at start
          ctx.moveTo(history[0] * factor + offsetX, history[1] * factor + offsetY)
          for (i = 2; i < object.historyIndex; i += 2) {
            ctx.lineTo(history[i] * factor + offsetX, history[i + 1] * factor + offsetY)
          }
        }
        ctx.lineTo(pos[0], pos[1])
        ctx.stroke()
      }
    }
  }

  if (animation.dragging) {
    if (animation.draggingCenter) {
      const [x, y] = animation.draggingPositionEnd
      ctx.strokeStyle = animation.draggingColor
      ctx.beginPath()
      ctx.moveTo(x, y - 10)
      ctx.lineTo(x, y + 10)
      ctx.moveTo(x - 10, y)
      ctx.lineTo(x + 10, y)
      ctx.stroke()
    } else {
      // draw the circle as if the object was there
      const pos = animation.draggingPositionStart
      const radius = animation.draggingRadius * this.ratio / content.METERS_PER_PIXEL
      const color = animation.draggingColor
      this.drawCircle(pos[0], pos[1], Math.max(radius, 3), color)

      // draw the arrow
      if (animation.mouseHeld) {
        const endPos = animation.draggingPositionEnd
        ctx.strokeStyle = '#FFFFFF'
        ctx.beginPath()
        ctx.moveTo(pos[0], pos[1])
        ctx.lineTo(endPos[0], endPos[1])
        ctx.stroke()
      }
    }
  }

  if (animation.drawControls) {
    this.renderControls()
  }
}

},{"../content/body.js":8,"../content/content.js":9,"../content/vec2.js":12,"../ui/ui.js":36,"./animation.js":1}],6:[function(require,module,exports){
const animation = require('./animation.js')
const Vec2 = require('../content/vec2.js')

animation.center = function (pos) {
  Vec2.scale(pos, -this.ratio, this.translation)
}

animation.translate = function (x, y) {
  animation.translation[0] -= x
  animation.translation[1] -= y

  animation.shouldRender = true
}

animation.scale = function (factor, centerX, centerY) {
  const newRatio = animation.ratio * factor

  if (newRatio < animation.MIN_SCALING) {
    return
  }

  if (newRatio > animation.MAX_SCALING) {
    return
  }
  animation.ratio = newRatio

  // zoom center point
  const pX = ((centerX || 0) - animation.translation[0]) / animation.width
  const pY = ((centerY || 0) - animation.translation[1]) / animation.height

  // update dimensions
  animation.width = canvas.width * newRatio
  animation.height = canvas.height * newRatio

  // translate view back to center point
  const x = animation.width * pX - centerX
  const y = animation.height * pY - centerY

  animation.translation[0] = -x
  animation.translation[1] = -y

  animation.shouldRender = true
}

},{"../content/vec2.js":12,"./animation.js":1}],7:[function(require,module,exports){
const Loop = require('./animation/loop.js')

const ASTRO = module.exports = {
  mainLoop: new Loop((deltaTime) => {
    // update the positions and velocities
    ASTRO.content.update(deltaTime)
  })
}

document.addEventListener('DOMContentLoaded', () => {
  ASTRO.animation = require('./animation/animation.js')
  ASTRO.content = require('./content/content.js')
  ASTRO.ui = require('./ui/ui.js')

  ASTRO.animation.initialize()
  ASTRO.content.initialize()
  ASTRO.ui.initialize()

  ASTRO.mainLoop.start()
})

},{"./animation/animation.js":1,"./animation/loop.js":4,"./content/content.js":9,"./ui/ui.js":36}],8:[function(require,module,exports){
const Color = require('../animation/color.js')
const content = require('./content.js')
const Vec2 = require('./vec2.js')

module.exports = class Body {
  constructor (position, mass, radius, name) {
    this.position = position
    this.velocity = Vec2.create()
    this.mass = mass || 0
    this.radius = radius
    this.color = new Color()
    this.name = name

    // remember the last 100 positions
    this.history = new Float32Array(200)
    this.historyIndex = 0
    this.historyOverflow = false

    this.history[0] = position[0]
    this.history[1] = position[1]
  }

  applyForce (force) {
    const factor = 1 / this.mass
    this.velocity[0] += force[0] * factor
    this.velocity[1] += force[1] * factor
  }

  serialize () {
    return {
      positionX: this.position[0],
      positionY: this.position[1],
      velocityX: this.velocity[0],
      velocityY: this.velocity[1],
      mass: this.mass,
      radius: this.radius,
      color: this.color.hexString(),
      name: this.name
    }
  }

  move (deltaTime) {
    // move object by adding its velocity to its position
    this.position[0] += this.velocity[0] * deltaTime
    this.position[1] += this.velocity[1] * deltaTime
  }

  savePosition () {
    this.history[this.historyIndex] = this.position[0]
    this.history[this.historyIndex + 1] = this.position[1]
    this.historyIndex += 2
    if (this.historyIndex >= this.history.length) {
      this.historyIndex = 0
      this.historyOverflow = true
    }
  }

  clearHistory () {
    this.historyIndex = 0
    this.historyOverflow = false
  }

  update (deltaTime) {
    // interact with all other objects
    const {objects} = content
    let index
    for (index in objects) {
      const body = objects[index]
      if (body === this || body.id === this.id) {
        continue
      }
      this.interact(body, objects, index, deltaTime)
    }
  }

  interact (body, objects, bodyIndex, deltaTime) {
    // calculate the distance between the two objects
    let distance = Vec2.subtract(this.position, body.position, content.temp1)
    const length = Vec2.getLength(distance) || 1e-10
    if (isNaN(distance[0]) || isNaN(distance[1])) {
      distance[0] = distance[1] = 0
    }

    // check for collision
    if (length < this.radius) {
      const newPosition = Vec2.weighedCenter(this.position, this.mass, body.position, body.mass, distance)
      const newRadius = Math.pow(4 / 3 * Math.PI * Math.pow(this.radius, 3) + 4 / 3 * Math.PI * Math.pow(body.radius, 3), 1 / 3)
      const newBody = new Body(Vec2.copy(newPosition), this.mass + body.mass, newRadius)

      // remove the two colliding objects
      content.remove(body)
      content.remove(this)

      // calculate the velocity and the color of the new object
      const thisMomentum = Vec2.scale(this.velocity, this.mass, content.temp2)
      const bodyMomentum = Vec2.scale(body.velocity, body.mass, content.temp3)
      Vec2.add(thisMomentum, bodyMomentum, newBody.velocity)
      Vec2.scale(newBody.velocity, 1 / newBody.mass, newBody.velocity)
      newBody.color = this.color.interpolate(body.color)

      // finally add the new object and show it in the UI
      content.add(newBody)
    } else {
      // calculate the gravity
      const force = content.temp2
      Vec2.scale(
        Vec2.normalize(distance, content.temp3),
        -deltaTime * content.GRAVITY_CONSTANT * (this.mass * body.mass) / (length * length),
        force
      )

      // move the body
      this.applyForce(force)

      content.save(this.id, body.id, Vec2.getLength(force), Vec2.getLength(distance))
    }
  }

  static fromSerialized (data) {
    if (!data) {
      return null
    }
    const newBody = new Body(
      Vec2.create(
        typeof data.positionX === 'number' ? data.positionX : 0,
        typeof data.positionY === 'number' ? data.positionY : 0
      ),
      typeof data.mass === 'number' ? data.mass : 1000,
      typeof data.radius === 'number' ? data.radius : 1000,
      typeof data.name === 'string' ? data.name : 'Object'
    )
    newBody.color = Color.fromHexString(data.color)
    newBody.velocity[0] = typeof data.velocityX === 'number' ? data.velocityX : 0
    newBody.velocity[1] = typeof data.velocityY === 'number' ? data.velocityY : 0
    return newBody
  }
}

},{"../animation/color.js":2,"./content.js":9,"./vec2.js":12}],9:[function(require,module,exports){
const animation = require('../animation/animation.js')
const ASTRO = require('../astrosim.js')
const History = require('./history.js')
const Vec2 = require('./vec2.js')

const content = module.exports = ASTRO.content = {

  editedObject: null, // the last object the user edited
  objects: [], // all the objects that exist
  currentId: 0, // an incremental id count
  METERS_PER_PIXEL: 3e8,
  GRAVITY_CONSTANT: 6.67408e-11,

  toBeDeleted: [], // holds indices of all the objects that will be deleted after the current tick

  ticks: 0,  // how many computations were performed
  realTime: 0,  // how much time passed in the real world since the simulation was started with the current scene
  simulatedTime: 0, // how much time passed in the simulation since the simulation was started with the current scene
  pendingTicks: 0, // how many computations have to be performed in th next frame
  TICKS_PER_FRAME: 10, // how many computations should be performed in one frame

  SECONDS_IN_YEAR: 31556927, // a year has 31,556,927
  TIME_FACTOR: 1, // the factor the time passed is multiplied by

  // temporary vectors, so that no new memory must be allocated
  temp1: Vec2.create(),
  temp2: Vec2.create(),
  temp3: Vec2.create(),

  histories: [], // 2 dimensional array containing all histories between the planets

  initialize () {
    this.TIME_FACTOR = this.SECONDS_IN_YEAR / 12 // initial factor: 1s in simulation equals 1 month
  },

  // saves all the objects passed to it and displays them
  add () {
    const {objects} = this
    let index
    for (index in arguments) {
      const object = arguments[index]
      object.id = objects.push(object) - 1

      this.addHistory(object.id)
    }
    ASTRO.ui.update()
  },

  addHistory (id) {
    const {histories} = this
    const {length} = histories
    histories[id] = []
    let index
    for (index = 0; index < length; index += 1) {
      if (index !== id) {
        const force = new History()
        const distance = new History()
        const history = {force, distance}
        histories[index][id] = history
        histories[id][index] = history
      }
    }
  },

  // save the data of two objects
  save (idA, idB, force, distance) {
    if (this.histories[idA] && this.histories[idA][idB]) {
      this.histories[idA][idB].force.add(force)
      this.histories[idA][idB].distance.add(distance)
    }
  },

  // removes an object from the object list
  remove (object) {
    this.objects.splice(object.id, 1)
    this.toBeDeleted.push(object.id)
  },

  commitRemove () {
    const {histories, toBeDeleted} = this
    let deletionIndex
    for (deletionIndex in toBeDeleted) {
      const objectIndex = toBeDeleted[deletionIndex]

      let index
      for (index in histories) {
        if (index !== objectIndex) {
          histories[index].splice(objectIndex, 1)
        }
      }
      histories.splice(objectIndex, 1)
    }
    this.toBeDeleted = []
  },

  // calls the 'update' method of all the objects
  update (realDeltaTime) {
    const {objects} = this

    // calculate how many computations are necessary
    if (this.pendingTicks > 100) {
      this.TICKS_PER_FRAME -= 1
    }
    this.pendingTicks += this.TICKS_PER_FRAME

    // calculate how much time passed since the last frame
    const deltaTime = realDeltaTime < 1000 ? realDeltaTime : 1000
    const deltaSecs = deltaTime / 1000 * this.TIME_FACTOR / this.TICKS_PER_FRAME
    this.realTime += deltaTime / 1000
    this.simulatedTime += deltaSecs

    // perform the necessary amount of computations
    let index
    while (this.pendingTicks > 0) {
      this.ticks += 1
      for (index in objects) {
        objects[index].update(deltaSecs)
      }
      for (index in objects) {
        objects[index].move(deltaSecs)
        if (this.ticks % animation.traceFrequency === 0) {
          objects[index].savePosition()
        }
      }
      if (this.toBeDeleted.length > 0) {
        this.commitRemove()
      }
      this.pendingTicks -= 1
    }
  },

  // calculates the momentum of all objects
  momentum () {
    return this.objects.reduce((acc, obj) => {
      return Vec2.add(acc, Vec2.scale(obj.velocity, obj.mass))
    }, Vec2.create())
  },

  // calculates the velocity of the system
  velocity () {
    return Vec2.scale(this.momentum(), 1 / this.objects.reduce((acc, obj) => acc + obj.mass, 0))
  }
}

},{"../animation/animation.js":1,"../astrosim.js":7,"./history.js":11,"./vec2.js":12}],10:[function(require,module,exports){
module.exports = class EventEmitter {

  constructor () {
    this._events = []
  }

  on (channel, callback) {
    const events = this._events
    if (Array.isArray(events[channel])) {
      events[channel].push(callback)
    } else {
      events[channel] = [callback]
    }
    return this
  }

  once (channel, callback) {
    const events = this._events
    const func = function () {
      callback.apply(self, Array.prototype.slice.call(arguments))
      events[channel].splice([events[channel].indexOf(func)], 1)
    }
    if (Array.isArray(events[channel])) {
      events[channel].push(func)
    } else {
      events[channel] = [func]
    }
    return this
  }

  emit (channel) {
    const events = this._events
    const args = Array.prototype.slice.call(arguments, 1)
    if (Array.isArray(events[channel])) {
      events[channel].forEach((cb) => {
        cb.apply(self, args)
      })
    }
  }

}

},{}],11:[function(require,module,exports){
const History = module.exports = class {

  constructor () {
    this.average = 0
    this.min = 0
    this.max = 0
    this.count = 0
  }

  add (value) {
    if (value < this.min || this.count === 0) {
      this.min = value
    }
    if (value > this.max || this.count === 0) {
      this.max = value
    }
    this.average = (this.average * this.count + value) / (this.count += 1)
  }

}

},{}],12:[function(require,module,exports){
module.exports = class Vec2 {

  static create (x, y) {
    const newVector = new Float32Array(2)
    newVector[0] = x || 0
    newVector[1] = y || 0

    return newVector
  }

  static copy (a, result) {
    let out = result
    if (!out) {
      out = Vec2.create(a[0], a[1])
    } else {
      out[0] = a[0]
      out[1] = a[1]
    }
    return out
  }

  static weighedCenter (a, w1, b, w2, result) {
    let out = result
    if (!out) {
      out = Vec2.create()
    }
    const factor = w2 / (w1 + w2)
    out[0] = factor * ((b[0] - a[0]) || 1e-10) + a[0]
    out[1] = factor * ((b[1] - a[1]) || 1e-10) + a[1]
    return out
  }

  static center (list, result) {
    let out = result
    if (!out) {
      out = Vec2.create()
    }
    let index, x = 0, y = 0, count = 0
    for (index in list) {
      x = (x * count + list[index][0]) / (count + 1)
      y = (y * count + list[index][1]) / (count + 1)
      count += 1
    }
    out[0] = x
    out[1] = y
    return out
  }

  static add (a, b, result) {
    let out = result
    if (!out) {
      out = Vec2.create()
    }
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    return out
  }

  static subtract (a, b, result) {
    let out = result
    if (!out) {
      out = Vec2.create()
    }
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    return out
  }

  static getLength (a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1])
  }

  static getAngle (a) {
    if (a[0] === 0) {
      return a[1] > 0 ? Math.PI / 2 : -Math.PI / 2
    }
    return Math.atan(a[1] / a[0])
  }

  static rotate (a, angle, result) {
    let out = result
    if (!out) {
      out = Vec2.create()
    }
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    out[0] = a[0] * cos - a[1] * sin
    out[1] = a[0] * sin + a[1] * cos
    return out
  }

  static normalize (a, result) {
    let out = result
    if (!out) {
      out = Vec2.create()
    }
    let length = Vec2.getLength(a)
    out[0] = a[0] / length
    out[1] = a[1] / length
    return out
  }

  static scale (a, scalar, result) {
    let out = result
    if (!out) {
      out = Vec2.create()
    }
    out[0] = a[0] * scalar
    out[1] = a[1] * scalar
    return out
  }

}

},{}],13:[function(require,module,exports){
module.exports={
  "meta": {
    "name": "Earth and Moon",
    "description": "Shows the moon orbiting the earth."
  },
  "viewport": {
    "translationX": 0,
    "translationY": 0,
    "ratio": 2.5e2,
  },
  "content": {
    "selectedObjectIndices": [],
    "timeFactor": 1e5,
    "objects": [
      {
        "name": "Earth",
        "positionX": 0,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": -1.258e1,
        "mass": 5.974e24,
        "radius": 6.3674675e6,
        "color": "#0000ff"
      },
      {
        "name": "Moon",
        "positionX": 3.844e8,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 1.023e3,
        "mass": 7.349e22,
        "radius": 1.738e6,
        "color": "#888888"
      }
    ]
  }
}

},{}],14:[function(require,module,exports){
module.exports={
  "meta": {
    "name": "Empty Scene",
    "description": "Empty Scene."
  },
  "viewport": {
    "translationX": 0,
    "translationY": 0,
    "ratio": 1
  },
  "content": {
    "selectedObjectIndices": [],
    "timeFactor": 1e6,
    "objects": []
  }
}

},{}],15:[function(require,module,exports){
module.exports=[ 
require('./earth-moon.json'), 
require('./empty.json'), 
require('./solar-system.json'), 
require('./sun-earth.json'), 
require('./trappist-1.json'), 
] 

},{"./earth-moon.json":13,"./empty.json":14,"./solar-system.json":16,"./sun-earth.json":17,"./trappist-1.json":18}],16:[function(require,module,exports){
module.exports={
  "meta": {
    "name": "Solar System",
    "description": "A scene containing the sun and our planets (including Pluto)."
  },
  "viewport": {
    "translationX": 0,
    "translationY": 0,
    "ratio": 1
  },
  "content": {
    "selectedObjectIndices": [],
    "timeFactor": 1e6,
    "objects": [
      {
        "name": "Sun",
        "positionX": 0,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 0,
        "mass": 1.9884e30,
        "radius": 1.4e9,
        "color": "#ffff00"
      },
      {
        "name": "Mercury",
        "positionX": 5.7909e10,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 4.736e4,
        "mass": 3.301e23,
        "radius": 2.440e6,
        "color": "#bb8800"
      },
      {
        "name": "Venus",
        "positionX": 0,
        "positionY": 1.0816e11,
        "velocityX": -3.502e4,
        "velocityY": 0,
        "mass": 4.869e24,
        "radius": 6.0518e6,
        "color": "#dddd44"
      },
      {
        "name": "Earth",
        "positionX": -1.496e11,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": -2.978e4,
        "mass": 5.974e24,
        "radius": 6.3674675e6,
        "color": "#0000ff"
      },
      {
        "name": "Moon",
        "positionX": -1.492156e11,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": -3.0803e4,
        "mass": 7.349e22,
        "radius": 1.738e6,
        "color": "#888888"
      },
      {
        "name": "Mars",
        "positionX": 0,
        "positionY": -2.2799e11,
        "velocityX": 2.413e4,
        "velocityY": 0,
        "mass": 6.419e23,
        "radius": 3.3862e6,
        "color": "#ff0000"
      },
      {
        "name": "Jupiter",
        "positionX": 7.7836e11,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 1.307e4,
        "mass": 1.899e27,
        "radius": 6.9173e7,
        "color": "#bbaa88"
      },
      {
        "name": "Saturn",
        "positionX": 0,
        "positionY": 1.4335e12,
        "velocityX": -9.69e3,
        "velocityY": 0,
        "mass": 5.685e26,
        "radius": 5.7316e7,
        "color": "#ffaa00"
      },
      {
        "name": "Uranus",
        "positionX": -2.8724e12,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": -6.81e3,
        "mass": 8.683e25,
        "radius": 2.5266e7,
        "color": "#dddfff"
      },
      {
        "name": "Neptune",
        "positionX": 0,
        "positionY": -4.4984e12,
        "velocityX": 5.43e3,
        "velocityY": 0,
        "mass": 1.0243e26,
        "radius": 2.45525e7,
        "color": "#00045b"
      },
      {
        "name": "Pluto",
        "positionX": 5.9064e12,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 4.67e3,
        "mass": 1.303e22,
        "radius": 2.374e3,
        "color": "#777733"
      }
    ]
  }
}

},{}],17:[function(require,module,exports){
module.exports={
  "meta": {
    "name": "Sun and Earth",
    "description": ""
  },
  "viewport": {
    "translationX": 0,
    "translationY": 0,
    "ratio": 1
  },
  "content": {
    "selectedObjectIndices": [],
    "timeFactor": 1e6,
    "objects": [
      {
        "name": "Sun",
        "positionX": 0,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 0,
        "mass": 1.9884e+30,
        "radius": 1400000000,
        "color": "#ffff00"
      },
      {
        "name": "Earth",
        "positionX": 148999995392,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 29780,
        "mass": 5.974e+24,
        "radius": 6000000,
        "color": "#0000ff"
      }
    ]
  }
}

},{}],18:[function(require,module,exports){
module.exports={
  "meta": {
    "name": "TRAPPIST-1",
    "description": "The 2MASS J23062928-0502285 system (also known as TRAPPIST-1A). Note that Trappist-1h's mass is unknown."
  },
  "viewport": {
    "translationX": 0,
    "translationY": 0,
    "ratio": 1
  },
  "content": {
    "selectedObjectIndices": [],
    "timeFactor": 1e4,
    "objects": [
      {
        "name": "Trappist-1",
        "positionX": 0,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 0,
        "mass": 1.6309144e+29,
        "radius": 81472014,
        "color": "#ffb257"
      },
      {
        "name": "Trappist-1b",
        "positionX": 1.65539e9,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 7.999897961860064e4,
        "mass": 5.07637e+24,
        "radius": 6.918906e6,
        "color": "#f9882a"
      },
      {
        "name": "Trappist-1c",
        "positionX": 0,
        "positionY": 2.26778e9,
        "velocityX": -6.837068304792153e4,
        "velocityY": 0,
        "mass": 8.241636e+24,
        "radius": 6.727776e6,
        "color": "#d38c43"
      },
      {
        "name": "Trappist-1d",
        "positionX": -3.129e9,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": -5.641619787734072e4,
        "mass": 2.448602e+24,
        "radius": 4.918412e6,
        "color": "#ab8359"
      },
      {
        "name": "Trappist-1e",
        "positionX": 0,
        "positionY": -4.172e9,
        "velocityX": 4.994055069291154e4,
        "velocityY": 0,
        "mass": 3.702764e+24,
        "radius": 5.848578e6,
        "color": "#aa8677"
      },
      {
        "name": "Trappist-1f",
        "positionX": 5.513e9,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": 4.3721587579426e4,
        "mass": 4.061096e+24,
        "radius": 6.657695e6,
        "color": "#846a63"
      },
      {
        "name": "Trappist-1g",
        "positionX": 0,
        "positionY": 6.705e9,
        "velocityX": -3.963144443220881e4,
        "velocityY": 0,
        "mass": 8.002748e+24,
        "radius": 7.180117e6,
        "color": "#a39d6a"
      },
      {
        "name": "Trappist-1h",
        "positionX": -9.387e9,
        "positionY": 0,
        "velocityX": 0,
        "velocityY": -3.4269539862908656e4,
        "mass": 1,
        "radius": 4.810105e6,
        "color": "#ddae83"
      }
    ]
  }
}

},{}],19:[function(require,module,exports){
const animation = require('../animation/animation.js')
const Body = require('../content/body.js')
const content = require('../content/content.js')
const ui = require('../ui/ui.js')

const isColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/

module.exports = class Deserializer {

  static selectScene (data, cb) {
    if (Deserializer.validateData(data)) {
      content.objects = []
      content.histories = []
      content.currentId = content.realTime = content.simulatedTime = content.ticks = content.pendingTicks = 0
      content.add.apply(content, data.content.objects.map((item) => Body.fromSerialized(item)))
      content.TIME_FACTOR = data.content.timeFactor

      animation.translation[0] = data.viewport.translationX
      animation.translation[1] = data.viewport.translationY
      animation.ratio = data.viewport.ratio
      animation.width = animation.canvas.width * animation.ratio
      animation.height = animation.canvas.height * animation.ratio
      ui.selectedObjects = data.content.selectedObjectIndices.map((index) => {
        return content.objects[index]
      })

      animation.shouldRender = true
      ui.pause()
      if (typeof cb === 'function') {
        cb()
      }
    } else {
      if (typeof cb === 'function') {
        cb('Error: Invalid scene.')
      }
    }
  }

  static deserialize (string, cb) {
    let data
    try {
      data = JSON.parse(string)
    } catch (e) {
      cb(`Error parsing the selected file: ${e.getMessage()}`)
      return
    }

    Deserializer.selectScene(data, cb)
  }

  static validateData (data) {
    return (typeof data === 'object') &&
      (typeof data.meta === 'object') &&
      (typeof data.meta.name === 'string') &&
      (typeof data.meta.description === 'string') &&
      (typeof data.viewport === 'object') &&
      (typeof data.viewport.translationX === 'number') && !isNaN(data.viewport.translationX) &&
      (typeof data.viewport.translationY === 'number') && !isNaN(data.viewport.translationY) &&
      (typeof data.viewport.ratio === 'number') && !isNaN(data.viewport.ratio) && data.viewport.ratio > 0 &&
      (typeof data.content === 'object') &&
      (typeof data.content.timeFactor === 'number') &&
      (Array.isArray(data.content.objects)) &&
      (Array.isArray(data.content.selectedObjectIndices)) &&
      (data.content.selectedObjectIndices.every((index) => index > -1 && index < data.content.selectedObjectIndices.length)) &&
      data.content.objects.filter((item) =>
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.positionX === 'number' &&
        typeof item.positionY === 'number' &&
        typeof item.velocityX === 'number' &&
        typeof item.velocityY === 'number' &&
        typeof item.mass === 'number' && item.mass > 0 &&
        typeof item.radius === 'number' && item.radius > 0 &&
        typeof item.color === 'string' && isColorRegex.test(item.color))
  }

}

},{"../animation/animation.js":1,"../content/body.js":8,"../content/content.js":9,"../ui/ui.js":36}],20:[function(require,module,exports){
const animation = require('../animation/animation.js')
const content = require('../content/content.js')
const ui = require('../ui/ui.js')

module.exports = class Serializer {

  // create the data to serialize
  static createData () {
    const data = {}
    data.meta = {
      name: "AstroSim scene",
      description: "Your own AstroSim scene."
    }
    data.viewport = {
      translationX: animation.translation[0],
      translationY: animation.translation[1],
      ratio: animation.ratio
    }
    data.content = {
      selectedObjectIndices: ui.selectedObjects.map((body) => content.objects.indexOf(body)).sort(),
      objects: content.objects.map((body) => body.serialize()),
      timeFactor: content.TIME_FACTOR
    }
    return data
  }

  static serialize (data) {
    const a = document.createElement('a')

    // create a blob object representing the scene as JSON
    const file = new Blob([JSON.stringify(data, null, '  ')], {
      type: 'application/json'
    })
    a.href = URL.createObjectURL(file)
    a.download = 'astro-scene.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

}

},{"../animation/animation.js":1,"../content/content.js":9,"../ui/ui.js":36}],21:[function(require,module,exports){
const Dialog = require('./dialog.js')

const aboutDialog = module.exports = new Dialog(document.getElementById('about-dialog'))

document.getElementById('about-submit').addEventListener('click', () => {
  aboutDialog.close()
})

},{"./dialog.js":24}],22:[function(require,module,exports){
const Dialog = require('./dialog.js')

const detailsDialog = module.exports = new Dialog(document.getElementById('details-dialog'))

document.getElementById('details-submit').addEventListener('click', () => {
  detailsDialog.close()
})

},{"./dialog.js":24}],23:[function(require,module,exports){
module.exports = {

  aboutDialog: null,
  detailsDialog: null,
  settingsDialog: null,
  objectDialog: null,
  newObjectDialog: null,
  sceneDialog: null,

  openDialog: null,

  initialize () {
    this.aboutDialog = require('./about-dialog.js')
    this.detailsDialog = require('./details-dialog.js')
    this.settingsDialog = require('./settings-dialog.js')
    this.objectDialog = require('./object-dialog.js')
    this.newObjectDialog = require('./new-object-dialog.js')
    this.sceneDialog = require('./scene-dialog.js')
  }
}

},{"./about-dialog.js":21,"./details-dialog.js":22,"./new-object-dialog.js":28,"./object-dialog.js":29,"./scene-dialog.js":30,"./settings-dialog.js":31}],24:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const dialogManager = require('./dialog-manager.js')
const EventEmitter = require('../../content/event-emitter.js')
const ui = require('../../ui/ui.js')

module.exports = class Dialog extends EventEmitter {
  constructor (element) {
    super()
    this.element = element
    element.classList.add('dialog-closed')
    element.classList.add('dialog')
    this.opened = false

    this.inputs = {}
    this.invalidInputs = {}
    this.valid = true
  }
  registerInput () {
    let index
    for (index in arguments) {
      const input = arguments[index]
      this.inputs[input.name] = input
    }
  }
  set (values) {
    let index
    const {inputs} = this
    for (index in inputs) {
      const input = inputs[index]
      if (values[index]) {
        input.value = values[index]
      }
    }
  }
  validate () {
    let valid = true
    const invalid = this.invalidInputs = []
    let inputValid = true

    let index
    const {inputs} = this
    for (index in inputs) {
      const input = inputs[index]

      if (typeof input.checkValidity === 'function') {
        inputValid = input.checkValidity()
      } else {
        const filter = input.filterFunction || this.defaultFilterFunction
        inputValid = !!filter(input, input.value, index)
        if (!inputValid) {
          invalid.push(input)
          input.classList.add('dialog-input-invalid')
        } else {
          input.classList.remove('dialog-input-invalid')
        }
      }
      valid = valid && inputValid
    }

    return valid
  }
  getInputByName (name) {
    return this.inputs[name] || null
  }
  setFilterFunction (input, filter) {
    input.filterFunction = filter
  }
  defaultFilterFunction () {
    return true
  }
  open () {
    if (dialogManager.openDialog) {
      return
    }

    this.element.classList.add('dialog-open')
    this.element.classList.remove('dialog-closed')
    this.opened = true
    dialogManager.openDialog = this

    animation.pause()
    this.emit('open')
  }
  show () {
    this.element.classList.add('dialog-open')
    this.element.classList.remove('dialog-closed')
  }
  hide () {
    this.element.classList.remove('dialog-open')
    this.element.classList.add('dialog-closed')
  }
  close () {
    this.element.classList.remove('dialog-open')
    this.element.classList.add('dialog-closed')
    this.opened = false

    dialogManager.openDialog = null

    this.emit('close')

    if (ui.isPlaying) {
      animation.unpause()
    }
  }
  submit () {
    if (this.validate()) {
      this.emit('submit')
      this.close()
    }
  }
  static greaterThanZero (input, value) {
    let floatValue = Number(value)
    return floatValue > 0
  }
}

},{"../../animation/animation.js":1,"../../content/event-emitter.js":10,"../../ui/ui.js":36,"./dialog-manager.js":23}],25:[function(require,module,exports){
const MultiUnitInput = require('./multi-unit-input.js')

module.exports = class LengthInput extends MultiUnitInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue, 'm', 1)
    this.addUnit('AU',  1.495978707e11)
    this.addUnit('ly',  9.4607e15)
    this.addUnit('pc', 3.0857e16)
  }

}

},{"./multi-unit-input.js":27}],26:[function(require,module,exports){
const MultiUnitInput = require('./multi-unit-input.js')

module.exports = class MassInput extends MultiUnitInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue, 'kg', 1)
    this.addUnit('solar mass', 1.98855e30)
    this.buttons['solar mass'].innerHTML = 'M<span class="sub">\u2609</span>'
  }

  checkValidity () {
    const valid = this.value > 0
    if (valid) {
      this._inputElement.classList.remove('dialog-input-invalid')
    } else {
      this._inputElement.classList.add('dialog-input-invalid')
    }
    return valid
  }

}

},{"./multi-unit-input.js":27}],27:[function(require,module,exports){
module.exports = class MultiUnitInput {

  constructor (wrapperElement, name, initialValue, initialUnit, initialRatio) {
    this.units = {}
    this.buttons = {}
    this._unit = initialUnit

    this.wrapperElement = wrapperElement
    const input = this._inputElement = document.createElement('input')
    this.name = input.name = name
    wrapperElement.appendChild(input)

    this.addUnit(initialUnit, initialRatio)
    this.value = initialValue
    this.setUnit(initialUnit)
  }

  get value () {
    return Number(this._inputElement.value) * this.units[this._unit]
  }

  set value (newVal) {
    this._inputElement.value = (newVal / this.units[this._unit]).toExponential(3)
  }

  addUnit (name, ratio) {
    this.units[name] = ratio

    const pushButton = document.createElement('button')
    pushButton.textContent = name
    pushButton.classList.add('unit-push-button')
    pushButton.addEventListener('click', this.setUnit.bind(this, name))
    this.buttons[name] = pushButton
    this.wrapperElement.appendChild(pushButton)
  }

  checkValidity () {
    return true
  }

  setUnit (name) {
    const ratio = this.units[name]

    const value = this.value
    this.buttons[this._unit].classList.remove('pushed')
    this._unit = name
    this.buttons[name].classList.add('pushed')
    this.value = value
  }

}

},{}],28:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const Dialog = require('./dialog.js')
const Vec2 = require('../../content/vec2.js')
const LengthInput = require('./length-input.js')
const UnsignedLengthInput = require('./unsigned-length-input.js')
const MassInput = require('./mass-input')
const VelocityInput = require('./velocity-input.js')
const Color = require('../../animation/color.js')
const Body = require('../../content/body.js')
const content = require('../../content/content.js')

const newObjectDialog = module.exports = new Dialog(document.getElementById('new-object-dialog'))

// get the input elements
const name = document.getElementById('new-object-name')
const positionX = new LengthInput(document.getElementById('new-object-position-x'), 'position-x', 0)
const positionY = new LengthInput(document.getElementById('new-object-position-y'), 'position-y', 0)
const velocityX = new VelocityInput(document.getElementById('new-object-velocity-x'), 'velocity-x', 0)
const velocityY = new VelocityInput(document.getElementById('new-object-velocity-y'), 'velocity-y', 0)
const mass = new MassInput(document.getElementById('new-object-mass'), 'mass', 0)
const radius = new UnsignedLengthInput(document.getElementById('new-object-radius'), 'radius', 0)
const color = document.getElementById('new-object-color')

// set the filter logic of the input elements
newObjectDialog.registerInput(name, positionX, positionY, velocityX, velocityY, mass, radius)

newObjectDialog.on('open', () => {
  name.focus()
})

newObjectDialog.on('drag-end', () => {
  // convert cursor position into simulation position
  positionX.value = (animation.draggingPositionStart[0] - animation.translation[0] - animation.canvas.width / 2) * content.METERS_PER_PIXEL / animation.ratio
  positionY.value = (animation.draggingPositionStart[1] - animation.translation[1] - animation.canvas.height / 2) * content.METERS_PER_PIXEL / animation.ratio
  velocityX.value = (animation.draggingPositionEnd[0] - animation.draggingPositionStart[0]) / animation.ratio
  velocityY.value = (animation.draggingPositionEnd[1] - animation.draggingPositionStart[1]) / animation.ratio
  animation.dragging = false
  newObjectDialog.show()
})

document.getElementById('new-object-drag-position').addEventListener('click', () => {
  if (!radius.checkValidity()) {
    radius._inputElement.focus()
    return
  }

  animation.dragging = true
  animation.draggingRadius = radius.value
  animation.draggingColor = color.value
  newObjectDialog.hide()
})

document.getElementById('new-object-position-center').addEventListener('click', () => {
  positionX.value = -animation.translation[0] * content.METERS_PER_PIXEL / animation.ratio
  positionY.value = -animation.translation[1] * content.METERS_PER_PIXEL / animation.ratio
})

document.getElementById('new-object-submit').addEventListener('click', newObjectDialog.submit = () => {
  if (newObjectDialog.validate()) {
    const position = Vec2.create(Number(positionX.value), Number(positionY.value))
    const velocity = Vec2.create(Number(velocityX.value), Number(velocityY.value))
    const object = new Body(position, Number(mass.value), Number(radius.value), name.value.toString())
    object.velocity = velocity
    object.color = Color.fromHexString(color.value)
    content.add(object)

    newObjectDialog.close()
    animation.shouldRender = true
  }
})

},{"../../animation/animation.js":1,"../../animation/color.js":2,"../../content/body.js":8,"../../content/content.js":9,"../../content/vec2.js":12,"./dialog.js":24,"./length-input.js":25,"./mass-input":26,"./unsigned-length-input.js":32,"./velocity-input.js":33}],29:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const LengthInput = require('./length-input.js')
const UnsignedLengthInput = require('./unsigned-length-input.js')
const MassInput = require('./mass-input')
const VelocityInput = require('./velocity-input.js')
const Color = require('../../animation/color.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

const objectDialog = module.exports = new Dialog(document.getElementById('object-dialog'))

// get the input elements
const name = document.getElementById('object-name')
const positionX = new LengthInput(document.getElementById('object-position-x'), 'position-x', 0)
const positionY = new LengthInput(document.getElementById('object-position-y'), 'position-y', 0)
const velocityX = new VelocityInput(document.getElementById('object-velocity-x'), 'velocity-x', 0)
const velocityY = new VelocityInput(document.getElementById('object-velocity-y'), 'velocity-y', 0)
const mass = new MassInput(document.getElementById('object-mass'), 'mass', 0)
const radius = new UnsignedLengthInput(document.getElementById('object-radius'), 'radius', 0)
const color = document.getElementById('object-color')

// set the filter logic of the input elements
objectDialog.registerInput(name, positionX, positionY, velocityX, velocityY, mass, radius)

objectDialog.on('open', () => {
  name.focus()
})

objectDialog.on('drag-end', () => {
  // convert cursor position into simulation position
  positionX.value = (animation.draggingPositionStart[0] - animation.translation[0] - animation.canvas.width / 2) * content.METERS_PER_PIXEL / animation.ratio
  positionY.value = (animation.draggingPositionStart[1] - animation.translation[1] - animation.canvas.height / 2) * content.METERS_PER_PIXEL / animation.ratio
  velocityX.value = (animation.draggingPositionEnd[0] - animation.draggingPositionStart[0]) / animation.ratio
  velocityY.value = (animation.draggingPositionEnd[1] - animation.draggingPositionStart[1]) / animation.ratio
  animation.dragging = false
  objectDialog.show()
})

document.getElementById('object-drag-position').addEventListener('click', () => {
  if (!radius.checkValidity()) {
    radius._inputElement.focus()
    return
  }

  animation.dragging = true
  animation.draggingRadius = radius.value
  animation.draggingColor = color.value
  objectDialog.hide()
})

document.getElementById('object-position-center').addEventListener('click', () => {
  positionX.value = (-animation.translation[0] * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
  positionY.value = (-animation.translation[1] * content.METERS_PER_PIXEL / animation.ratio).toExponential(3)
})

objectDialog.setValues = () => {
  const object = content.editedObject
  color.value = object.color.hexString()
  objectDialog.set({
    'name': object.name || ('Object #' + object.id),
    'position-x': object.position[0].toExponential(3),
    'position-y': object.position[1].toExponential(3),
    'velocity-x': object.velocity[0].toExponential(3),
    'velocity-y': object.velocity[1].toExponential(3),
    'mass': object.mass.toExponential(3),
    'radius': object.radius.toExponential(3)
  })
}

document.getElementById('object-submit').addEventListener('click', objectDialog.submit = () => {
  if (objectDialog.validate()) {
    const object = content.editedObject
    object.name = name.value
    object.position[0] = Number(positionX.value)
    object.position[1] = Number(positionY.value)

    object.velocity[0] = Number(velocityX.value)
    object.velocity[1] = Number(velocityY.value)

    object.mass = Number(mass.value)
    object.radius = Number(radius.value)
    object.color = Color.fromHexString(color.value)

    object.clearHistory()
    objectDialog.close()
    ui.update()
    animation.shouldRender = true
  }
})

},{"../../animation/animation.js":1,"../../animation/color.js":2,"../../content/content.js":9,"../../ui/ui.js":36,"./dialog.js":24,"./length-input.js":25,"./mass-input":26,"./unsigned-length-input.js":32,"./velocity-input.js":33}],30:[function(require,module,exports){
const Deserializer = require('../../serialization/deserializer.js')
const Dialog = require('./dialog.js')
const scenes = require('../../scenes/list.js')

const sceneDialog = module.exports = new Dialog(document.getElementById('scene-dialog'))

// get the input elements
const file = document.getElementById('deserialize-file')
const info = document.getElementById('scene-info')
const sceneName = document.getElementById('scene-name')
const sceneDescription = document.getElementById('scene-description')
const reader = new FileReader()
const select = document.getElementById('deserialize-select')
const list = document.getElementById('deserialize-default')
const fileItem = document.getElementById('deserialize-file-item')
const invalidScene = document.getElementById('invalid-scene')
const invalidSceneMessage = document.getElementById('invalid-scene-message')

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

select.addEventListener('change', () => {
  if (select.selectedIndex === 0) {
    info.classList.add('hidden')
    fileItem.classList.remove('hidden')
  } else {
    fileItem.classList.add('hidden')
    info.classList.remove('hidden')
    const scene = scenes[select.selectedIndex - 1]
    sceneName.textContent = scene.meta.name || sceneNames[select.selectedIndex - 1]
    sceneDescription.textContent = scene.meta.description || sceneName.textContent
    sceneDialog.hideError()
  }
})

document.getElementById('load-scene').addEventListener('click', sceneDialog.submit = () => {
  if (select.selectedIndex === 0) {
    reader.onload = function () {
      Deserializer.deserialize(reader.result, (err) => {
        if (err) {
          sceneDialog.showError(err)
        } else {
          sceneDialog.close()
          sceneDialog.hideError()
        }
      })
    }
    if (file.files[0]) {
      reader.readAsText(file.files[0])
    }
  } else {
    Deserializer.selectScene(scenes[select.selectedIndex - 1])
    sceneDialog.close()
    sceneDialog.hideError()
  }
})

},{"../../scenes/list.js":15,"../../serialization/deserializer.js":19,"./dialog.js":24}],31:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

// create the settings dialog
const settingsDialog = module.exports = new Dialog(document.getElementById('settings-dialog'))

// get the input elements
const translationX = document.getElementById('settings-translation-x')
const translationY = document.getElementById('settings-translation-y')
const scalingFactor = document.getElementById('settings-scaling-factor')
const drawHistory = document.getElementById('settings-draw-history')
const drawControls = document.getElementById('settings-draw-controls')
const drawLabels = document.getElementById('settings-draw-labels')
const timeFactor = document.getElementById('settings-time-factor')

// the checked state of checkboxes is cached, so we need to check and uncheck them ourselves if we want them to be (un)checked by default
drawHistory.checked = true
drawControls.checked = true
drawLabels.checked = false

// set the filter logic of the input elements
settingsDialog.registerInput(translationX, translationY, scalingFactor, timeFactor)
settingsDialog.setFilterFunction(scalingFactor, Dialog.greaterThanZero)
settingsDialog.setFilterFunction(timeFactor, Dialog.greaterThanZero)

settingsDialog.on('open', () => {
  translationX.focus()
})

settingsDialog.on('drag-end', () => {
  // convert cursor position into simulation position
  translationX.value = (animation.translation[0] + animation.draggingPositionEnd[0] - animation.canvas.width / 2).toExponential(3)
  translationY.value = (animation.translation[1] + animation.draggingPositionEnd[1] - animation.canvas.height / 2).toExponential(3)
  animation.dragging = false
  animation.draggingCenter = false
  settingsDialog.show()
})

document.getElementById('settings-drag-center').addEventListener('click', () => {
  animation.dragging = true
  animation.draggingColor = '#3477CC'
  animation.draggingCenter = true
  settingsDialog.hide()
})

// set the input values when the dialog is opened
settingsDialog.setValues = () => {
  drawHistory.checked = animation.drawHistory
  drawControls.checked = animation.drawControls
  drawLabels.checked = animation.drawLabels
  settingsDialog.set({
    'translation-x': animation.translation[0].toExponential(3),
    'translation-y': animation.translation[1].toExponential(3),
    'scaling-factor': animation.ratio.toExponential(3),
    'time-factor': content.TIME_FACTOR.toExponential(3)
  })
}

document.getElementById('center-viewport').addEventListener('click', () => {
  animation.translation[0] = translationX.value = 0
  animation.translation[1] = translationY.value = 0

  ui.selectedObject = null
})

document.getElementById('settings-submit').addEventListener('click', settingsDialog.submit = () => {
  if (settingsDialog.validate()) {
    animation.translation[0] = Number(translationX.value)
    animation.translation[1] = Number(translationY.value)
    animation.ratio = Number(scalingFactor.value)
    animation.drawHistory = drawHistory.checked
    animation.drawControls = drawControls.checked
    animation.drawLabels = drawLabels.checked
    settingsDialog.close()
    content.TIME_FACTOR = Number(timeFactor.value)
    animation.shouldRender = true
  }
})

},{"../../animation/animation.js":1,"../../content/content.js":9,"../../ui/ui.js":36,"./dialog.js":24}],32:[function(require,module,exports){
const LengthInput = require('./length-input.js')

module.exports = class UnsignedLengthInput extends LengthInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue)
  }

  checkValidity () {
    const valid = this.value > 0
    if (valid) {
      this._inputElement.classList.remove('dialog-input-invalid')
    } else {
      this._inputElement.classList.add('dialog-input-invalid')
    }
    return valid
  }

}

},{"./length-input.js":25}],33:[function(require,module,exports){
const MultiUnitInput = require('./multi-unit-input.js')

module.exports = class VelocityInput extends MultiUnitInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue, 'm/s', 1)
    this.addUnit('km/h', 1/3.6)
    this.addUnit('c',  2.99792458e8)
  }

}

},{"./multi-unit-input.js":27}],34:[function(require,module,exports){
const animation = require('../animation/animation.js')
const content = require('../content/content.js')
const {mainLoop} = require('../astrosim.js')
const Serializer = require('../serialization/serializer.js')
const ui = require('../ui/ui.js')

module.exports = function () {
  const sideBar = document.getElementById('side-bar')

  // events for the buttons
  document.getElementById('serialize-button').addEventListener('click', () => {
    const data = Serializer.createData()
    Serializer.serialize(data)
  })
  this.togglePauseButton.addEventListener('click', () => {
    if (mainLoop.running) {
      ui.pause()
    } else {
      ui.unpause()
    }
  })
  document.getElementById('open-new-object-dialog').addEventListener('click', () => {
    this.dialogs.newObjectDialog.open()
  })
  document.getElementById('open-about').addEventListener('click', () => {
    this.dialogs.aboutDialog.open()
  })
  document.getElementById('open-details').addEventListener('click', () => {
    ui.updateHistory()
    this.dialogs.detailsDialog.open()
  })
  document.getElementById('object-delete').addEventListener('click', () => {
    const object = content.editedObject
    content.remove(object)
    this.update()
    animation.shouldRender = true
    this.dialogs.objectDialog.close()
  })
  document.getElementById('object-cancel').addEventListener('click', () => {
    this.dialogs.objectDialog.close()
  })
  document.getElementById('new-object-cancel').addEventListener('click', () => {
    this.dialogs.newObjectDialog.close()
  })
  document.getElementById('open-settings-dialog').addEventListener('click', () => {
    const {settingsDialog} = this.dialogs
    settingsDialog.setValues()
    settingsDialog.open()
  })
  document.getElementById('open-scene').addEventListener('click', () => {
    this.dialogs.sceneDialog.open()
  })
  document.getElementById('cancel-scene').addEventListener('click', () => {
    this.dialogs.sceneDialog.hideError()
    this.dialogs.sceneDialog.close()
  })
  document.getElementById('settings-cancel').addEventListener('click', () => {
    this.dialogs.settingsDialog.close()
  })

  document.getElementById('open-side-bar').addEventListener('click', () => {
    sideBar.classList.remove('side-bar-closed')
  })
  document.getElementById('close-side-bar').addEventListener('click', () => {
    sideBar.classList.add('side-bar-closed')
  })

  ui.keyboard.on('Enter', () => {
    if (ui.dialogs.openDialog) {
      ui.dialogs.openDialog.submit()
    } else {
      if (mainLoop.running) {
        ui.pause()
      } else {
        ui.unpause()
      }
    }
  })

  ui.keyboard.on('n', () => {
    if (!ui.dialogs.openDialog) {
      ui.dialogs.newObjectDialog.open()
    }
  })

  ui.keyboard.on('s', () => {
    if (!ui.dialogs.openDialog) {
      ui.dialogs.sceneDialog.open()
    }
  })

  ui.keyboard.on('p', () => {
    if (!ui.dialogs.openDialog) {
      ui.dialogs.settingsDialog.open()
    }
  })

  ui.keyboard.on('x', () => {
    if (animation.dragging && ui.dialogs.openDialog) {
      animation.dragging = false
      ui.dialogs.openDialog.show()
      return
    }
    if (ui.dialogs.openDialog && document.activeElement === document.body) {
      ui.dialogs.openDialog.close()
    }
  })

  ui.keyboard.on('m', () => {
    if (!ui.dialogs.openDialog) {
      animation.translation[0] = 0
      animation.translation[1] = 0
      animation.shouldRender = true
    }
  })
}

},{"../animation/animation.js":1,"../astrosim.js":7,"../content/content.js":9,"../serialization/serializer.js":20,"../ui/ui.js":36}],35:[function(require,module,exports){
const EventEmitter = require('../content/event-emitter.js')

module.exports = class Keyboard extends EventEmitter {

  constructor () {
    super()

    this.pressedKeys = {}

    document.addEventListener('keydown', (e) => {
      this.pressedKeys[e.key] = true
      this.emit('keydown', e)
    })

    document.addEventListener('keyup', (e) => {
      this.pressedKeys[e.key] = false
      this.emit(e.key, e)
      this.emit('keyup', e)
    })
  }

  isKeyPressed (key) {
    return !!this.pressedKeys[key]
  }

}

},{"../content/event-emitter.js":10}],36:[function(require,module,exports){
const ASTRO = require('../astrosim.js')
const {mainLoop} = ASTRO
let content
const Keyboard = require('./keyboard.js')
const Body = require('../content/body.js')
const animation = require('../animation/animation.js')

const ui = module.exports = ASTRO.ui = {

  selectedObjects: [],
  historyObject: null,
  isPlaying: true,

  dialogs: require('./dialogs/dialog-manager.js'),
  keyboard: new Keyboard(),

  initialize () {
    this.list = document.getElementById('object-list')
    this.historyTable = document.getElementById('history')
    this.togglePauseButton = document.getElementById('toggle-pause-button')

    content = require('../content/content.js')

    require('./event-listeners.js').call(this)
    this.dialogs.initialize()
  },
  update () {
    let index
    const {list} = this

    while (list.firstChild) {
      list.removeChild(list.firstChild)
    }

    const {objects} = content
    for (index in objects) {
      const object = objects[index]

      const item = document.createElement('div')
      item.classList.add('object-list-item')

      const beforeItem = document.createElement('div')
      beforeItem.classList.add('object-list-item-before')
      beforeItem.style.backgroundColor = object.color.hexString()

      const contentElt = document.createElement('span')
      contentElt.appendChild(beforeItem)
      contentElt.appendChild(document.createTextNode(object.name || 'Object #' + object.id))

      const optionsButton = document.createElement('button')
      optionsButton.classList.add('edit-button')
      optionsButton.addEventListener('click', () => {
        // open properties dialog
        content.editedObject = object
        const {objectDialog} = this.dialogs
        objectDialog.setValues()
        objectDialog.open()
      })

      const centerButton = document.createElement('button')
      centerButton.classList.add('center-button')
      centerButton.addEventListener('click', () => {
        // add object to selection
        const {selectedObjects} = ui
        let selectionIndex
        if ((selectionIndex = selectedObjects.indexOf(object)) > -1) {
          selectedObjects.splice(selectionIndex, 1)
          item.classList.remove('selected-object')
        } else {
          selectedObjects.push(object)
          item.classList.add('selected-object')
        }

        animation.shouldRender = true
      })

      const buttonWrapper = document.createElement('div')
      buttonWrapper.appendChild(optionsButton)
      buttonWrapper.appendChild(centerButton)

      item.appendChild(contentElt)
      item.appendChild(buttonWrapper)
      list.appendChild(item)
    }

    this.updateSelection()
  },

  updateSelection () {
    const selection = ui.selectedObjects
    const selectionIndices = selection.map((object, index) => index)
    const {list} = this
    const children = Array.prototype.slice.call(list.children)
    const {length} = children
    let index
    for (index = 0; index < length; index += 1) {
      const item = children[index]
      if (selectionIndices.indexOf(index) > -1) {
        item.classList.add('selected-object')
      } else {
        item.classList.remove('selected-object')
      }
    }
  },

  updateHistory () {
    const {objects} = content
    const {historyTable} = this
    let child = historyTable.firstChild.nextElementSibling.nextElementSibling

    while (child) {
      const prev = child
      child = prev.nextSibling
      historyTable.removeChild(prev)
    }

    let index = 0, tdIndex = 0
    for (index in objects) {
      const tr = document.createElement('tr')
      const object = objects[index]

      for (tdIndex = 0; tdIndex < 7; tdIndex += 1) {
        const td = document.createElement('td')
        tr.appendChild(td)
      }

      const selectButton = document.createElement('span')
      selectButton.classList.add('details-list-item-before')
      selectButton.style.backgroundColor = object.color.hexString()
      selectButton.addEventListener('click', () => {
        ui.historyObject = object
        ui.updateHistoryValues()
      })
      const name = document.createElement('span')
      name.textContent = object.name

      tr.children[0].appendChild(selectButton)
      tr.children[0].appendChild(name)

      historyTable.appendChild(tr)
    }

    this.updateHistoryValues()
  },

  updateHistoryValues () {
    const object = this.historyObject
    const {objects} = content

    if (!object) {
      return
    }

    let index
    const {length} = objects
    for (index = 0; index < length; index += 1) {
      const tr = this.historyTable.children[index + 1]
      if (index === object.id) {
        tr.children[1].textContent = '-'
        tr.children[2].textContent = '-'
        tr.children[3].textContent = '-'
        tr.children[4].textContent = '-'
        tr.children[5].textContent = '-'
        tr.children[6].textContent = '-'
      } else {
        const history = content.histories[object.id][index]
        tr.children[1].textContent = history.force.average.toExponential(3)
        tr.children[2].textContent = history.force.min.toExponential(3)
        tr.children[3].textContent = history.force.max.toExponential(3)
        tr.children[4].textContent = history.distance.average.toExponential(3)
        tr.children[5].textContent = history.distance.min.toExponential(3)
        tr.children[6].textContent = history.distance.max.toExponential(3)
      }
    }
  },

  pause () {
    if (animation.dragging) {
      return
    }
    animation.pause()
    this.isPlaying = false
    this.togglePauseButton.textContent = 'Play'
    this.togglePauseButton.classList.add('play-button')
    this.togglePauseButton.classList.remove('pause-button')
  },
  unpause () {
    if (animation.dragging) {
      return
    }
    animation.unpause()
    this.isPlaying = true
    this.togglePauseButton.textContent = 'Pause'
    this.togglePauseButton.classList.remove('play-button')
    this.togglePauseButton.classList.add('pause-button')
  }

}

},{"../animation/animation.js":1,"../astrosim.js":7,"../content/body.js":8,"../content/content.js":9,"./dialogs/dialog-manager.js":23,"./event-listeners.js":34,"./keyboard.js":35}]},{},[7]);
