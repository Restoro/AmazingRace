class SpotLightSGNode extends LightSGNode {

  constructor(position, children) {
    super(position, children);
    this.dir = [1,0,0];
    //range of the cut off angle
    this.cosineCutoff = 50;
    //inentsity of the light
    this.exponent = 1.0;
    //uniform name
    this.uniform = 'u_spotLight';
    this.uniformProp = 'u_spotLightProp';
  }

  setLightPropUniforms(context) {
      const gl = context.gl;
      if (!context.shader) {
        return;
      }
      gl.uniform1f(gl.getUniformLocation(context.shader, this.uniformProp+'.spotCosineCutoff'), this.cosineCutoff /180 *Math.PI);
      gl.uniform1f(gl.getUniformLocation(context.shader, this.uniformProp+'.spotExponent'), this.exponent);

      const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
      const normal = mat3.normalFromMat4(mat3.create(), modelViewMatrix);
      const originalDir = this.dir;
      const direction = vec3.transformMat3(vec3.create(), vec3.fromValues(originalDir[0], originalDir[1], originalDir[2]), normal);
      gl.uniform3f(gl.getUniformLocation(context.shader, this.uniform+"Dir"), direction[0], direction[1], direction[2]);
    }

    render(context) {
      this.setLightPropUniforms(context);
      super.render(context);
    }
  }
