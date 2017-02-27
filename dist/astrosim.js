(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"../astrosim.js":8,"../content/controls.js":11,"../content/vec3.js":18,"./camera.js":2,"./event-listeners.js":4,"./loop.js":5,"./renderer.js":6,"./transformation.js":7}],2:[function(require,module,exports){
const Mat4 = require('../content/mat4.js')
const Vec3 = require('../content/vec3.js')

module.exports = class Camera {

  constructor () {
    this.position = Vec3.create(0, 0, 0)
    this.upwards = Vec3.create(0, 0, 1)
    this.rotationX = 0
    this.rotationY = 0
    this.rotationZ = 0
  }

  moveForward (distance) {
    this.position[0] += Math.sin(-this.rotationY) * distance
    this.position[2] += Math.cos(-this.rotationY) * distance
  }

  moveLeft (distance) {
    this.position[0] += Math.sin(-this.rotationY - Math.PI / 2) * distance
    this.position[2] += Math.cos(-this.rotationY - Math.PI / 2) * distance
  }

  rotateZ (angle) {
    this.rotationZ += angle
  }

  rotateY (angle) {
    this.rotationY += angle
  }

  rotateX (angle) {
    this.rotationX += angle
  }

}

},{"../content/mat4.js":13,"../content/vec3.js":18}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
const animation = require('./animation.js')
const math = require('../content/math.js')
const ui = require('../ui/ui.js')

module.exports = function () {
  const {canvas} = this
  const camera = animation.camera

  const translate = (e) => {
    if (!mouseHeld) {
      return
    }

    camera.rotateY((startX - e.clientX) * .001)
    camera.rotateX((startY - e.clientY) * -.001)

    document.body.position = 'absolute'
  }

  window.addEventListener('resize', () => {
    animation.adjust()
  })

  // event for the scaling
  canvas.addEventListener('wheel', (e) => {
    const factor = e.deltaY > 0 ? -10 : 10
    camera.moveForward(factor)
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

  const {keyboard} = ui
  const speed = 1
  keyboard.on('w', () => {
    camera.moveForward(speed)
  })

  keyboard.on('s', () => {
    camera.moveForward(-speed)
  })

  keyboard.on('a', () => {
    camera.moveLeft(-speed)
  })

  keyboard.on('d', () => {
    camera.moveLeft(speed)
  })

  keyboard.on('Enter', () => {
    camera.upwards = [0, 0, camera.upwards[2] === 1 ? -1 : 1]
  })

  keyboard.on('PageUp', () => {
    camera.position[1] += speed
  })

  keyboard.on('PageDown', () => {
    camera.position[1] -= speed
  })

  keyboard.on('ArrowUp', () => {
    camera.rotationX -= .05
  })

  keyboard.on('ArrowDown', () => {
    camera.rotationX += .05
  })

  keyboard.on('ArrowLeft', () => {
    camera.rotateY(-.05)
  })

  keyboard.on('ArrowRight', () => {
    camera.rotateY(.05)
  })
}

},{"../content/math.js":14,"../ui/ui.js":29,"./animation.js":1}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
// const vertexShaderCode = require('./vertex-shader.js')
// const fragmentShaderCode = require('./fragment-shader.js')
const content = require('../content/content.js')
const animation = require('./animation.js')
const Mat4 = require('../content/mat4.js')
const Vec3 = require('../content/vec3.js')

const Renderer = module.exports = class {

  constructor (canvas) {
    if (!canvas) {
      return
    }

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')

    // this.init()
  }

  getWebGlContext (canvas) {
    let gl
    try {
      // try to get the proper webgl context
      gl = canvas.getContext('webgl')
    } catch (e) {
      console.log('Could not create WebGl context; trying to create experimental WebGl context: ', e.getMessage())
      try {
        // try to get the experimental webgl context
        gl = canvas.getContext('experimental-webgl')
      } catch (e) {
        console.log('Could not create experimental WebGl context: ', e.getMessage())
      }
    }
    return gl
  }

  createShader (src, type) {
    const {gl} = this
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log('Could not compile shader: ', gl.getShaderInfoLog(shader))
      return null
    }

    return shader
  }

  init () {
    const gl = this.gl = this.getWebGlContext(canvas)
    if (!this.gl) {
      return
    }

    const program = this.program = this.createProgram(vertexShaderCode, fragmentShaderCode)
    if (!program) {
      return
    }

    gl.useProgram(program)

    program.vertexPositionAttribute = gl.getAttribLocation(program, 'aVertexPosition')
    gl.enableVertexAttribArray(program.vertexPositionAttribute)

    program.projectionMatrixUniform = gl.getUniformLocation(program, 'uProjectionMatrix')
    program.viewMatrixUniform = gl.getUniformLocation(program, 'uViewMatrix')
    program.modelMatrixUniform = gl.getUniformLocation(program, 'uModelMatrix')

    program.objectColorUniform = gl.getUniformLocation(program, 'uObjectColor')

    gl.clearColor(.3, .3, .4, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // temp!!!
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
  }

  createBuffer (data, bufferType) {
    const {gl} = this
    const buffer = gl.createBuffer()
    gl.bindBuffer(bufferType, buffer)
    gl.bufferData(bufferType, data, gl.STATIC_DRAW)
    return buffer
  }

  createProgram (vertexShaderCode, fragmentShaderCode) {
    const {gl} = this

    // create the two shaders
    const vertexShader = this.createShader(vertexShaderCode, gl.VERTEX_SHADER)
    const fragmentShader = this.createShader(fragmentShaderCode, gl.FRAGMENT_SHADER)

    if (!vertexShader || !fragmentShader) {
      return null
    }

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log('Could not link shader program: ', gl.getProgramInfoLog(program))
      return null
    }

    return program
  }

  prepareObject (object) {
    // const {gl} = this
    // object.vertexPositionBuffer = this.createBuffer(object.model.vertices, gl.ARRAY_BUFFER)
    // object.vertexIndexBuffer = this.createBuffer(object.model.indices, gl.ELEMENT_ARRAY_BUFFER)
  }

  project (objectPosition, camera, canvas, result) {
    Vec3.add(camera.position, objectPosition, result)
    Vec3.rotateX(result, camera.rotationX, result)
    Vec3.rotateY(result, camera.rotationY, result)
    Vec3.rotateZ(result, camera.rotationZ, result)
    result[0] /= -result[2]
    result[1] /= -result[2]

    const ratio = canvas.width / canvas.height

    result[0] *= canvas.width / ratio / 2
    result[0] += canvas.width / 2
    result[1] *= canvas.height * ratio / 2
    result[1] += canvas.height / 2
  }

  drawCircle (x, y, radius, color) {
    const {ctx} = this
    ctx.fillStyle = color

    // draw the circle shape and fill it
    ctx.beginPath()
    ctx.moveTo(x, y - radius)
    ctx.arc(x, y, radius, 0, Math.PI * 2, true)
    ctx.fill()
  }

  render (camera) {
    const {canvas, ctx} = this
    const {objects} = content

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const objectPositions = objects.map((object, index) => {
      const pos = Vec3.create()
      // calculate the 2d position
      this.project(object.position, camera, canvas, pos)
      pos.itemIndex = index
      return pos
    })

    const objectsInOrder = objectPositions.sort((a, b) => a[2] > b[2] ? 1 : a[2] === b[2] ? 0 : -1)

    let index
    for (index in objectsInOrder) {
      // draw a single item
      const pos = objectsInOrder[index]
      const item = objects[pos.itemIndex]
      const radius = item.radius * canvas.width / 2 / -pos[2]

      if (pos[2] > 0) {
        continue
      }

      this.drawCircle(pos[0], pos[1], radius, item.color.hexString())
    }
  }

  /* render (camera, controls) {
    const {canvas, gl, program} = this
    const {objects} = content

    camera.updateMatrix()
    const view = Mat4.copy(camera.matrix)
    const projection = Mat4.create()
    Mat4.perspective(projection, 45, canvas.width / canvas.height, 0.1, 100)

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const model = Mat4.create()

    // set global matrix uniforms
    gl.uniformMatrix4fv(program.projectionMatrixUniform, false, projection)
    gl.uniformMatrix4fv(program.viewMatrixUniform, false, view)

    let index
    for (index in objects) {
      // draw a single item
      const item = objects[index]

      const {vertexPositionBuffer, vertexIndexBuffer} = item

      // calculate the model-view-matrix
      Mat4.identity(model)
      Mat4.scale(model, [item.radius, item.radius, item.radius], model)
      Mat4.translate(model, item.position, model)

      // set the vertex positions
      gl.bindBuffer(gl.ARRAY_BUFFER, vertexPositionBuffer)
      gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

      // set matrix uniforms
      gl.uniformMatrix4fv(program.modelMatrixUniform, false, model)
      gl.uniform3f(program.objectColorUniform, item.color.r / 255, item.color.g / 255, item.color.b / 255)

      // draw the item
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, vertexIndexBuffer)
      gl.drawElements(gl.TRIANGLES, item.model.numberOfIndices, gl.UNSIGNED_SHORT, 0)
    }

    // draw controls
    // set the vertex positions
    gl.bindBuffer(gl.ARRAY_BUFFER, controls.vertexPositionBuffer)
    gl.vertexAttribPointer(program.vertexPositionAttribute, 3, gl.FLOAT, false, 0, 0)

    // set matrix uniforms
    gl.uniformMatrix4fv(program.modelMatrixUniform, false, Mat4.identity(model))
    gl.uniform3f(program.objectColorUniform, 1.0, 1.0, 1.0) // controls are white

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, controls.vertexIndexBuffer)
    gl.drawElements(gl.LINES, controls.model.numberOfIndices, gl.UNSIGNED_SHORT, 0)
  } */

}

},{"../content/content.js":10,"../content/mat4.js":13,"../content/vec3.js":18,"./animation.js":1}],7:[function(require,module,exports){
const animation = require('./animation.js')
const content = require('../content/content.js')
const Vec2 = require('../content/vec2.js')

animation.center = function (pos) {
  this.camera.position[0] = pos[0]
  this.camera.position[1] = pos[1]
  this.camera.position[2] = pos[2] + 10
  this.camera.rotationX = this.camera.rotationY = this.camera.rotationZ = 0
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

},{"../content/content.js":10,"../content/vec2.js":17,"./animation.js":1}],8:[function(require,module,exports){
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

},{"./animation/animation.js":1,"./animation/loop.js":5,"./content/content.js":10,"./ui/ui.js":29}],9:[function(require,module,exports){
const Vec3 = require('./vec3.js')
const Mat4 = require('./mat4.js')
const Color = require('../animation/color.js')
const Sphere = require('./sphere.js')
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

    this.model = new Sphere()

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

},{"../animation/color.js":3,"../astrosim.js":8,"./mat4.js":13,"./sphere.js":16,"./vec3.js":18}],10:[function(require,module,exports){
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
      ASTRO.animation.renderer.prepareObject(object)
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
        // objects[index].move(deltaSecs)
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

},{"../animation/animation.js":1,"../astrosim.js":8,"./vec3.js":18}],11:[function(require,module,exports){
const Model = require('./model.js')

module.exports = class Controls extends Model {

  constructor () {
    super()
    this.setVertices([
      0.0, 0.0, 0.0,
      1.0, 0.0, 0.0,

      0.0, 0.0, 0.0,
      0.0, 1.0, 0.0,

      0.0, 0.0, 0.0,
      0.0, 0.0, 1.0
    ], 6)
    this.setIndices([
      0, 1, 2, 3, 4, 5
    ], 6)
  }

}

},{"./model.js":15}],12:[function(require,module,exports){
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

},{}],13:[function(require,module,exports){
const Vec3 = require('./vec3.js')

module.exports = class Mat4 {

  static create () {
    return new Float32Array(16)
  }

  static copy (src, dest) {
    if (!dest) {
      return new Float32Array(src)
    }
    let i
    for (i = 0; i < 16; i += 1) {
      dest[i] = src[i]
    }
    return dest
  }

  static identity (result) {
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    return Mat4.copy(new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]), out)
  }

  static multiply (a, b, result) {
    const [
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23,
      a30, a31, a32, a33
    ] = a

    let out = result
    if (!out) {
      out = Mat4.create()
    }

    let [b0, b1, b2, b3] = b
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[4]
    b1 = b[5]
    b2 = b[6]
    b3 = b[7]
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[8]
    b1 = b[9]
    b2 = b[10]
    b3 = b[11]
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[12]
    b1 = b[13]
    b2 = b[14]
    b3 = b[15]
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
    return out
  }

  static translate (mat, vec, result) {
    const [x, y, z] = vec
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    Mat4.copy(mat, out)
    out[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12]
    out[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13]
    out[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14]
    out[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15]

    return out
  }

  static scale (mat, vec, result) {
    const [x, y, z] = vec
    const res = Mat4.copy(mat)
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] *= x
    out[1] *= x
    out[2] *= x
    out[3] *= x
    out[4] *= y
    out[5] *= y
    out[6] *= y
    out[7] *= y
    out[8] *= z
    out[9] *= z
    out[10] *= z
    out[11] *= z
    return out
  }

  static rotateX (mat, angle, result) {
    const sin = Math.sin(angle),
      cos = Math.cos(angle),
      a10 = mat[4],
      a11 = mat[5],
      a12 = mat[6],
      a13 = mat[7],
      a20 = mat[8],
      a21 = mat[9],
      a22 = mat[10],
      a23 = mat[11]

    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[4] = a10 * cos + a20 * sin
    out[5] = a11 * cos + a21 * sin
    out[6] = a12 * cos + a22 * sin
    out[7] = a13 * cos + a23 * sin
    out[8] = a20 * cos - a10 * sin
    out[9] = a21 * cos - a11 * sin
    out[10] = a22 * cos - a12 * sin
    out[11] = a23 * cos - a13 * sin
    return out
  }

  static rotateY (mat, angle, result) {
    const sin = Math.sin(angle),
      cos = Math.cos(angle),
      a00 = mat[0],
      a01 = mat[1],
      a02 = mat[2],
      a03 = mat[3],
      a20 = mat[8],
      a21 = mat[9],
      a22 = mat[10],
      a23 = mat[11]

    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] = a00 * cos - a20 * sin
    out[1] = a01 * cos - a21 * sin
    out[2] = a02 * cos - a22 * sin
    out[3] = a03 * cos - a23 * sin
    out[8] = a00 * sin + a20 * cos
    out[9] = a01 * sin + a21 * cos
    out[10] = a02 * sin + a22 * cos
    out[11] = a03 * sin + a23 * cos
    return out
  }

  static rotateZ (mat, angle, result) {
    const sin = Math.sin(angle),
      cos  = Math.cos(angle),
      a00 = mat[0],
      a01 = mat[1],
      a02 = mat[2],
      a03 = mat[3],
      a10 = mat[4],
      a11 = mat[5],
      a12 = mat[6],
      a13 = mat[7]

    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] = a00 * cos + a10 * sin
    out[1] = a01 * cos + a11 * sin
    out[2] = a02 * cos + a12 * sin
    out[3] = a03 * cos + a13 * sin
    out[4] = a10 * cos - a00 * sin
    out[5] = a11 * cos - a01 * sin
    out[6] = a12 * cos - a02 * sin
    out[7] = a13 * cos - a03 * sin
    return out
  }

  static perspective (result, fieldOfView, aspect, near, far) {
    const f = 1.0 / Math.tan(fieldOfView / 2),
      nf = 1 / (near - far)
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] = f / aspect
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = f
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = (far + near) * nf
    out[11] = -1
    out[12] = 0
    out[13] = 0
    out[14] = (2 * far * near) * nf
    out[15] = 0
    return out
  }

  static multiplyWithVector (mat, vec, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }

    const [x, y, z] = vec // w = 1

    out[0] = x * mat[0] + y * mat[1] + z * mat[2] + mat[3]
    out[1] = x * mat[4] + y * mat[5] + z * mat[6] + mat[7]
    out[2] = x * mat[8] + y * mat[9] + z * mat[10] + mat[11]
    out[3] = x * mat[12] + y * mat[13] + z * mat[14] + mat[15]

    return out
  }

}

},{"./vec3.js":18}],14:[function(require,module,exports){
module.exports = {
  degToRad (deg) {
    return deg * 2 * Math.PI / 180
  }
}

},{}],15:[function(require,module,exports){
module.exports = class Model {

  constructor () {
    this.vertices = new Float32Array()
    this.numberOfVertices = 0
    this.indices = new Uint16Array()
    this.numberOfIndices = 0
  }

  setVertices (data, number) {
    this.vertices = new Float32Array(data)
    this.numberOfVertices = number
  }

  setIndices (data, number) {
    this.indices = new Uint16Array(data)
    this.numberOfIndices = number
  }

}

},{}],16:[function(require,module,exports){
const Model = require('./model.js')

const vertices = []
const indices = []

let latitude = 0
let longitude = 0

const MAX_LATITUDE = 10
const MAX_LONGITUDE = 10

for (latitude = 0; latitude <= MAX_LATITUDE; latitude += 1) {
  const angle1 = latitude * Math.PI / MAX_LATITUDE
  const sin1 = Math.sin(angle1)
  const cos1 = Math.cos(angle1)

  for (longitude = 0; longitude <= MAX_LONGITUDE; longitude += 1) {
    const angle2 = longitude * 2 * Math.PI / MAX_LONGITUDE
    const sin2 = Math.sin(angle2)
    const cos2 = Math.cos(angle2)

    const x = sin1 * cos2
    const y = cos1
    const z = sin1 * sin2

    vertices.push(x)
    vertices.push(y)
    vertices.push(z)
  }
}

// this second loop is necessary because we don't need the last item, so the condition is '<', rather than '<='!
for (latitude = 0; latitude < MAX_LATITUDE; latitude += 1) {
  for (longitude = 0; longitude < MAX_LONGITUDE; longitude += 1) {
    const first = (latitude * (MAX_LONGITUDE + 1)) + longitude
    const second = first + MAX_LONGITUDE + 1
    indices.push(first)
    indices.push(second)
    indices.push(first + 1)

    indices.push(second)
    indices.push(second + 1)
    indices.push(first + 1)
  }
}

module.exports = class Sphere extends Model {

  constructor () {
    super()
    this.setVertices(vertices, vertices.length / 3)
    this.setIndices(indices, indices.length)
  }

}

},{"./model.js":15}],17:[function(require,module,exports){
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

},{}],18:[function(require,module,exports){
module.exports = class Vec3 {

  static create (x, y, z) {
    const newVector = new Float32Array(4)
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

  static rotateX (a, angle, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const [x, y, z] = a
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    out[0] = x
    out[1] = y * cos - z * sin
    out[2] = y * sin + z * cos
    return out
  }

  static rotateY (a, angle, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const [x, y, z] = a
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    out[0] = x * cos + z * sin
    out[1] = y
    out[2] = z * cos - x * sin
    return out
  }

  static rotateZ (a, angle, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const [x, y, z] = a
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    out[0] = x * cos - y * sin
    out[1] = x * sin + y * cos
    out[2] = z
    return out
  }

}

},{}],19:[function(require,module,exports){
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

},{"../animation/animation.js":1,"../content/body.js":9,"../content/content.js":10,"../ui/ui.js":29}],20:[function(require,module,exports){
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

},{"../animation/animation.js":1,"../content/content.js":10,"../ui/ui.js":29}],21:[function(require,module,exports){
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

},{"../../serialization/deserializer.js":19,"./dialog.js":22}],22:[function(require,module,exports){
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

},{"../../animation/animation.js":1,"../../ui/ui.js":29}],23:[function(require,module,exports){
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

},{"./deserialize-dialog.js":21,"./new-object-dialog.js":24,"./object-dialog.js":25,"./settings-dialog.js":26}],24:[function(require,module,exports){
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

},{"../../animation/animation.js":1,"../../animation/color.js":3,"../../content/body.js":9,"../../content/content.js":10,"../../content/vec3.js":18,"./dialog.js":22}],25:[function(require,module,exports){
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

},{"../../animation/animation.js":1,"../../animation/color.js":3,"../../content/content.js":10,"../../ui/ui.js":29,"./dialog.js":22}],26:[function(require,module,exports){
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

},{"../../animation/animation.js":1,"../../content/content.js":10,"../../ui/ui.js":29,"./dialog.js":22}],27:[function(require,module,exports){
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

},{"../animation/animation.js":1,"../astrosim.js":8,"../content/content.js":10,"../serialization/serializer.js":20,"../ui/ui.js":29}],28:[function(require,module,exports){
const EventEmitter = require('../content/event-emitter.js')

module.exports = class Keyboard extends EventEmitter {

  constructor () {
    super()

    this.pressedKeys = {}

    document.addEventListener('keydown', (e) => {
      this.pressedKeys[e.key] = true
    })

    document.addEventListener('keyup', (e) => {
      this.pressedKeys[e.key] = false
      this.emit(e.key, e)
    })
  }

  isKeyPressed (key) {
    return !!this.pressedKeys[key]
  }

}

},{"../content/event-emitter.js":12}],29:[function(require,module,exports){
const ASTRO = require('../astrosim.js')
const {mainLoop} = ASTRO
const content = require('../content/content.js')
const Body = require('../content/body.js')
const animation = require('../animation/animation.js')
const Keyboard = require('./keyboard.js')

const ui = module.exports = ASTRO.ui = {

  selectedObject: null,
  isPlaying: true,

  dialogs: require('./dialogs/init-dialogs.js'),
  keyboard: new Keyboard(),

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

},{"../animation/animation.js":1,"../astrosim.js":8,"../content/body.js":9,"../content/content.js":10,"./dialogs/init-dialogs.js":23,"./event-listeners.js":27,"./keyboard.js":28}]},{},[8]);
