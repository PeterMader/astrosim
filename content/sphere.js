const Model = require('./model.js')

const vertices = []
const indices = []

let latitude = 0
let longitude = 0

const MAX_LATITUDE = 10
const MAX_LONGITUDE = 10

for (latitude = 0; latitude <= MAX_LATITUDE; latitude += 1) {
  const angle1 = latitude * Math.PI / MAX_LATITUDE
  const sin1 = Math.sin(angle1)
  const cos1 = Math.cos(angle1)

  for (longitude = 0; longitude <= MAX_LONGITUDE; longitude += 1) {
    const angle2 = longitude * 2 * Math.PI / MAX_LONGITUDE
    const sin2 = Math.sin(angle2)
    const cos2 = Math.cos(angle2)

    const x = sin1 * cos2
    const y = cos1
    const z = sin1 * sin2

    vertices.push(x)
    vertices.push(y)
    vertices.push(z)
  }
}

// this second loop is necessary because we don't need the last item, so the condition is '<', rather than '<='!
for (latitude = 0; latitude < MAX_LATITUDE; latitude += 1) {
  for (longitude = 0; longitude < MAX_LONGITUDE; longitude += 1) {
    const first = (latitude * (MAX_LONGITUDE + 1)) + longitude
    const second = first + MAX_LONGITUDE + 1
    indices.push(first)
    indices.push(second)
    indices.push(first + 1)

    indices.push(second)
    indices.push(second + 1)
    indices.push(first + 1)
  }
}

module.exports = class Sphere extends Model {

  constructor () {
    super()
    this.setVertices(vertices, vertices.length / 3)
    this.setIndices(indices, indices.length)
  }

}
