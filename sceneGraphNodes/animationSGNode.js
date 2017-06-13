class AnimationSGNode extends TransformationSGNode{
  constructor(matrix, position, camera, range, functionParameter, children) {
    super(null, children);
    this.latestMatrix = matrix;
    this.originalMatrix = matrix;
    this.range = range;
    this.camera = camera;
    this.position = position;
    //Functionparameter must be accepted by glm.transform
    this.functionParameter = functionParameter;
    this._worldPosition = position;
    this.time = 0;
    this.maxDelta = 9007199254740991; //Highest number in Javascript
    this.reset = false;
  }

  render(context) {
    this.computeCurrentPosition(context);
    let distance = vec3.distance(this._worldPosition, this.camera.position);

    //console.log("Distance:" + distance + " World Position:" + this._worldPosition + " Camera Position:" + this.camera.position);
    if(distance < this.range) {
      this.checkIfTimeIsSet();
      this.time += context.deltaTime;
      if(this.functionParameter.waterWave) {
        this.functionParameter.waterWave.timeInMilliseconds = this.time;
      } else if(this.functionParameter.treeRotate){
          this.matrix = this.creatBillboardMatrix(context.viewMatrix);
      }else if(this.time < this.maxDelta){
        this.matrix = glm.transform(this.addTimeToParameter(this.functionParameter));
        this.latestMatrix = this.matrix;
      }
    } else {
      if(this.functionParameter.waterWave) {
        this.checkIfTimeIsSet();
        this.timeInMilliseconds = this.time;
      } else {
        if(!this.reset) {
          this.matrix = this.latestMatrix;
        } else {
          this.matrix =this.originalMatrix;
          this.time = 0;
        }
      }
    }
    super.render(context);
  }

  checkIfTimeIsSet() {
    if(Number.isNaN(this.time)) {
      this.time = 0;
    }
  }

  computeCurrentPosition(context) {

    //transform with the current model matrix to get world coordinate since camera is also in world coordinates
    const original = this.position;
    let vec4Position = vec4.fromValues(original[0], original[1],original[2], 1)
    const position =  vec4.transformMat4(vec4.create(), vec4Position, context.sceneMatrix);
    this._worldPosition = position;
  }

  addTimeToParameter(transform) {
    //Transform object would be call by reference!
    var newTransform = {};
    this.checkIfTimeIsSet();

    if (transform.translate) {
      newTransform.translate = [transform.translate[0] * this.time, transform.translate[1] * this.time, transform.translate[2] * this.time];
    }
    if (transform.rotateX) {
      newTransform.rotateX = (transform.rotateX * this.time);
    }
    if (transform.rotateY) {
      newTransform.rotateY = (transform.rotateY * this.time);
    }
    if (transform.rotateZ) {
      newTransform.rotateZ = (transform.rotateZ * this.time);
    }
    //Array with [sin value, range, sinus offset]
    if (transform.rotateXSin) {
      newTransform.rotateX = Math.sin(transform.rotateXSin[0] * this.time) * transform.rotateXSin[1] + transform.rotateXSin[2];
    }
    if (transform.rotateYSin) {
      newTransform.rotateY = Math.sin(transform.rotateYSin[0] * this.time) * transform.rotateYSin[1] + transform.rotateYSin[2];
    }
    if (transform.rotateZSin) {
      newTransform.rotateZ = Math.sin(transform.rotateZSin[0] * this.time) * transform.rotateZSin[1] + transform.rotateZSin[2];
    }
    return newTransform;
  }

  creatBillboardMatrix(view){
    let billboard = mat4.create();
    billboard[0] = view[0];
//    billboard[1] = view[4];
    billboard[2] = view[8];
    billboard[3] = this.position[0];
  //  billboard[4] = view[1];
  //  billboard[5] = view[5];
  //  billboard[6] = view[9];
    billboard[7] = this.position[1];
    billboard[8] = view[2];
  //c  billboard[9] = view[6];
    billboard[10] = view[10];
    billboard[11] = this.position[2];
    billboard[12] = 0.0;
    billboard[13] = 0.0;
    billboard[14] = 0.0;
    billboard[15] = 1.0;
    return billboard;
  }
}
