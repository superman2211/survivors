export const fragmentShaderSource = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
uniform vec4 u_color;
void main() {
vec3 normal = normalize(v_normal);
vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
float light = dot(normal, surfaceToLightDirection);
gl_FragColor = u_color;
gl_FragColor.rgb *= light;
}
`;