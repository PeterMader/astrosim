module.exports = class MultiUnitInput {

  constructor (wrapperElement, name, initialValue, initialUnit, initialRatio, initialTitle) {
    this.units = {}
    this.buttons = {}
    this._unit = initialUnit

    this.wrapperElement = wrapperElement
    const input = this._inputElement = document.createElement('input')
    this.name = input.name = name
    wrapperElement.appendChild(input)

    this.addUnit(initialUnit, initialRatio, initialTitle)
    this.value = initialValue
    this.setUnit(initialUnit)
  }

  get value () {
    return Number(this._inputElement.value) * this.units[this._unit]
  }

  set value (newVal) {
    this._inputElement.value = (newVal / this.units[this._unit]).toExponential(3)
  }

  addUnit (name, ratio, title) {
    this.units[name] = ratio

    const pushButton = document.createElement('button')
    pushButton.textContent = name
    pushButton.classList.add('unit-push-button')
    pushButton.addEventListener('click', this.setUnit.bind(this, name))
    if (title) {
      pushButton.title = title
    }
    this.buttons[name] = pushButton
    this.wrapperElement.appendChild(pushButton)
  }

  checkValidity () {
    return true
  }

  setUnit (name) {
    const ratio = this.units[name]

    const value = this.value
    this.buttons[this._unit].classList.remove('pushed')
    this._unit = name
    this.buttons[name].classList.add('pushed')
    this.value = value
  }

}
