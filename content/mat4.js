const Vec3 = require('./vec3.js')

module.exports = class Mat4 {

  static create () {
    return new Float32Array(16)
  }

  static copy (src, dest) {
    if (!dest) {
      return new Float32Array(src)
    }
    let i
    for (i = 0; i < 16; i += 1) {
      dest[i] = src[i]
    }
    return dest
  }

  static identity (result) {
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    return Mat4.copy(new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]), out)
  }

  static multiply (a, b, result) {
    const [
      a00, a01, a02, a03,
      a10, a11, a12, a13,
      a20, a21, a22, a23,
      a30, a31, a32, a33
    ] = a

    let out = result
    if (!out) {
      out = Mat4.create()
    }

    let [b0, b1, b2, b3] = b
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[4]
    b1 = b[5]
    b2 = b[6]
    b3 = b[7]
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[8]
    b1 = b[9]
    b2 = b[10]
    b3 = b[11]
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33

    b0 = b[12]
    b1 = b[13]
    b2 = b[14]
    b3 = b[15]
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33
    return out
  }

  static translate (mat, vec, result) {
    const [x, y, z] = vec
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    Mat4.copy(mat, out)
    out[12] = mat[0] * x + mat[4] * y + mat[8] * z + mat[12]
    out[13] = mat[1] * x + mat[5] * y + mat[9] * z + mat[13]
    out[14] = mat[2] * x + mat[6] * y + mat[10] * z + mat[14]
    out[15] = mat[3] * x + mat[7] * y + mat[11] * z + mat[15]

    return out
  }

  static scale (mat, vec, result) {
    const [x, y, z] = vec
    const res = Mat4.copy(mat)
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] *= x
    out[1] *= x
    out[2] *= x
    out[3] *= x
    out[4] *= y
    out[5] *= y
    out[6] *= y
    out[7] *= y
    out[8] *= z
    out[9] *= z
    out[10] *= z
    out[11] *= z
    return out
  }

  static rotateX (mat, angle, result) {
    const sin = Math.sin(angle),
      cos = Math.cos(angle),
      a10 = mat[4],
      a11 = mat[5],
      a12 = mat[6],
      a13 = mat[7],
      a20 = mat[8],
      a21 = mat[9],
      a22 = mat[10],
      a23 = mat[11]

    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[4] = a10 * cos + a20 * sin
    out[5] = a11 * cos + a21 * sin
    out[6] = a12 * cos + a22 * sin
    out[7] = a13 * cos + a23 * sin
    out[8] = a20 * cos - a10 * sin
    out[9] = a21 * cos - a11 * sin
    out[10] = a22 * cos - a12 * sin
    out[11] = a23 * cos - a13 * sin
    return out
  }

  static rotateY (mat, angle, result) {
    const sin = Math.sin(angle),
      cos = Math.cos(angle),
      a00 = mat[0],
      a01 = mat[1],
      a02 = mat[2],
      a03 = mat[3],
      a20 = mat[8],
      a21 = mat[9],
      a22 = mat[10],
      a23 = mat[11]

    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] = a00 * cos - a20 * sin
    out[1] = a01 * cos - a21 * sin
    out[2] = a02 * cos - a22 * sin
    out[3] = a03 * cos - a23 * sin
    out[8] = a00 * sin + a20 * cos
    out[9] = a01 * sin + a21 * cos
    out[10] = a02 * sin + a22 * cos
    out[11] = a03 * sin + a23 * cos
    return out
  }

  static rotateZ (mat, angle, result) {
    const sin = Math.sin(angle),
      cos  = Math.cos(angle),
      a00 = mat[0],
      a01 = mat[1],
      a02 = mat[2],
      a03 = mat[3],
      a10 = mat[4],
      a11 = mat[5],
      a12 = mat[6],
      a13 = mat[7]

    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] = a00 * cos + a10 * sin
    out[1] = a01 * cos + a11 * sin
    out[2] = a02 * cos + a12 * sin
    out[3] = a03 * cos + a13 * sin
    out[4] = a10 * cos - a00 * sin
    out[5] = a11 * cos - a01 * sin
    out[6] = a12 * cos - a02 * sin
    out[7] = a13 * cos - a03 * sin
    return out
  }

  static perspective (result, fieldOfView, aspect, near, far) {
    const f = 1.0 / Math.tan(fieldOfView / 2),
      nf = 1 / (near - far)
    let out = result
    if (!out) {
      out = Mat4.create()
    }
    out[0] = f / aspect
    out[1] = 0
    out[2] = 0
    out[3] = 0
    out[4] = 0
    out[5] = f
    out[6] = 0
    out[7] = 0
    out[8] = 0
    out[9] = 0
    out[10] = (far + near) * nf
    out[11] = -1
    out[12] = 0
    out[13] = 0
    out[14] = (2 * far * near) * nf
    out[15] = 0
    return out
  }

  static multiplyWithVector (mat, vec, result) {
    let out = result
    if (!out) {
      out = Vec3.create()
    }

    const [x, y, z] = vec // w = 1

    out[0] = x * mat[0] + y * mat[1] + z * mat[2] + mat[3]
    out[1] = x * mat[4] + y * mat[5] + z * mat[6] + mat[7]
    out[2] = x * mat[8] + y * mat[9] + z * mat[10] + mat[11]
    out[3] = x * mat[12] + y * mat[13] + z * mat[14] + mat[15]

    return out
  }

}
