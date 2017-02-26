module.exports = `
precision mediump float;

uniform vec3 uObjectColor;

void main(void) {
  gl_FragColor = vec4(uObjectColor, 1.0);
}

`
