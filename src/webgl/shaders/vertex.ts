export const vertexShaderSource = `
attribute vec4 a_position;
attribute vec3 a_normal;
uniform vec3 u_lightWorldPosition;
uniform vec3 u_lightWorldPosition2;
uniform mat4 u_world;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
varying vec3 v_normal;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToLight2;
void main() {
gl_Position = u_worldViewProjection * a_position;
v_normal = mat3(u_worldInverseTranspose) * a_normal;
vec3 surfaceWorldPosition = (u_world * a_position).xyz;
v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
v_surfaceToLight2 = u_lightWorldPosition2 - surfaceWorldPosition;
}
`;