const History = module.exports = class {

  constructor () {
    this.average = 0
    this.min = 0
    this.max = 0
    this.count = 0
  }

  add (value) {
    if (value < this.min) {
      this.min = value
    }
    if (value > this.max) {
      this.max = value
    }
    this.average = (this.average * this.count + value) / (this.count += 1)
  }

}
