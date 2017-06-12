/**
 * a phong shader implementation
 */
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat4 u_invView;

uniform mat4 u_inverseMatrix;
//first light source
uniform vec3 u_lightPos;
//second light source
uniform vec3 u_light2Pos;
uniform vec3 u_spotLightPos;
uniform vec3 u_spotLightDir;

uniform bool u_enableObjectTexture;

//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
//light
varying vec3 v_lightVec;
varying vec3 v_light2Vec;

varying vec3 v_spotLightVec;
varying vec3 v_spotLightDir;

//texture
varying vec2 v_texCoord;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);

  v_normalVec = u_normalMatrix * a_normal;

  v_eyeVec = -eyePosition.xyz;
	//light position as uniform
	v_lightVec = u_lightPos - eyePosition.xyz;
	//second light source position
	v_light2Vec = u_light2Pos - eyePosition.xyz;
	//spot light position
	v_spotLightVec = u_spotLightPos - eyePosition.xyz; //Eye Space
	v_spotLightDir = u_spotLightDir; //Eye Space
	v_texCoord = a_texCoord;

	gl_Position = u_projection * eyePosition;
}
