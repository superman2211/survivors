export const fragmentShaderSource = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToLight2;
uniform vec4 u_color;
void main() {
vec3 normal = normalize(v_normal);
vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
float light = dot(normal, surfaceToLightDirection);
vec3 surfaceToLightDirection2 = normalize(v_surfaceToLight2);
float light2 = dot(normal, surfaceToLightDirection2);
gl_FragColor = u_color;
gl_FragColor.rgb *= light + light2;
}
`;