const vertexShaderCode = require('./vertex-shader.js')
const fragmentShaderCode = require('./fragment-shader.js')
const content = require('../content/content.js')
const Mat4 = require('../content/mat4.js')
const Vec3 = require('../content/vec3.js')

const Renderer = module.exports = class {

  constructor (canvas) {
    if (!canvas) {
      return
    }

    this.canvas = canvas

    this.init()
  }

  getWebGlContext (canvas) {
    let gl
    try {
      // try to get the proper webgl context
      gl = canvas.getContext('webgl')
    } catch (e) {
      console.log('Could not create WebGl context; trying to create experimental WebGl context: ', e.getMessage())
      try {
        // try to get the experimental webgl context
        gl = canvas.getContext('experimental-webgl')
      } catch (e) {
        console.log('Could not create experimental WebGl context: ', e.getMessage())
      }
    }
    return gl
  }

  createShader (src, type) {
    const {gl} = this
    const shader = gl.createShader(type)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log('Could not compile shader: ', gl.getShaderInfoLog(shader))
      return null
    }

    return shader
  }

  init () {
    const gl = this.gl = this.getWebGlContext(canvas)
    if (!this.gl) {
      return
    }

    const program = this.program = this.createProgram(vertexShaderCode, fragmentShaderCode)
    if (!program) {
      return
    }

    gl.useProgram(program)

    program.projectionMatrixUniform = gl.getUniformLocation(program, 'uProjectionMatrix')
    program.viewMatrixUniform = gl.getUniformLocation(program, 'uViewMatrix')
    program.modelMatrixUniform = gl.getUniformLocation(program, 'uModelMatrix')

    program.objectPositionUniform = gl.getUniformLocation(program, 'uPosition')
    program.objectRadiusUniform = gl.getUniformLocation(program, 'uRadius')
    program.objectColorUniform = gl.getUniformLocation(program, 'uObjectColor')

    gl.clearColor(.3, .3, .4, 1.0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    // temp!!!
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
  }

  createBuffer (data, bufferType) {
    const {gl} = this
    const buffer = gl.createBuffer()
    gl.bindBuffer(bufferType, buffer)
    gl.bufferData(bufferType, data, gl.STATIC_DRAW)
    return buffer
  }

  createProgram (vertexShaderCode, fragmentShaderCode) {
    const {gl} = this

    // create the two shaders
    const vertexShader = this.createShader(vertexShaderCode, gl.VERTEX_SHADER)
    const fragmentShader = this.createShader(fragmentShaderCode, gl.FRAGMENT_SHADER)

    if (!vertexShader || !fragmentShader) {
      return null
    }

    const program = gl.createProgram()
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)

    gl.linkProgram(program)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log('Could not link shader program: ', gl.getProgramInfoLog(program))
      return null
    }

    return program
  }

  render (camera) {
    const {canvas, gl, program} = this
    const {objects} = content

    camera.updateMatrix()
    const view = Mat4.copy(camera.matrix)
    const projection = Mat4.create()
    Mat4.perspective(projection, 45, canvas.width / canvas.height, 0.1, 100)

    gl.viewport(0, 0, canvas.width, canvas.height)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    const model = Mat4.create()

    let index
    for (index in objects) {
      // draw a single item
      const item = objects[index]

      // calculate the model-view-matrix
      Mat4.identity(model)
      Mat4.translate(model, item.position, model)

      // set matrix uniforms
      gl.uniformMatrix4fv(program.projectionMatrixUniform, false, projection)
      gl.uniformMatrix4fv(program.viewMatrixUniform, false, view)
      gl.uniformMatrix4fv(program.modelMatrixUniform, false, model)

      gl.uniform3f(program.objectColorUniform, item.color.r / 255, item.color.g / 255, item.color.b / 255)
      gl.uniform3f(program.objectPositionUniform, item.position[0], item.position[1], item.position[2])
      gl.uniform1f(program.objectRadiusUniform, item.radius)
      gl.drawArrays(gl.POINTS, 0, 1)
    }

    Mat4.identity(model)
    gl.uniformMatrix4fv(program.projectionMatrixUniform, false, projection)
    gl.uniformMatrix4fv(program.viewMatrixUniform, false, view)
    gl.uniformMatrix4fv(program.modelMatrixUniform, false, model)

    gl.uniform3f(program.objectColorUniform, 1, 1, 1)
    gl.uniform3f(program.objectPositionUniform, 0, 0, 0)
    gl.uniform1f(program.objectRadiusUniform, 10)
    gl.drawArrays(gl.POINTS, 0, 1)
  }

}
