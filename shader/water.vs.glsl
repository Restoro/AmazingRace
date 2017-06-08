#define M_PI 3.1415926535897932384626433832795

attribute vec3 a_position;
attribute vec3 a_normal;

uniform mat4 u_modelView;
uniform mat3 u_normalMatrix;
uniform mat4 u_projection;

varying vec3 v_normalVec;
varying vec3 v_envNormalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_lightVec2;
varying vec3 v_cameraRayVec;

//first light source
uniform vec3 u_lightPos;
//second light source
uniform vec3 u_light2Pos;

uniform float u_animationTime;
//inverse view matrix to get from eye to world space
uniform mat3 u_invView;
uniform bool u_useWave;

//wave formula
float generateWave(vec2 position, vec2 direction, float amp, float freq, float time, float phase) {
  return amp * sin(dot(position, direction) * freq + time * phase);
}

//a A w cos(w (a x + b z) + q t) - derivative (x) of wave formula
float calcNormalX(vec2 position, vec2 direction, float amp, float freq, float time, float phase) {
  return -1.0 * (direction.x * freq * amp * cos(freq * dot(position, direction) + time * phase));
}

//A b w cos(w (a x + b z) + q t) - derivative (z) of wave formula
float calcNormalZ(vec2 position, vec2 direction, float amp, float freq, float time, float phase) {
  return -1.0 * (direction.y * freq * amp * cos(freq * dot(position, direction) + time * phase));
}

//Output: x = Normal, y = Wave, z = Normal
vec3 generateWaveWithNormals(vec2 position, vec2 direction, float amp, float freq, float time, float phase) {
  vec3 waveVector;
  waveVector.y = generateWave(position, direction, amp, freq, time, phase);
  waveVector.x = calcNormalX(position, direction, amp, freq, time, phase);
  waveVector.z = calcNormalZ(position, direction, amp, freq, time, phase);
  return waveVector;
}


void main() {
  vec3 normalOfVertex = a_normal;
  vec3 newPosition = a_position;

  if(u_useWave) {
      //generate wave movements
      vec3 waveVector1 = generateWaveWithNormals(a_position.xz, vec2(1,0), 1.5, 0.1, u_animationTime, 0.001);
      vec3 waveVector2 = generateWaveWithNormals(a_position.xz, vec2(1,0.5), 0.5, 0.1, u_animationTime, 0.001);
      vec3 waveVector3 = generateWaveWithNormals(a_position.xz, vec2(1, 1), 0.1, 0.2, u_animationTime, 0.001);
      vec3 waveVector4 = generateWaveWithNormals(a_position.xz, vec2(0.5,1), 0.2, 0.1, u_animationTime, 0.001);

      //add them together to create more realistic waves
      vec3 waveVector = waveVector1 + waveVector2 + waveVector3 + waveVector4;

      newPosition.y = waveVector.y;
      normalOfVertex.x = waveVector.x;
      normalOfVertex.y = 1.0;
      normalOfVertex.z = waveVector.z;
  }

  vec4 eyePosition = u_modelView * vec4(newPosition,1);

  v_eyeVec = -eyePosition.xyz;
  //light position as uniform
  v_lightVec = u_lightPos - eyePosition.xyz;
  v_lightVec2 = u_light2Pos - eyePosition.xyz;

  vec4 clipCoordinates = u_projection * eyePosition;
  //transform camera ray direction to world space
	v_cameraRayVec = u_invView * eyePosition.xyz;

	//calculate normal vector in world space
  v_normalVec = u_normalMatrix * normalOfVertex;
	v_envNormalVec = u_invView * u_normalMatrix * normalOfVertex;

  gl_Position = clipCoordinates;

}
