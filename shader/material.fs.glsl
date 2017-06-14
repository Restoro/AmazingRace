/**
 * a phong shader implementation
 */
precision mediump float;

/**
 * definition of a material structure containing common properties
 */
struct Material {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
	vec4 emission;
	float shininess;
};

/**
 * definition of the light properties related to material properties
 */
struct Light {
	vec4 ambient;
	vec4 diffuse;
	vec4 specular;
};

struct SpotLight {
	float spotCosineCutoff;
	float spotExponent;
};

uniform Material u_material;
uniform Light u_light;
uniform Light u_light2;
uniform Light u_spotLight;
uniform SpotLight u_spotLightProp;

//varying vectors for light computation
varying vec3 v_normalVec;
varying vec3 v_eyeVec;
varying vec3 v_lightVec;
varying vec3 v_light2Vec;
varying vec3 v_spotLightVec;
varying vec3 v_spotLightDir;

uniform bool u_enableObjectTexture;

varying vec2 v_texCoord;

uniform sampler2D u_tex;

vec4 calculateSimpleSpotLight(Light light, SpotLight lightProp, Material material, vec3 lightVec, vec3 lightDir, vec3 normalVec, vec3 eyeVec, vec4 textureColor) {

	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);
	lightDir = normalize(lightDir);

	float spotFactor = 0.0;
	float spotCosine = dot(lightDir,-lightVec);
	if(acos(spotCosine) <= lightProp.spotCosineCutoff) {
		spotFactor = pow(spotCosine,lightProp.spotExponent);
	} else {
		spotFactor = 0.0;
	}

	float diffuse = max(dot(normalVec,lightVec),0.0);
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

  if(u_enableObjectTexture)
  {
    material.diffuse = textureColor;
    material.ambient = textureColor;
  }

	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + spotFactor * (c_diff + c_spec) + c_em;
}

vec4 calculateSimplePointLight(Light light, Material material, vec3 lightVec, vec3 normalVec, vec3 eyeVec,vec4 textureColor) {
	lightVec = normalize(lightVec);
	normalVec = normalize(normalVec);
	eyeVec = normalize(eyeVec);

	//compute diffuse term
	float diffuse = max(dot(normalVec,lightVec),0.0);

	//compute specular term
	vec3 reflectVec = reflect(-lightVec,normalVec);
	float spec = pow( max( dot(reflectVec, eyeVec), 0.0) , material.shininess);

  if(u_enableObjectTexture)
  {
    material.diffuse = textureColor;
    material.ambient = textureColor;
  }

	vec4 c_amb  = clamp(light.ambient * material.ambient, 0.0, 1.0);
	vec4 c_diff = clamp(diffuse * light.diffuse * material.diffuse, 0.0, 1.0);
	vec4 c_spec = clamp(spec * light.specular * material.specular, 0.0, 1.0);
	vec4 c_em   = material.emission;

	return c_amb + c_diff + c_spec + c_em;
}

void main() {

  vec4 textureColor = vec4(0,0,0,1);
  if(u_enableObjectTexture)
  {
    textureColor =  texture2D(u_tex,v_texCoord);
  }
	//Dont draw transparent fragments to prevent depth buffering issues
	if(textureColor.a < 0.2) {
		discard;
	}

	vec4 pointLight1 = calculateSimplePointLight(u_light, u_material, v_lightVec, v_normalVec, v_eyeVec, textureColor);
	vec4 pointLight2 = calculateSimplePointLight(u_light2, u_material, v_light2Vec, v_normalVec, v_eyeVec, textureColor);
	vec4 spotLight = calculateSimpleSpotLight(u_spotLight, u_spotLightProp, u_material, v_spotLightVec, v_spotLightDir, v_normalVec, v_eyeVec, textureColor);

	gl_FragColor = pointLight1 + spotLight + pointLight2;
}
