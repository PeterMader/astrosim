(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
const ASTRO = require('../astrosim.js')
const Loop = require('./loop.js')
const {mainLoop} = ASTRO
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
    this.ctx = canvas.getContext('2d')
    this.adjust()

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

},{"../astrosim.js":7,"../content/vec3.js":11,"./event-listeners.js":3,"./loop.js":4,"./render.js":5,"./transformation.js":6}],2:[function(require,module,exports){
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

module.exports = function () {
  const {canvas} = this

  const translate = (e) => {
    if (!mouseHeld) {
      return
    }

    animation.translate(startX - e.clientX, startY - e.clientY)

    document.body.position = 'absolute'
  }

  window.addEventListener('resize', () => {
    animation.adjust()
  })

  // event for the scaling
  canvas.addEventListener('wheel', (e) => {
    const factor = e.deltaY > 0 ? -1 : 1
    const clientX = (e.clientX - canvas.offsetLeft) || (canvas.width / 2)
    const clientY = (e.clientY - canvas.offsetTop) || (canvas.height / 2)

    animation.scale(factor, clientX - canvas.width / 2, clientY - canvas.height / 2)
  })

  // events for the canvas translation
  let startX = 0, startY = 0, mouseHeld = false
  canvas.addEventListener('mousedown', (e) => {
    mouseHeld = true
    startX = e.clientX
    startY = e.clientY
    document.body.position = 'fixed'
  })
  canvas.addEventListener('mousemove', (e) => {
    translate(e)
    startX = e.clientX
    startY = e.clientY
  })
  canvas.addEventListener('mouseup', translate)
  document.body.addEventListener('mouseup', () => {
    mouseHeld = false
  })
}

},{"./animation.js":1}],4:[function(require,module,exports){
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
const Vec2 = require('../content/vec2.js')
const Vec3 = require('../content/vec3.js')

animation.drawCircle = function (x, y, radius, color) {
  const {ctx} = this
  ctx.fillStyle = color

  // draw the circle shape and fill it
  ctx.beginPath()
  ctx.moveTo(x, y - radius)

  ctx.arc(x, y, radius, 0, Math.PI * 2, true)
  ctx.fill()
}

animation.drawControls = function () {
  const {translation, ratio, canvas, ctx} = this

  // draw the center point
  const x = translation[0] / (translation[2] || 1e-10) + canvas.width / 2
  const y = translation[1] / (translation[2] || 1e-10) + canvas.height / 2
  ctx.strokeStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(x, y - 10)
  ctx.lineTo(x, y + 10)
  ctx.moveTo(x - 10, y)
  ctx.lineTo(x + 10, y)
  ctx.stroke()


  // ctx.beginPath()
  // ctx.moveTo(1 / (object.position[2] - offsetZ) || 1e-10 / content.METERS_PER_PIXEL)

  // draw the unit
  ctx.fillStyle = '#FFFFFF'
  const unit = 200
  const width = (unit * content.METERS_PER_PIXEL).toExponential(2)
  ctx.fillRect(canvas.width - unit - 20, canvas.height - 22, unit, 2)
  const metrics = ctx.measureText(width)
  ctx.fillText(width, canvas.width - unit / 2 - metrics.width / 2 - 20, canvas.height - 40)
}

animation.render = function () {
  const {ctx, canvas} = this
  const objects = content.objects.sort((a, b) => {
    const z1 = a.position[2]
    const z2 = b.position[2]
    return z1 > z2 ? -1 : z1 < z2 ? 1 : 0
  })

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (animation.selectedObject instanceof Body) {
    // center the canvas at the selected object's center
    this.center(Vec2.scale(animation.selectedObject.position, 1 / content.METERS_PER_PIXEL, content.temp1))
  }

  if (objects.length > 0) {
    canvasCenter = content.temp1
    canvasCenter[0] = canvas.width / 2
    canvasCenter[1] = canvas.height / 2
    const pos = content.temp2
    const offsetX = this.translation[0] + canvasCenter[0]
    const offsetY = this.translation[1] + canvasCenter[1]
    const offsetZ = this.translation[2]

    let index
    // walk over each object and draw it
    for (index in objects) {
      const object = objects[index]
      const factor = 1 / content.METERS_PER_PIXEL
      const distance = ((object.position[2] - offsetZ) || 1e-10) / content.METERS_PER_PIXEL
      if (distance < 0) {
        continue
      }
      Vec3.scale(object.position, factor, pos)
      pos[0] += this.translation[0]
      pos[1] += this.translation[1]
      pos[0] /= distance
      pos[1] /= distance
      pos[0] += canvasCenter[0]
      pos[1] += canvasCenter[1]

      // calculate the circle's radius
      const radius = object.radius / distance
      const color = object.color.hexString()

      // draw the circle
      this.drawCircle(pos[0], pos[1], Math.max(radius, 1), color)

      if (animation.drawHistory && false) {
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

  // finally, draw the center cross and the measure unit
  this.drawControls()
}

},{"../content/body.js":8,"../content/content.js":9,"../content/vec2.js":10,"../content/vec3.js":11,"./animation.js":1}],6:[function(require,module,exports){
const animation = require('./animation.js')
const content = require('../content/content.js')
const Vec2 = require('../content/vec2.js')

animation.center = function (pos) {
  // Vec2.scale(pos, -this.ratio, this.translation)
  this.translation[0] = pos[0]
  this.translation[1] = pos[1]
  this.translation[2] = .5
}

animation.translate = function (x, y) {
  animation.translation[0] -= x * content.METERS_PER_PIXEL
  animation.translation[1] -= y * content.METERS_PER_PIXEL

  animation.shouldRender = true
}

animation.scale = function (factor, centerX, centerY) {
  this.translation[2] += factor * content.METERS_PER_PIXEL
  animation.shouldRender = true
}

},{"../content/content.js":9,"../content/vec2.js":10,"./animation.js":1}],7:[function(require,module,exports){
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

},{"./animation/animation.js":1,"./animation/loop.js":4,"./content/content.js":9,"./ui/ui.js":21}],8:[function(require,module,exports){
const Vec3 = require('./vec3.js')
const Color = require('../animation/color.js')
const {content} = require('../astrosim.js')
const ASTRO = require('../astrosim.js')

module.exports = class Body {
  constructor (position, mass, radius, name) {
    this.position = position
    this.velocity = Vec3.create()
    this.mass = mass || 0
    this.radius = radius
    this.color = new Color()
    this.name = name

    // remember the last 100 positions
    this.history = new Float32Array(300)
    this.historyIndex = 0
    this.historyOverflow = false

    this.history[0] = position[0]
    this.history[1] = position[1]
    this.history[2] = position[2]
  }

  applyForce (force) {
    const factor = 1 / this.mass
    this.velocity[0] += force[0] * factor
    this.velocity[1] += force[1] * factor
    this.velocity[2] += force[2] * factor
  }

  serialize () {
    return {
      positionX: this.position[0],
      positionY: this.position[1],
      positionZ: this.position[2],
      velocityX: this.velocity[0],
      velocityY: this.velocity[1],
      velocityZ: this.velocity[2],
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
    this.position[2] += this.velocity[2] * deltaTime
  }

  savePosition () {
    this.history[this.historyIndex] = this.position[0]
    this.history[this.historyIndex + 1] = this.position[1]
    this.history[this.historyIndex + 2] = this.position[2]
    this.historyIndex += 3
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
    const {objects} = ASTRO.content
    let index
    for (index in objects) {
      const body = objects[index]
      if (body === this) {
        continue
      }
      this.interact(body, objects, index, deltaTime)
    }
  }

  interact (body, objects, bodyIndex, deltaTime) {
    // calculate the distance between the two objects
    let distance = Vec3.subtract(this.position, body.position, ASTRO.content.temp1)
    const length = Vec3.getLength(distance) || 1e-10
    if (isNaN(distance[0]) || isNaN(distance[1])) {
      distance[0] = distance[1] = distance[2] = 0
    }

    // check for collision
    if (length < this.radius) {
      const newPosition = Vec3.weighedCenter(this.position, this.mass, body.position, body.mass, distance)
      const newRadius = Math.pow(4 / 3 * Math.PI * Math.pow(this.radius, 3) + 4 / 3 * Math.PI * Math.pow(body.radius, 3), 1 / 3)
      const newBody = new Body(Vec3.copy(newPosition), this.mass + body.mass, newRadius)

      // remove the two colliding objects
      objects.splice(bodyIndex, 1)
      objects.splice(objects.indexOf(this), 1)

      // calculate the velocity and the color of the new object
      const thisMomentum = Vec3.scale(this.velocity, this.mass, ASTRO.content.temp2)
      const bodyMomentum = Vec3.scale(body.velocity, body.mass, ASTRO.content.temp3)
      Vec3.add(thisMomentum, bodyMomentum, newBody.velocity)
      Vec3.scale(newBody.velocity, 1 / newBody.mass, newBody.velocity)
      newBody.color = this.color.interpolate(body.color)

      // finally add the new object and show it in the UI
      ASTRO.content.add(newBody)
    } else {
      // calculate the gravity
      const force = ASTRO.content.temp2
      Vec3.scale(
        Vec3.normalize(distance, distance),
        deltaTime * ASTRO.content.GRAVITY_CONSTANT * (this.mass * body.mass) / (length * length),
        force
      )

      // move the bodies
      // body.applyForce(force)
      Vec3.scale(force, -1, force)
      this.applyForce(force)
    }
  }

  static fromSerialized (data) {
    if (!data) {
      return null
    }
    const newBody = new Body(
      Vec3.create(
        typeof data.positionX === 'number' ? data.positionX : 0,
        typeof data.positionY === 'number' ? data.positionY : 0,
        typeof data.positionZ === 'number' ? data.positionZ : 0
      ),
      typeof data.mass === 'number' ? data.mass : 1000,
      typeof data.radius === 'number' ? data.radius : 1000,
      typeof data.name === 'string' ? data.name : 'Object'
    )
    newBody.color = Color.fromHexString(data.color)
    newBody.velocity[0] = typeof data.velocityX === 'number' ? data.velocityX : 0
    newBody.velocity[1] = typeof data.velocityY === 'number' ? data.velocityY : 0
    newBody.velocity[2] = typeof data.velocityZ === 'number' ? data.velocityZ : 0
    return newBody
  }
}

},{"../animation/color.js":2,"../astrosim.js":7,"./vec3.js":11}],9:[function(require,module,exports){
const animation = require('../animation/animation.js')
const ASTRO = require('../astrosim.js')
const Vec3 = require('./vec3.js')

const content = module.exports = ASTRO.content = {

  editedObject: null, // the last object the user edited
  objects: [], // all the objects that exist
  currentId: 0, // an incremental id count
  METERS_PER_PIXEL: 3e8,
  GRAVITY_CONSTANT: 6.67408e-11,

  ticks: 0,
  realTime: 0,
  pendingTicks: 0,
  TICKS_PER_FRAME: 10,

  SECONDS_IN_YEAR: 31556927, // a year has 31,556,927 seconds
  TIME_FACTOR: 1, // the factor the time passed is multiplied by

  temp1: Vec3.create(),
  temp2: Vec3.create(),
  temp3: Vec3.create(),

  initialize () {
    this.TIME_FACTOR = this.SECONDS_IN_YEAR / 12 // initial factor: 1s in simulation equals 1 month
  },

  // saves all the objects passed to it and displays them
  add () {
    let index
    for (index in arguments) {
      const object = arguments[index]
      this.objects.push(object)
      object.id = this.currentId += 1
    }
    ASTRO.ui.update()
  },
  // calls the 'update' method of all the objects
  update (deltaTime) {
    this.temp1[0] = this.temp1[1] = this.temp1[2] =
        this.temp2[0] = this.temp2[1] = this.temp2[2] =
        this.temp3[0] = this.temp3[1] = this.temp3[2] = 0
    this.pendingTicks += this.TICKS_PER_FRAME
    if (this.pendingTicks > 100) {
      this.TICKS_PER_FRAME -= 1
    }
    const {objects} = ASTRO.content
    const deltaSecs = deltaTime / 1000 * this.TIME_FACTOR / this.TICKS_PER_FRAME
    this.realTime += deltaSecs
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
      this.pendingTicks -= 1
    }
  },
  // calculates the momentum of all objects
  momentum () {
    return this.objects.reduce((acc, obj) => {
      return Vec3.add(acc, Vec3.scale(obj.velocity, obj.mass))
    }, Vec3.create())
  },
  // calculates the velocity of the system
  velocity () {
    return Vec3.scale(this.momentum(), 1 / this.objects.reduce((acc, obj) => acc + obj.mass, 0))
  }
}

},{"../animation/animation.js":1,"../astrosim.js":7,"./vec3.js":11}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
module.exports = class Vec3 {

  static create (x, y, z) {
    const newVector = new Float32Array(3)
    newVector[0] = x || 0
    newVector[1] = y || 0
    newVector[2] = z || 0

    return newVector
  }

  static copy (a, result) {
    let out = result
    if (!out) {
      out = Vec3.create(a[0], a[1], a[2])
    } else {
      out[0] = a[0]
      out[1] = a[1]
      out[2] = a[2]
    }
    return out
  }

  static weighedCenter (a, w1, b, w2, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const factor = w2 / (w1 + w2)
    out[0] = factor * ((b[0] - a[0]) || 1e-10) + a[0]
    out[1] = factor * ((b[1] - a[1]) || 1e-10) + a[1]
    out[2] = factor * ((b[2] - a[2]) || 1e-10) + a[2]
    return out
  }

  static add (a, b, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
  }

  static subtract (a, b, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
  }

  static getLength (a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
  }

  static normalize (a, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    let length = Vec3.getLength(a)
    out[0] = a[0] / length
    out[1] = a[1] / length
    out[2] = a[2] / length
    return out
  }

  static scale (a, scalar, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    out[0] = a[0] * scalar
    out[1] = a[1] * scalar
    out[2] = a[2] * scalar
    return out
  }

}

},{}],12:[function(require,module,exports){
const animation = require('../animation/animation.js')
const Body = require('../content/body.js')
const content = require('../content/content.js')
const ui = require('../ui/ui.js')

module.exports = class Deserializer {

  static deserialize (string) {
    let data
    try {
      data = JSON.parse(string)
    } catch (e) {
      console.log('Error parsing the selected file: ', e)
      return
    }

    if (Deserializer.validateData(data)) {
      content.objects = []
      content.currentId = 0
      content.add.apply(content, data.content.objects.map((item) => Body.fromSerialized(item)))
      content.TIME_FACTOR = data.content.timeFactor

      animation.translation[0] = data.viewport.translationX
      animation.translation[1] = data.viewport.translationY
      animation.translation[2] = data.viewport.translationZ
      animation.ratio = data.viewport.ratio
      animation.selectedObject = Body.fromSerialized(data.content.selectedObject)

      animation.shouldRender = true
      ui.update()
      ui.pause()
    } else {
      console.log('Invalid file!')
    }
  }

  static validateData (data) {
    return (typeof data === 'object') &&
      (typeof data.viewport === 'object') &&
      (typeof data.viewport.translationX === 'number') && !isNaN(data.viewport.translationX) &&
      (typeof data.viewport.translationY === 'number') && !isNaN(data.viewport.translationY) &&
      (typeof data.viewport.translationZ === 'number') && !isNaN(data.viewport.translationZ) &&
      (typeof data.viewport.ratio === 'number') && !isNaN(data.viewport.ratio) &&
      (typeof data.content === 'object') &&
      (typeof data.content.timeFactor === 'number') &&
      (typeof data.content.selectedObject === 'object') &&
      (Array.isArray(data.content.objects)) &&
      data.content.objects.filter((item) => typeof item === 'object')
  }

}

},{"../animation/animation.js":1,"../content/body.js":8,"../content/content.js":9,"../ui/ui.js":21}],13:[function(require,module,exports){
const animation = require('../animation/animation.js')
const content = require('../content/content.js')
const ui = require('../ui/ui.js')

module.exports = class Serializer {

  // create the data to serialize
  static createData () {
    const data = {}
    data.viewport = {
      translationX: animation.translation[0],
      translationY: animation.translation[1],
      translationZ: animation.translation[2],
      ratio: animation.ratio
    }
    data.content = {
      selectedObject: ui.selectedObject ? ui.selectedObject.serialize() : null,
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

},{"../animation/animation.js":1,"../content/content.js":9,"../ui/ui.js":21}],14:[function(require,module,exports){
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

},{"../../serialization/deserializer.js":12,"./dialog.js":15}],15:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const ui = require('../../ui/ui.js')

module.exports = class Dialog {
  constructor (element) {
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
  forEachInput (cb) {
    let index
    const {inputs} = this
    for (index in inputs) {
      const input = inputs[index]
      cb(input, index)
    }
  }
  reset () {
    this.forEachInput((input) => {
      input.value = input.getAttribute('data-default-value') || ''
    })
  }
  set (values) {
    this.forEachInput((input, index) => {
      if (values[index]) {
        input.value = values[index]
      }
    })
  }
  validate () {
    let valid = true
    const invalid = this.invalidInputs = []
    this.forEachInput((input, name) => {
      if (!valid) {
        return
      }
      const filter = input.filterFunction || this.defaultFilterFunction
      const inputValid = !!filter(input, input.value, name)
      if (!inputValid) {
        invalid.push(input)
        input.classList.add('dialog-input-invalid')
      } else {
        input.classList.remove('dialog-input-invalid')
      }
      valid = inputValid
    })
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
    this.element.classList.add('dialog-open')
    this.element.classList.remove('dialog-closed')
    this.opened = true

    animation.pause()
  }
  close () {
    this.element.classList.remove('dialog-open')
    this.element.classList.add('dialog-closed')
    this.opened = false

    if (ui.isPlaying) {
      animation.unpause()
    }
  }
  static greaterThanZero (input, value) {
    let floatValue = Number(value)
    return floatValue > 0
  }
}

},{"../../animation/animation.js":1,"../../ui/ui.js":21}],16:[function(require,module,exports){
module.exports = {

  settingsDialog: null,
  objectDialog: null,
  newObjectDialog: null,
  deserializeDialog: null,

  initialize () {
    this.settingsDialog = require('./settings-dialog.js')
    this.objectDialog = require('./object-dialog.js')
    this.newObjectDialog = require('./new-object-dialog.js')
    this.deserializeDialog = require('./deserialize-dialog.js')
  }
}

},{"./deserialize-dialog.js":14,"./new-object-dialog.js":17,"./object-dialog.js":18,"./settings-dialog.js":19}],17:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const Dialog = require('./dialog.js')
const Vec3 = require('../../content/vec3.js')
const Color = require('../../animation/color.js')
const Body = require('../../content/body.js')
const content = require('../../content/content.js')

const newObjectDialog = module.exports = new Dialog(document.getElementById('new-object-dialog'))

// get the input elements
const name = document.getElementById('new-object-name')
const positionX = document.getElementById('new-object-position-x')
const positionY = document.getElementById('new-object-position-y')
const positionZ = document.getElementById('new-object-position-z')
const velocityX = document.getElementById('new-object-velocity-x')
const velocityY = document.getElementById('new-object-velocity-y')
const velocityZ = document.getElementById('new-object-velocity-z')
const mass = document.getElementById('new-object-mass')
const radius = document.getElementById('new-object-radius')
const color = document.getElementById('new-object-color')

// set the filter logic of the input elements
newObjectDialog.registerInput(name, positionX, positionY, positionZ, velocityX, velocityY, velocityZ, mass, radius)
newObjectDialog.setFilterFunction(mass, Dialog.greaterThanZero)
newObjectDialog.setFilterFunction(radius, Dialog.greaterThanZero)

document.getElementById('new-object-submit').addEventListener('click', () => {
  if (newObjectDialog.validate()) {
    const position = Vec3.create(Number(positionX.value), Number(positionY.value), Number(positionZ.value))
    const velocity = Vec3.create(Number(velocityX.value), Number(velocityY.value), Number(velocityZ.value))
    const object = new Body(position, Number(mass.value), Number(radius.value), name.value.toString())
    object.velocity = velocity
    object.color = Color.fromHexString(color.value)
    content.add(object)

    newObjectDialog.close()
    animation.shouldRender = true
  }
})

},{"../../animation/animation.js":1,"../../animation/color.js":2,"../../content/body.js":8,"../../content/content.js":9,"../../content/vec3.js":11,"./dialog.js":15}],18:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const Color = require('../../animation/color.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

const objectDialog = module.exports = new Dialog(document.getElementById('object-dialog'))

// get the input elements
const name = document.getElementById('object-name')
const positionX = document.getElementById('object-position-x')
const positionY = document.getElementById('object-position-y')
const positionZ = document.getElementById('object-position-z')
const velocityX = document.getElementById('object-velocity-x')
const velocityY = document.getElementById('object-velocity-y')
const velocityZ = document.getElementById('object-velocity-z')
const mass = document.getElementById('object-mass')
const radius = document.getElementById('object-radius')
const color = document.getElementById('object-color')

// set the filter logic of the input elements
objectDialog.registerInput(name, positionX, positionY, positionZ, velocityX, velocityY, velocityZ, mass, radius)
objectDialog.setFilterFunction(mass, Dialog.greaterThanZero)
objectDialog.setFilterFunction(radius, Dialog.greaterThanZero)

objectDialog.setValues = () => {
  const object = content.editedObject
  color.value = object.color.hexString()
  objectDialog.set({
    'name': object.name || ('Object #' + object.id),
    'position-x': object.position[0].toExponential(3),
    'position-y': object.position[1].toExponential(3),
    'position-z': object.position[2].toExponential(3),
    'velocity-x': object.velocity[0].toExponential(3),
    'velocity-y': object.velocity[1].toExponential(3),
    'velocity-z': object.velocity[2].toExponential(3),
    'mass': object.mass.toExponential(3),
    'radius': object.radius.toExponential(3)
  })
}

document.getElementById('object-submit').addEventListener('click', () => {
  if (objectDialog.validate()) {
    const object = content.editedObject
    object.name = name.value
    object.position[0] = Number(positionX.value)
    object.position[1] = Number(positionY.value)
    object.position[2] = Number(positionZ.value)

    object.velocity[0] = Number(velocityX.value)
    object.velocity[1] = Number(velocityY.value)
    object.velocity[2] = Number(velocityZ.value)

    object.mass = Number(mass.value)
    object.radius = Number(radius.value)
    object.color = Color.fromHexString(color.value)

    object.clearHistory()
    objectDialog.close()
    ui.update()
    animation.shouldRender = true
  }
})

},{"../../animation/animation.js":1,"../../animation/color.js":2,"../../content/content.js":9,"../../ui/ui.js":21,"./dialog.js":15}],19:[function(require,module,exports){
const animation = require('../../animation/animation.js')
const content = require('../../content/content.js')
const Dialog = require('./dialog.js')
const ui = require('../../ui/ui.js')

const settingsDialog = module.exports = new Dialog(document.getElementById('settings-dialog'))

// get the input elements
const translationX = document.getElementById('settings-translation-x')
const translationY = document.getElementById('settings-translation-y')
const translationZ = document.getElementById('settings-translation-z')
const timeFactor = document.getElementById('settings-time-factor')

// set the filter logic of the input elements
settingsDialog.registerInput(translationX, translationY, translationZ, timeFactor)
settingsDialog.setFilterFunction(timeFactor, Dialog.greaterThanZero)

settingsDialog.setValues = () => {
  settingsDialog.set({
    'translation-x': animation.translation[0].toExponential(3),
    'translation-y': animation.translation[1].toExponential(3),
    'translation-z': animation.translation[2].toExponential(3),
    'time-factor': content.TIME_FACTOR.toExponential(3)
  })
}

document.getElementById('center-viewport').addEventListener('click', () => {
  animation.translation[0] = 0
  animation.translation[1] = 0

  ui.selectedObject = null
})

document.getElementById('settings-submit').addEventListener('click', () => {
  if (settingsDialog.validate()) {
    animation.translation[0] = Number(translationX.value)
    animation.translation[1] = Number(translationY.value)
    animation.translation[2] = Number(translationZ.value)
    settingsDialog.close()
    content.TIME_FACTOR = Number(timeFactor.value)
    animation.shouldRender = true
  }
})

},{"../../animation/animation.js":1,"../../content/content.js":9,"../../ui/ui.js":21,"./dialog.js":15}],20:[function(require,module,exports){
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
  document.getElementById('object-delete').addEventListener('click', () => {
    const object = content.editedObject
    const index = content.objects.indexOf(object)
    if (index > -1) {
      content.objects.splice(index, 1)
      this.update()
      animation.shouldRender = true
    }
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
  document.getElementById('open-deserialize-button').addEventListener('click', () => {
    this.dialogs.deserializeDialog.open()
  })
  document.getElementById('cancel-deserialize').addEventListener('click', () => {
    this.dialogs.deserializeDialog.close()
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
}

},{"../animation/animation.js":1,"../astrosim.js":7,"../content/content.js":9,"../serialization/serializer.js":13,"../ui/ui.js":21}],21:[function(require,module,exports){
const ASTRO = require('../astrosim.js')
const {mainLoop} = ASTRO
const content = require('../content/content.js')
const Body = require('../content/body.js')
const animation = require('../animation/animation.js')

const ui = module.exports = ASTRO.ui = {

  selectedObject: null,
  isPlaying: true,

  dialogs: require('./dialogs/init-dialogs.js'),

  initialize () {
    this.list = document.getElementById('object-list')
    this.togglePauseButton = document.getElementById('toggle-pause-button')

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
      item.addEventListener('click', (e) => {
        if (e.target !== selectButton) {
          // open properties dialog
          content.editedObject = object
          const {objectDialog} = this.dialogs
          objectDialog.setValues()
          objectDialog.open()
        }
      })

      const beforeItem = document.createElement('div')
      beforeItem.classList.add('object-list-item-before')
      beforeItem.style.backgroundColor = object.color.hexString()

      const contentElt = document.createElement('span')
      contentElt.appendChild(beforeItem)
      contentElt.appendChild(document.createTextNode(object.name || 'Object #' + object.id))

      const selectButton = document.createElement('button')
      selectButton.textContent = 'Center'
      selectButton.addEventListener('click', () => {
        if (animation.selectedObject === object) {
          animation.selectedObject = null
        } else {
          animation.selectedObject = object
        }
        this.updateSelection()
        animation.shouldRender = true
      })

      item.appendChild(contentElt)
      item.appendChild(selectButton)
      list.appendChild(item)
    }

    this.updateSelection()
  },
  updateSelection () {
    const selection = animation.selectedObject
    if (selection !== null && !(selection instanceof Body)) {
      return
    }

    const index = content.objects.indexOf(selection)
    if (index < 0) {
      animation.selectedObject = null
    }
    const {list} = this
    Array.prototype.slice.call(list.children).forEach((item, itemIndex) => {
      if (index === itemIndex) {
        item.classList.add('selected-object')
      } else if (item.classList.contains('selected-object')) {
        item.classList.remove('selected-object')
      }
    })
  },

  pause () {
    animation.pause()
    this.isPlaying = false
    this.togglePauseButton.textContent = 'Play'
    this.togglePauseButton.classList.add('play-button')
    this.togglePauseButton.classList.remove('pause-button')
  },
  unpause () {
    animation.unpause()
    this.isPlaying = true
    this.togglePauseButton.textContent = 'Pause'
    this.togglePauseButton.classList.remove('play-button')
    this.togglePauseButton.classList.add('pause-button')
  }

}

},{"../animation/animation.js":1,"../astrosim.js":7,"../content/body.js":8,"../content/content.js":9,"./dialogs/init-dialogs.js":16,"./event-listeners.js":20}]},{},[7]);
