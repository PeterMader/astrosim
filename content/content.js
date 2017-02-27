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
