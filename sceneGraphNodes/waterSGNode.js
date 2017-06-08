class WaterSGNode extends SGNode {
  constructor(renderer, useWave, children) {
    super(children);
    this.useWave = useWave;
    if (typeof renderer !== 'function') {
      //assume it is a model wrap it
      this.renderer = modelRenderer(renderer);
    }
    else {
      this.renderer = renderer;
    }
  }

  setTransformationUniforms(context) {
    //set matrix uniforms
    const modelViewMatrix = mat4.multiply(mat4.create(), context.viewMatrix, context.sceneMatrix);
    const normalMatrix = mat3.normalFromMat4(mat3.create(), modelViewMatrix);
    const projectionMatrix = context.projectionMatrix;

    const gl = context.gl,
      shader = context.shader;
    gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_modelView'), false, modelViewMatrix);
    gl.uniformMatrix3fv(gl.getUniformLocation(shader, 'u_normalMatrix'), false, normalMatrix);
    gl.uniformMatrix4fv(gl.getUniformLocation(shader, 'u_projection'), false, projectionMatrix);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_animationTime'), this.timeInMilliseconds);
    gl.uniform1f(gl.getUniformLocation(context.shader, 'u_useWave'), this.useWave);
  }

  render(context) {
    this.setTransformationUniforms(context);
    //call the renderer
    this.renderer(context);
    //render children
    super.render(context);
  }
}

/* Since modifing the framework is prohibited, the render method is copied from the framework
  It is modified, that is renders a TRIANGLE_STRIP and not TRIANGLES! */
function modelRenderer(model) {
  //number of vertices
  var numItems = model.index ? model.index.length : model.position.length / 3;
  var position = null;
  var texCoordBuffer = null;
  var normalBuffer = null;
  var indexBuffer = null;
  //first time init of buffers
  function init(gl) {
    position = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, position);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.position), gl.STATIC_DRAW);
    if (model.texture) {
      texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.texture), gl.STATIC_DRAW);
    }
    if (model.normal) {
      normalBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(model.normal), gl.STATIC_DRAW);
    }
    if (model.index) {
      indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(model.index), gl.STATIC_DRAW);
    }
  }

  return function (context) {

    var gl = context.gl;
    var shader = context.shader;
    if (!shader) {
      return;
    }
    if (position === null) {
      //lazy init
      init(gl);
    }
    //set attributes
    gl.bindBuffer(gl.ARRAY_BUFFER, position);
    var positionLoc = gl.getAttribLocation(shader, 'a_position');
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
    var texCoordLoc = gl.getAttribLocation(shader, 'a_texCoord');
    if (isValidAttributeLocation(texCoordLoc) && model.texture) {
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.enableVertexAttribArray(texCoordLoc);
      gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    }
    var normalLoc = gl.getAttribLocation(shader, 'a_normal');
    if (isValidAttributeLocation(normalLoc) && model.normal) {
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      gl.enableVertexAttribArray(normalLoc);
      gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, 0);
    }
    //render elements
    if (model.index) {
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLE_STRIP, numItems, gl.UNSIGNED_SHORT, 0);
    }
    else {
      gl.drawArrays(gl.TRIANGLES, 0, numItems);
    }
  };
}
