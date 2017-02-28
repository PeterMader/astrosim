module.exports = class EventEmitter {

  constructor () {
    this._events = []
  }

  on (channel, callback) {
    const events = this._events
    if (Array.isArray(events[channel])) {
      events[channel].push(callback)
    } else {
      events[channel] = [callback]
    }
    return this
  }

  once (channel, callback) {
    const events = this._events
    const func = function () {
      callback.apply(self, Array.prototype.slice.call(arguments))
      events[channel].splice([events[channel].indexOf(func)], 1)
    }
    if (Array.isArray(events[channel])) {
      events[channel].push(func)
    } else {
      events[channel] = [func]
    }
    return this
  }

  emit (channel) {
    const events = this._events
    const args = Array.prototype.slice.call(arguments, 1)
    if (Array.isArray(events[channel])) {
      events[channel].forEach((cb) => {
        cb.apply(self, args)
      })
    }
  }

}
