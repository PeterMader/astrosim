module.exports = `
precision mediump float;

uniform mat4 uModelMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uViewMatrix;

uniform vec3 uPosition;
uniform float uRadius;

void main(void) {
  vec4 pos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(uPosition, 1.0);
  vec3 plusRadius = vec3(uPosition);
  plusRadius.x = plusRadius.x + uRadius;
  vec4 pos2 = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(plusRadius, 1.0);
  gl_Position = pos;
  gl_PointSize = 10.0 * uRadius / pos2.z + 10.0;
}
`
