const LengthInput = require('./length-input.js')

module.exports = class UnsignedLengthInput extends LengthInput {

  constructor (wrapperElement, name, initialValue) {
    super(wrapperElement, name, initialValue)
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
