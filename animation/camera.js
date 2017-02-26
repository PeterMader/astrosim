const Mat4 = require('../content/mat4.js')
const Vec3 = require('../content/vec3.js')

module.exports = class Camera {

  constructor () {
    this.matrix = Mat4.identity()
    this.position = Vec3.create(0, 0, 0)
    this.upwards = Vec3.create(0, 0, 1)
    this.rotationX = 0
    this.rotationY = 0
    this.rotationZ = 0
    this.rotateY(0)
  }

  updateMatrix () {
    const pos = this.position
    Mat4.identity(this.matrix)
    Mat4.rotateX(this.matrix, this.rotationX, this.matrix)
    Mat4.rotateY(this.matrix, this.rotationY, this.matrix)
    Mat4.rotateZ(this.matrix, this.rotationZ, this.matrix)
    Mat4.translate(this.matrix, [-pos[0], -pos[1], -pos[2]], this.matrix)
  }

  moveForward (distance) {
    this.position[0] -= Math.sin(-this.rotationY) * distance
    this.position[2] -= Math.cos(-this.rotationY) * distance
  }

  moveLeft (distance) {
    this.position[0] -= Math.sin(-this.rotationY - Math.PI / 2) * distance
    this.position[2] -= Math.cos(-this.rotationY - Math.PI / 2) * distance
  }

  rotateY (angle) {
    this.rotationY += angle
  }

  rotateX (angle) {
    this.rotationX += angle
  }

}
