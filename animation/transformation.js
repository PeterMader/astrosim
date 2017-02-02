ASTRO.animation.center = function (pos) {
  Vec2.scale(pos, -this.ratio, this.translation)
}

ASTRO.animation.translate = function (x, y) {
  this.translation[0] -= x
  this.translation[1] -= y

  ASTRO.animation.shouldRender = true
}

ASTRO.animation.scale = function (factor, centerX, centerY) {
  const newRatio = this.ratio * factor

  if (newRatio < this.MIN_SCALING) {
    return
  }

  if (newRatio > this.MAX_SCALING) {
    return
  }

  this.ratio = newRatio

  // zoom center point
  const pX = ((centerX || 0) - this.translation[0]) / this.width
  const pY = ((centerY || 0) - this.translation[1]) / this.height

  // update dimensions
  this.width = canvas.width * newRatio
  this.height = canvas.height * newRatio

  // translate view back to center point
  const x = this.width * pX - centerX
  const y = this.height * pY - centerY

  this.translation[0] = -x
  this.translation[1] = -y

  ASTRO.animation.shouldRender = true
}
