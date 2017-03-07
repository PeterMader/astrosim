const EventEmitter = require('../content/event-emitter.js')

module.exports = class Keyboard extends EventEmitter {

  constructor () {
    super()

    this.pressedKeys = {}

    document.addEventListener('keydown', (e) => {
      this.pressedKeys[e.key] = true
      this.emit('keydown', e)
    }, {passive: true})

    document.addEventListener('keyup', (e) => {
      this.pressedKeys[e.key] = false
      this.emit(e.key, e)
      this.emit('keyup', e)
    })
  }

  isKeyPressed (key) {
    return !!this.pressedKeys[key]
  }

}
