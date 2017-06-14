/**
 * water fragment shader
 */

//need to specify how "precise" float should be
precision mediump float;

struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

uniform Light u_light;
uniform Light u_light2;

uniform Material u_material;

varying vec3 v_normalVec;
varying vec3 v_envNormalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_lightVec2;
varying vec3 v_cameraRayVec;

uniform bool u_useReflection;
uniform bool u_useWave;

uniform samplerCube u_texCube;

vec4 calculateEnvironmentReflection(vec3 normalVec, vec3 cameraRayVec) {
	normalVec = normalize(normalVec);
	cameraRayVec = normalize(cameraRayVec);

	vec3 texCoords;
	if(u_useReflection)
			texCoords  = reflect(cameraRayVec, normalVec);
	else
			texCoords = cameraRayVec;

	return textureCube(u_texCube, texCoords);
}

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

	vec4 c_amb;
	vec4 c_diff;
	if(u_useWave) {
		vec4 envReflect = calculateEnvironmentReflection(v_envNormalVec, v_cameraRayVec);
		c_amb  = clamp(light.ambient * material.ambient * envReflect, 0.0, 1.0);
		c_diff = clamp(diffuse * light.diffuse * material.diffuse * envReflect, 0.0, 1.0);
	} else {
		c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
		c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	}
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + c_diff + c_spec + c_em;
}

void main() {

	if(u_useWave) {
		gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec) + calculateSimplePointLight(u_light2, u_material, v_lightVec2, v_normalVec, v_eyeVec);
	} else {
	 	gl_FragColor = calculateEnvironmentReflection(v_envNormalVec, v_cameraRayVec);
 	}
}
