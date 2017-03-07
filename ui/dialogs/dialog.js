const animation = require('../../animation/animation.js')
const dialogManager = require('./dialog-manager.js')
const EventEmitter = require('../../content/event-emitter.js')
const ui = require('../../ui/ui.js')

module.exports = class Dialog extends EventEmitter {
  constructor (element) {
    super()
    this.element = element
    element.classList.add('dialog-closed')
    element.classList.add('dialog')
    this.opened = false

    this.inputs = {}
    this.invalidInputs = {}
    this.valid = true
  }
  registerInput () {
    let index
    for (index in arguments) {
      const input = arguments[index]
      this.inputs[input.name] = input
    }
  }
  set (values) {
    let index
    const {inputs} = this
    for (index in inputs) {
      const input = inputs[index]
      if (values[index]) {
        input.value = values[index]
      }
    }
  }
  validate () {
    let valid = true
    const invalid = this.invalidInputs = []
    let inputValid = true

    let index
    const {inputs} = this
    for (index in inputs) {
      const input = inputs[index]

      if (typeof input.checkValidity === 'function') {
        inputValid = input.checkValidity()
      } else {
        const filter = input.filterFunction || this.defaultFilterFunction
        inputValid = !!filter(input, input.value, index)
        if (!inputValid) {
          invalid.push(input)
          input.classList.add('dialog-input-invalid')
        } else {
          input.classList.remove('dialog-input-invalid')
        }
      }
      valid = valid && inputValid
    }

    return valid
  }
  getInputByName (name) {
    return this.inputs[name] || null
  }
  setFilterFunction (input, filter) {
    input.filterFunction = filter
  }
  defaultFilterFunction () {
    return true
  }
  open () {
    if (dialogManager.openDialog) {
      return
    }

    this.element.classList.add('dialog-open')
    this.element.classList.remove('dialog-closed')
    this.opened = true
    dialogManager.openDialog = this

    animation.pause()
    this.emit('open')
  }
  show () {
    this.element.classList.add('dialog-open')
    this.element.classList.remove('dialog-closed')
  }
  hide () {
    this.element.classList.remove('dialog-open')
    this.element.classList.add('dialog-closed')
  }
  close () {
    this.element.classList.remove('dialog-open')
    this.element.classList.add('dialog-closed')
    this.opened = false

    dialogManager.openDialog = null

    this.emit('close')

    if (ui.isPlaying) {
      animation.unpause()
    }
  }
  submit () {
    if (this.validate()) {
      this.emit('submit')
      this.close()
    }
  }
  static greaterThanZero (input, value) {
    let floatValue = Number(value)
    return floatValue > 0
  }
}
