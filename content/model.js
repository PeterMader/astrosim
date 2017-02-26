module.exports = class Model {

  constructor () {
    this.vertices = new Float32Array()
    this.numberOfVertices = 0
    this.indices = new Uint16Array()
    this.numberOfIndices = 0
  }

  setVertices (data, number) {
    this.vertices = new Float32Array(data)
    this.numberOfVertices = number
  }

  setIndices (data, number) {
    this.indices = new Uint16Array(data)
    this.numberOfIndices = number
  }

}
