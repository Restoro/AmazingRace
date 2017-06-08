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
  }

  render(context) {
    this.computeCurrentPosition(context);
    let distance = vec3.distance(this._worldPosition, this.camera.position);

    //console.log("Distance:" + distance + " World Position:" + this._worldPosition + " Camera Position:" + this.camera.position);
    if(distance < this.range) {
      this.checkIfTimeIsSet();
      this.time += context.deltaTime;
      if(this.functionParameter.waterWave) {
        displayText("Water");
        this.functionParameter.waterWave.timeInMilliseconds = this.time;
      } else {
        displayText("Animation");
        this.matrix = glm.transform(this.addTimeToParameter(this.functionParameter));
        this.latestMatrix = this.matrix;
      }
    } else {
      if(this.functionParameter.waterWave) {
        this.checkIfTimeIsSet();
        this.timeInMilliseconds = this.time;
      } else {
        this.matrix = this.latestMatrix;
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
    const position =  vec4.transformMat4(vec4.create(), vec4.fromValues(original[0], original[1],original[2], 1), context.sceneMatrix);
    //since we animate the object, we should also include its new position
    const animatedPosition = vec4.transformMat4(vec4.create(), position, glm.transform(this.addTimeToParameter(this.functionParameter)));
    this._worldPosition = animatedPosition;
  }

  addTimeToParameter(transform) {
    //Transform object would be call by reference!
    var newTransform = {};
    this.checkIfTimeIsSet();

    if (transform.translate) {
      newTransform.translate = [transform.translate[0] * this.time, transform.translate[1] * this.time, transform.translate[2] * this.time];
      //console.log(newTransform.translate);
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
    if (transform.rotateXSin && transform.rotateXSinRange) {
        newTransform.rotateX = Math.sin(transform.rotateXSin * this.time) * transform.rotateXSinRange;
    }
    if (transform.rotateYSin && transform.rotateYSinRange) {
        newTransform.rotateY = Math.sin(transform.rotateYSin * this.time) * transform.rotateYSinRange;
    }
    if (transform.rotateZSin && transform.rotateZSinRange) {
        newTransform.rotateZ = (Math.sin(transform.rotateZSin * this.time) * transform.rotateZSinRange);
        console.log(newTransform.rotateZ)
    }
    //Scale not working
    /*
    if (transform.scale) {
      newTransform.scale = typeof transform.scale === 'number' ?  [transform.scale *this.time, transform.scale * this.time, transform.scale * this.time]: transform.scale * this.time;
      console.log(newTransform.scale);
    }*/
    return newTransform;
  }
}
