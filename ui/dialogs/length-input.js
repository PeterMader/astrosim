const MultiUnitInput = require('./multi-unit-input.js')

module.exports = class LengthInput extends MultiUnitInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue, 'm', 1, 'meter')
    this.addUnit('AU',  1.495978707e11, 'astronomical unit')
    this.addUnit('ly',  9.4607e15, 'light year')
    this.addUnit('pc', 3.0857e16, 'parsec')
  }

}
