export const position = new Float32Array([
	1, 1, 1, -1, 1, 1, -1, -1, 1, 1, -1, 1, 1, 1, 1, 1, -1, 1, 1, -1, -1, 1, 1,
	-1, 1, 1, 1, 1, 1, -1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1, -1, -1, -1, -1,
	-1, -1, 1, -1, -1, -1, 1, -1, -1, 1, -1, 1, -1, -1, 1, 1, -1, -1, -1, -1, -1,
	-1, 1, -1, 1, 1, -1
])

export const color = new Float32Array([
	1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
	0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
	0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
])

export const normal = new Float32Array([
	0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1,
	0, 0, 1, 0, 0, 1, 0, 0, 1, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1,
	0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
])

export const indexData = new Uint8Array([
	0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 8, 9, 10, 8, 10, 11, 12, 13, 14, 12, 14,
	15, 16, 17, 18, 16, 18, 19, 20, 21, 22, 20, 22, 23
])

export const vShader = `
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vColor;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vPosition = vec4(modelMatrix * vec4(position, 1.0)).xyz;
    vNormal = vec3(normalMatrix * normal);
    vColor = color;
  }
`

export const fShader = `
  struct PointLight {
    vec3 color;
    vec3 position;
  };

  uniform PointLight light;
  varying vec3 vPosition;
  varying vec3 vNormal;
  varying vec3 vColor;

  void main() {
    vec3 normal = normalize(vNormal);
    vec3 direction = normalize(light.position - vPosition);
    float nDot = max(dot(normal, direction),0.0);
    vec3 diffe = light.color * vColor.rgb * nDot;
    gl_FragColor = vec4(diffe, 1.0);
  }
`
