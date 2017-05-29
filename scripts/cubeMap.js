class CubeMap {
  constructor(resources, glContext) {
    this.resources = resources;
    this.glContext = glContext;
    this.envcubetexture = this.initCubeMap(this.resources, this.glContext);
  }

  initCubeMap(resources, gl) {
    //create the texture
    let envcubetexture = gl.createTexture();
    //define some texture unit we want to work on
    gl.activeTexture(gl.TEXTURE0);
    //bind the texture to the texture unit
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, envcubetexture);
    //set sampling parameters
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
    //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT); //will be available in WebGL 2
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    //set correct image for each side of the cube map
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);//flipping required for our skybox, otherwise images don't fit together
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resources.env_pos_x);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resources.env_neg_x);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resources.env_pos_y);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resources.env_neg_y);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resources.env_pos_z);
    gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.resources.env_neg_z);
    //generate mipmaps (optional)
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
    //unbind the texture again
    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

    return envcubetexture;
  }
}
