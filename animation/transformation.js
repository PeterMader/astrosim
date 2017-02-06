const animation = require('./animation.js')
const Vec2 = require('../content/vec2.js')

animation.center = function (pos) {
  Vec2.scale(pos, -this.ratio, this.translation)
}

animation.translate = function (x, y) {
  animation.translation[0] -= x
  animation.translation[1] -= y

  animation.shouldRender = true
}

animation.scale = function (factor, centerX, centerY) {
  const newRatio = animation.ratio * factor

  if (newRatio < animation.MIN_SCALING) {
    return
  }

  if (newRatio > animation.MAX_SCALING) {
    return
  }

  animation.ratio = newRatio

  // zoom center point
  const pX = ((centerX || 0) - animation.translation[0]) / animation.width
  const pY = ((centerY || 0) - animation.translation[1]) / animation.height

  // update dimensions
  animation.width = canvas.width * newRatio
  animation.height = canvas.height * newRatio

  // translate view back to center point
  const x = animation.width * pX - centerX
  const y = animation.height * pY - centerY

  animation.translation[0] = -x
  animation.translation[1] = -y

  animation.shouldRender = true
}
