const MultiUnitInput = require('./multi-unit-input.js')

module.exports = class MassInput extends MultiUnitInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue, 'kg', 1)
    this.addUnit('solar mass', 1.98855e30)
    this.buttons['solar mass'].innerHTML = 'M<span class="sub">\u2609</span>'
  }

  checkValidity () {
    const valid = this.value > 0
    if (valid) {
      this._inputElement.classList.remove('dialog-input-invalid')
    } else {
      this._inputElement.classList.add('dialog-input-invalid')
    }
    return valid
  }

}
