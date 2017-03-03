const MultiUnitInput = require('./multi-unit-input.js')

module.exports = class VelocityInput extends MultiUnitInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue, 'm/s', 1)
    this.addUnit('km/h', 1/3.6)
    this.addUnit('c',  2.99792458e8)
  }

}
