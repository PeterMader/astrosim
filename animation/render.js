const content = require('../content/content.js')
const animation = require('./animation.js')
const Body = require('../content/body.js')
const ui = require('../ui/ui.js')
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

animation.renderControls = function () {
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
  ctx.textAlign = 'center'
  ctx.fillText(width, canvas.width - unit / 2 - 20, canvas.height - 40)

  // draw the time stats
  ctx.textAlign = 'right'
  ctx.fillText(`Simulated time: ${content.simulatedTime.toExponential(1)}s`, canvas.width - 20, 20)
  ctx.fillText(`Real time: ${Math.round(content.realTime).toString()}s`, canvas.width - 20, 40)
}

animation.render = function () {
  const {ctx, canvas} = this
  const {objects} = content

  // clear the canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  if (ui.selectedObjects.length > 0) {
    // center the canvas at the selected object's center
    this.center(Vec2.scale(Vec2.center(ui.selectedObjects.map((object) => object.position), content.temp1), 1 / content.METERS_PER_PIXEL, content.temp1))
  }

  if (objects.length > 0) {
    canvasCenter = content.temp1
    canvasCenter[0] = canvas.width / 2
    canvasCenter[1] = canvas.height / 2
    const pos = content.temp2
    const offsetX = this.translation[0] + canvasCenter[0]
    const offsetY = this.translation[1] + canvasCenter[1]
    const factor = this.ratio / content.METERS_PER_PIXEL

    let index
    // walk over each object and draw it
    for (index in objects) {
      const object = objects[index]
      Vec2.scale(object.position, factor, pos)
      pos[0] += offsetX
      pos[1] += offsetY

      // calculate the circle's radius
      const radius = object.radius * this.ratio / content.METERS_PER_PIXEL
      const color = object.color.hexString()
      this.drawCircle(pos[0], pos[1], Math.max(radius, 3), color)

      if (animation.drawLabels) {
        ctx.textAlign = 'left'
        ctx.fillText(object.name, pos[0] + radius + 3, pos[1])
      }

      if (animation.drawHistory) {
        // draw the object's trace
        ctx.beginPath()
        ctx.strokeStyle = color
        let i
        const {history} = object
        if (object.historyOverflow) {
          // start at the index
          const length = history.length
          ctx.moveTo(history[object.historyIndex] * factor + offsetX, history[object.historyIndex + 1] * factor + offsetY)
          for (i = object.historyIndex + 2; i < length; i += 2) {
            ctx.lineTo(history[i] * factor + offsetX, history[i + 1] * factor + offsetY)
          }
          for (i = 0; i < object.historyIndex; i += 2) {
            ctx.lineTo(history[i] * factor + offsetX, history[i + 1] * factor + offsetY)
          }
        } else {
          // start at start
          ctx.moveTo(history[0] * factor + offsetX, history[1] * factor + offsetY)
          for (i = 2; i < object.historyIndex; i += 2) {
            ctx.lineTo(history[i] * factor + offsetX, history[i + 1] * factor + offsetY)
          }
        }
        ctx.lineTo(pos[0], pos[1])
        ctx.stroke()
      }
    }
  }

  if (animation.dragging) {
    if (animation.draggingCenter) {
      const [x, y] = animation.draggingPosition
      ctx.strokeStyle = animation.draggingColor
      ctx.beginPath()
      ctx.moveTo(x, y - 10)
      ctx.lineTo(x, y + 10)
      ctx.moveTo(x - 10, y)
      ctx.lineTo(x + 10, y)
      ctx.stroke()
    } else {
      // draw the circle as if the object was there
      const pos = animation.draggingPosition
      const radius = animation.draggingRadius * this.ratio / content.METERS_PER_PIXEL
      const color = animation.draggingColor
      this.drawCircle(pos[0], pos[1], Math.max(radius, 3), color)
    }
  }

  if (animation.drawControls) {
    this.renderControls()
  }
}
