const vertexShaderCode = require('./vertex-shader.js')
const fragmentShaderCode = require('./fragment-shader.js')

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
    const shader = gl.createShader(shaderType)
    gl.shaderSource(shader, src)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log('Could not compile shader: ', gl.getShaderInfoLog(shader))
      return null
    }

    return shader
  }

  init () {
    this.gl = this.getWebGlContext(canvas)
    if (!this.gl) {
      return
    }

    const program = this.program = this.createProgram(vertexShaderCode, fragmentShaderCode)
    if (!program) {
      return
    }

    
  }

  createProgram (vertexShaderCode, fragmentShaderCode) {
    const {gl} = this

    // create the two shaders
    const vertexShader = this.createShader(vertexShaderCode, gl.VERTEX_SHADER)
    const fragmentShader = this.createShader(vertexShaderCode, gl.FRAGMENT_SHADER)

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

}
