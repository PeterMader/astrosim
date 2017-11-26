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
      if (!this.interact(body, objects, index, deltaTime)) {
        return
      }
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
    if (length < this.radius + body.radius) {
      const newPosition = Vec2.weighedCenter(this.position, this.mass, body.position, body.mass, distance)
      const newRadius = Math.sqrt(this.radius * this.radius + body.radius * body.radius)
      const newBody = new Body(Vec2.copy(newPosition), this.mass + body.mass, newRadius, this.name + '+' + body.name)

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
      return false
    }

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
    return true
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
