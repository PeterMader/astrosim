module.exports = `
precision mediump float;

uniform vec3 uObjectColor;
uniform float uRadius;

void main(void) {
  vec2 cxy = 2.0 * gl_PointCoord - 1.0;
  float r = dot(cxy, cxy);
  if (r > 1.0) {
    discard;
  }
  gl_FragColor = vec4(uObjectColor, 1.0);
}
`
