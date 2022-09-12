export const vertexShaderSource = `
attribute vec4 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;
uniform vec3 u_lightWorldPosition;
uniform vec3 u_lightWorldPosition2;
uniform vec3 u_lightWorldPosition3;
uniform mat4 u_world;
uniform mat4 u_object;
uniform mat4 u_worldViewProjection;
uniform mat4 u_worldInverseTranspose;
varying vec3 v_normal;
varying vec2 v_texCoord;
varying vec3 v_surfaceToLight;
varying vec3 v_surfaceToLight2;
varying vec3 v_surfaceToLight3;
void main() {
	vec4 t_position = u_object * a_position;
	vec3 t_normal = mat3(u_object) * a_normal;
	gl_Position = u_worldViewProjection * t_position;
	v_normal = mat3(u_worldInverseTranspose) * t_normal;
	v_texCoord = a_texCoord;
	vec3 surfaceWorldPosition = (u_world * t_position).xyz;
	v_surfaceToLight = u_lightWorldPosition - surfaceWorldPosition;
	v_surfaceToLight2 = u_lightWorldPosition2 - surfaceWorldPosition;
	v_surfaceToLight3 = u_lightWorldPosition3 - surfaceWorldPosition;
}
`;