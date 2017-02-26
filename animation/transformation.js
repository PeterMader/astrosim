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
