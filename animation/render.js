const content = require('../content/content.js')
const animation = require('./animation.js')
const Body = require('../content/body.js')
const Vec2 = require('../content/vec2.js')

animation.drawCircle = function (x, y, radius, color) {
  const {ctx} = this
  ctx.fillStyle = color

  // draw the circle shape and fill it
  ctx.beginPath()
  ctx.moveTo(x, y - radius)

  ctx.arc(x, y, radius, 0, Math.PI * 2, true)
  ctx.fill()
}

animation.drawControls = function () {
  const {translation, ratio, canvas, ctx} = this

  // draw the center point
  const x = translation[0] + canvas.width / 2
  const y = translation[1] + canvas.height / 2
  ctx.strokeStyle = '#FFFFFF'
  ctx.beginPath()
  ctx.moveTo(x, y - 10)
  ctx.lineTo(x, y + 10)
  ctx.moveTo(x - 10, y)
  ctx.lineTo(x + 10, y)
  ctx.stroke()

  // draw the unit
  ctx.fillStyle = '#FFFFFF'
  const unit = 200
  const width = (unit * content.METERS_PER_PIXEL / this.ratio).toExponential(2)
  ctx.fillRect(canvas.width - unit - 20, canvas.height - 22, unit, 2)
  const metrics = ctx.measureText(width)
  ctx.fillText(width, canvas.width - unit / 2 - metrics.width / 2 - 20, canvas.height - 40)
}

animation.render = function () {
  const {ctx, canvas} = this
  const {objects} = content

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (this.selectedObject instanceof Body) {
    // center the canvas at the selected object's center
    this.center(Vec2.scale(this.selectedObject.position, 1 / content.METERS_PER_PIXEL), content.temp1)
  }

  if (objects.length > 0) {
    canvasCenter = content.temp1
    canvasCenter[0] = canvas.width / 2
    canvasCenter[1] = canvas.height / 2
    const pos = content.temp2

    let index
    // walk over each object and draw it
    for (index in objects) {
      const object = objects[index]
      Vec2.scale(object.position, this.ratio / content.METERS_PER_PIXEL, pos)
      Vec2.add(pos, this.translation, pos)
      Vec2.add(pos, canvasCenter, pos)

      // calculate the circle's radius
      let radius = object.radius * this.ratio
      this.drawCircle(pos[0], pos[1], Math.max(radius / content.METERS_PER_PIXEL, 3), object.color.hexString())
    }
  }

  // finally, draw the center cross and the measure unit
  this.drawControls()
}
