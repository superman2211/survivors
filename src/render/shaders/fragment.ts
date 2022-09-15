import { MAX_LIGHTS } from "./parameters";

let declaration = '';
let code = '';

for(let i = 0; i < MAX_LIGHTS; i++) {
	declaration += `varying vec3 v_surfaceToLight${i};`;

	code += `vec3 surfaceToLightDirection${i} = normalize(v_surfaceToLight${i});
float length${i} = length(v_surfaceToLight${i});
float light${i} = dot(normal, surfaceToLightDirection${i}) * max(0.0, min(1.0, 1.0 - length${i} / 1000.0));
lightValue += max(0.0, light${i});`
}

export const fragmentShaderSource = `
precision mediump float;
varying vec3 v_normal;
${declaration}
varying vec2 v_texCoord;
uniform vec4 u_color;
uniform sampler2D u_image;
void main() {
gl_FragColor = texture2D(u_image, v_texCoord);
vec3 normal = normalize(v_normal);
float lightValue = 0.0;
${code}
gl_FragColor.rgb *= lightValue;
}`;