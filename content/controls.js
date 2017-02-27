const Model = require('./model.js')

module.exports = class Controls extends Model {

  constructor () {
    super()
    this.setVertices([
      0.0, 0.0, 0.0,
      1.0, 0.0, 0.0,

      0.0, 0.0, 0.0,
      0.0, 1.0, 0.0,

      0.0, 0.0, 0.0,
      0.0, 0.0, 1.0
    ], 6)
    this.setIndices([
      0, 1, 2, 3, 4, 5
    ], 6)
  }

}
