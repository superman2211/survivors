export const fragmentShaderSource = `
precision mediump float;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToLight2;
varying vec2 v_texCoord;
uniform vec4 u_color;
uniform sampler2D u_image;
void main() {
vec3 normal = normalize(v_normal);
vec3 surfaceToLightDirection = normalize(v_surfaceToLight);
float length1 = length(v_surfaceToLight);
float light = dot(normal, surfaceToLightDirection) * max(0.0, min(1.0, 1.0 - length1 / 100.0)); 
vec3 surfaceToLightDirection2 = normalize(v_surfaceToLight2);
float length2 = length(v_surfaceToLight2);
float light2 = dot(normal, surfaceToLightDirection2) * max(0.0, min(1.0, 1.0 - length2 / 100.0));
gl_FragColor = texture2D(u_image, v_texCoord);
gl_FragColor.rgb *= 0.3 + light + light2;
}
`;