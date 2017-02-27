module.exports = class Vec3 {

  static create (x, y, z) {
    const newVector = new Float32Array(4)
    newVector[0] = x || 0
    newVector[1] = y || 0
    newVector[2] = z || 0

    return newVector
  }

  static copy (a, result) {
    let out = result
    if (!out) {
      out = Vec3.create(a[0], a[1], a[2])
    } else {
      out[0] = a[0]
      out[1] = a[1]
      out[2] = a[2]
    }
    return out
  }

  static weighedCenter (a, w1, b, w2, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const factor = w2 / (w1 + w2)
    out[0] = factor * ((b[0] - a[0]) || 1e-10) + a[0]
    out[1] = factor * ((b[1] - a[1]) || 1e-10) + a[1]
    out[2] = factor * ((b[2] - a[2]) || 1e-10) + a[2]
    return out
  }

  static add (a, b, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    out[0] = a[0] + b[0]
    out[1] = a[1] + b[1]
    out[2] = a[2] + b[2]
    return out
  }

  static subtract (a, b, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    out[0] = a[0] - b[0]
    out[1] = a[1] - b[1]
    out[2] = a[2] - b[2]
    return out
  }

  static getLength (a) {
    return Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2])
  }

  static normalize (a, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    let length = Vec3.getLength(a)
    out[0] = a[0] / length
    out[1] = a[1] / length
    out[2] = a[2] / length
    return out
  }

  static scale (a, scalar, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    out[0] = a[0] * scalar
    out[1] = a[1] * scalar
    out[2] = a[2] * scalar
    return out
  }

  static rotateX (a, angle, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const [x, y, z] = a
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    out[0] = x
    out[1] = y * cos - z * sin
    out[2] = y * sin + z * cos
    return out
  }

  static rotateY (a, angle, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const [x, y, z] = a
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    out[0] = x * cos + z * sin
    out[1] = y
    out[2] = z * cos - x * sin
    return out
  }

  static rotateZ (a, angle, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }
    const [x, y, z] = a
    const sin = Math.sin(angle)
    const cos = Math.cos(angle)
    out[0] = x * cos - y * sin
    out[1] = x * sin + y * cos
    out[2] = z
    return out
  }

}
