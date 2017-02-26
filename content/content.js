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
