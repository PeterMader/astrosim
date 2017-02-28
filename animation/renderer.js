// const vertexShaderCode = require('./vertex-shader.js')
// const fragmentShaderCode = require('./fragment-shader.js')
const content = require('../content/content.js')
const animation = require('./animation.js')
const Mat4 = require('../content/mat4.js')
const Vec3 = require('../content/vec3.js')

const Renderer = module.exports = class {

  constructor (canvas) {
    if (!canvas) {
      return
    }

    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
  }

  prepareObject (object) {}

  project (objectPosition, camera, canvas, result) {
    Vec3.subtract(objectPosition, camera.position, result)
    Vec3.rotateX(result, camera.rotationX, result)
    Vec3.rotateY(result, camera.rotationY, result)
    Vec3.rotateZ(result, camera.rotationZ, result)

    if (result[2] > 0) {
      result[0] = result[1] = -1
      return
    }

    result[0] /= -result[2] / 2
    result[1] /= -result[2] / 2

    const factor = Math.min(canvas.width, canvas.height)

    result[0] *= factor / 2
    result[0] += canvas.width / 2
    result[1] *= factor / 2
    result[1] += canvas.height / 2
  }

  drawCircle (x, y, radius, color) {
    const {ctx} = this
    ctx.fillStyle = color

    // draw the circle shape and fill it
    ctx.beginPath()
    ctx.moveTo(x, y - radius)
    ctx.arc(x, y, radius, 0, Math.PI * 2, true)
    ctx.fill()
  }

  render (camera) {
    const {canvas, ctx} = this
    const {objects} = content

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const FIELD_OF_VIEW = 45
    const distanceToPlane = 1 / Math.tan(FIELD_OF_VIEW / 2)

    const ratio = canvas.width / canvas.height

    const objectPositions = objects.map((object, index) => {
      const pos = Vec3.create()
      // calculate the 2d position
      this.project(object.position, camera, canvas, pos)
      pos.itemIndex = index
      return pos
    })

    const objectsInOrder = objectPositions.sort((a, b) => a[2] > b[2] ? 1 : a[2] === b[2] ? 0 : -1)

    let index
    for (index in objectsInOrder) {
      // draw a single item
      const pos = objectsInOrder[index]
      const item = objects[pos.itemIndex]
      const radius = item.radius * canvas.width / 2 / -pos[2]

      if (pos[2] > 0) {
        continue
      }

      this.drawCircle(pos[0], pos[1], radius, item.color.hexString())
    }

    const vertices = [
      [0, 0, 5, 'blue'],
      [0, 0, -.1],
      [0, 5, 0, 'green'],
      [0, -.1, 0],
      [5, 0, 0, 'red'],
      [-.1, 0, 0]
    ]
    const zeroPos = []
    this.project([0, 0, 0], camera, canvas, zeroPos)
    const [zeroX, zeroY] = zeroPos

    vertices.map((vert) => {
      ctx.beginPath()
      ctx.moveTo(zeroX, zeroY)
      const pos = []
      this.project(vert, camera, canvas, pos)
      ctx.lineTo(pos[0], pos[1])
      ctx.moveTo(zeroX, zeroY)
      if (vert[3]) {
        ctx.strokeStyle = vert[3]
      }
      ctx.closePath()
      ctx.stroke()
      this.drawCircle(pos[0], pos[1], 3, ctx.strokeStyle)
    })

  }

}
