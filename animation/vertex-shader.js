module.exports = `
precision mediump float;

attribute vec3 aVertexPosition;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

void main(void) {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aVertexPosition, 1.0);
}
`
