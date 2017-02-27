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
