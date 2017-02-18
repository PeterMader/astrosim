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

  ticks: 0,
  realTime: 0,
  pendingTicks: 0,
  TICKS_PER_FRAME: 10,

  SECONDS_IN_YEAR: 31556927, // a year has 31,556,927
  TIME_FACTOR: 1, // the factor the time passed is multiplied by

  temp1: Vec2.create(),
  temp2: Vec2.create(),
  temp3: Vec2.create(),

  forceHistories: {},
  distanceHistories: {},

  initialize () {
    this.TIME_FACTOR = this.SECONDS_IN_YEAR / 12 // initial factor: 1s in simulation equals 1 month
  },

  // saves all the objects passed to it and displays them
  add () {
    const {objects} = this
    let index
    for (index in arguments) {
      const object = arguments[index]
      objects.push(object)
      object.id = this.currentId += 1

      this.forceHistories[object.id] = objects.map((item) => {
        return new History()
      })
      this.distanceHistories[object.id] = new History()
    }
    ASTRO.ui.update()
  },

  // removes an object from the object list
  remove (item) {
    const {objects} = this
    objects.splice(objects.indexOf(item), 1)
  },

  // calls the 'update' method of all the objects
  update (deltaTime) {
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
      return Vec2.add(acc, Vec2.scale(obj.velocity, obj.mass))
    }, Vec2.create())
  },

  // calculates the velocity of the system
  velocity () {
    return Vec2.scale(this.momentum(), 1 / this.objects.reduce((acc, obj) => acc + obj.mass, 0))
  }
}
