/**
 * a phong shader implementation
 */
attribute vec3 a_position;
attribute vec3 a_normal;
attribute vec2 a_texCoord;


attribute vec4 a_ambient;
attribute vec4 a_diffuse;
attribute vec4 a_specular;
attribute vec4 a_emission;
attribute float a_shininess;

varying vec4 v_ambient;
varying	vec4 v_diffuse;
varying	vec4 v_specular;
varying	vec4 v_emission;
varying	float v_shininess;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;
uniform mat4 u_invView;
//first light source
uniform vec3 u_lightPos;
//second light source
uniform vec3 u_light2Pos;
uniform bool u_enableObjectTexture;
//output of this shader
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_light2Vec;
varying vec2 v_texCoord;

void main() {
	vec4 eyePosition = u_modelView * vec4(a_position,1);

  v_normalVec = u_normalMatrix * a_normal;

  v_eyeVec = -eyePosition.xyz;
	//light position as uniform
	v_lightVec = u_lightPos - eyePosition.xyz;
	//second light source position
	v_light2Vec = u_light2Pos - eyePosition.xyz;
	v_texCoord = a_texCoord;

	v_ambient = a_ambient;
	v_diffuse = a_diffuse;
	v_specular = a_specular;
	v_emission = a_emission;
	v_shininess = a_shininess;
	gl_Position = u_projection * eyePosition;
}
