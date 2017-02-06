const Vec2 = require('./vec2.js')
const Color = require('../animation/color.js')
const {content} = require('../astrosim.js')
const ASTRO = require('../astrosim.js')

module.exports = class Body {
  constructor (position, mass, radius, name) {
    this.position = position
    this.velocity = Vec2.create()
    this.mass = mass || 0
    this.radius = radius
    this.color = new Color()
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
      color: this.color.hexString()
    }
  }

  move (deltaTime) {
    // move object by adding its velocity to its position
    this.position[0] += this.velocity[0] * deltaTime
    this.position[1] += this.velocity[1] * deltaTime
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
    let distance = Vec2.subtract(this.position, body.position, ASTRO.content.temp1)
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
      objects.splice(bodyIndex, 1)
      objects.splice(objects.indexOf(this), 1)

      // calculate the velocity and the color of the new object
      const thisMomentum = Vec2.scale(this.velocity, this.mass, ASTRO.content.temp2)
      const bodyMomentum = Vec2.scale(body.velocity, body.mass, ASTRO.content.temp3)
      Vec2.add(thisMomentum, bodyMomentum, newBody.velocity)
      Vec2.scale(newBody.velocity, 1 / newBody.mass, newBody.velocity)
      newBody.color = this.color.interpolate(body.color)

      // finally add the new object and show it in the UI
      ASTRO.content.add(newBody)
    } else {
      // calculate the gravity
      const force = ASTRO.content.temp2
      Vec2.scale(
        Vec2.normalize(distance, distance),
        deltaTime * ASTRO.content.GRAVITY_CONSTANT * (this.mass * body.mass) / (length * length),
        force
      )

      // move the bodies
      // body.applyForce(force)
      Vec2.scale(force, -1, force)
      this.applyForce(force)
    }
  }

  static fromSerialized (data) {
    if (!data) {
      return null
    }
    const newBody = new Body(Vec2.create(
      typeof data.positionX === 'number' ? data.positionX : 0,
      typeof data.positionY === 'number' ? data.positionY : 0
    ), typeof data.mass === 'number' ? data.mass : 1000, typeof data.radius === 'number' ? data.radius : 1000)
    newBody.color = Color.fromHexString(data.color)
    newBody.velocity[0] = typeof data.velocityX === 'number' ? data.velocityX : 0
    newBody.velocity[1] = typeof data.velocityY === 'number' ? data.velocityY : 0
    return newBody
  }
}