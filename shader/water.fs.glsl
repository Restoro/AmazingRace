/**
 * wireframe fragment shader
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

uniform Material u_material;

varying vec3 v_normalVec;
varying vec3 v_envNormalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
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

vec4 calculateEnvironmentRefraction(vec3 normalVec, vec3 cameraRayVec) {
	normalVec = normalize(normalVec);
	cameraRayVec = normalize(cameraRayVec);

	vec3 texCoords;
	if(u_useReflection)
			texCoords  = refract(cameraRayVec, normalVec, 1.1);
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


	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff;
	if(u_useWave) {
		//vec4 envReflect = vec4(0,0,0,1);
		vec4 envReflect = calculateEnvironmentReflection(v_envNormalVec, v_cameraRayVec);
		vec4 envRefract = calculateEnvironmentRefraction(v_envNormalVec, v_cameraRayVec);
		c_diff = clamp(diffuse * light.diffuse * material.diffuse * envReflect, 0.0, 1.0);
	} else {
		c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	}
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + c_diff + c_spec + c_em;
}

//entry point again
void main() {

	if(u_useWave) {
		// vec4 colorVec = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec) * 0.3 +
		 //								 calculateEnvironmentReflection(v_envNormalVec, v_cameraRayVec) * 0.7;

		//gl_FragColor = vec4(colorVec.xyz, colorVec.a);
		//gl_FragColor= vec4(v_normalVec * 0.5 + 0.5, 1);
		//gl_FragColor = calculateEnvironmentReflection(v_envNormalVec, v_cameraRayVec);
		gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec);
	} else {
	 	gl_FragColor = calculateEnvironmentReflection(v_envNormalVec, v_cameraRayVec);
 	}

	 //gl_FragColor = u_material.ambient;
   //gl_FragColor = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec);
}
