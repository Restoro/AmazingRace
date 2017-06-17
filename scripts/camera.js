class Camera {

  constructor(enableCam, position, rotationX, rotationY) {
    this.rotation = {
      x: rotationX,
      y: rotationY
    }
    this.position = position;
    this.lookAt = vec3.create();
    //Used for regulating camera freecam speed (rotation and movement)
    this.rotateSens = 0.25;
    this.moveSens = 0.25;

    this.displayQueue = [];
    this.positionLookQueue = [];
    this.currentMoveVec = vec3.create();
    this.currentLookMoveVec = vec3.create();
    //Used for regulating camera path movement speed
    this.movePathSens = 0.000215;
    this.nextLookAndPos = new PositionLookAt(this.position, this.lookAt, "");
    //This variable is used for switchting between path and freecam
    this.enable = enableCam;
    this.computeViewMatrix();
  }

  clearDisplayText() {
    this.displayQueue = [];
  }

  addDisplayText(text) {
    if(this.displayQueue.indexOf(text) == -1) {
      this.displayQueue.push(text);
    }
  }

  showDisplayText() {
    if(this.enable) {
      var displayString = "";
      for (var i = 0; i < this.displayQueue.length; i++) {
        if(i == this.displayQueue.length-1) {
          displayString += this.displayQueue[i];
        } else {
          displayString += this.displayQueue[i] + ", ";
        }
      }
      displayText(displayString);
    }
  }

  addNextPosition(position, lookat, displayText) {
    this.positionLookQueue.push(new PositionLookAt(position, lookat, displayText));
  }

  getNextPosition() {
    return this.positionLookQueue.shift();
  }

  generateMoveVec() {
    this.nextLookAndPos = this.getNextPosition();
    if(this.nextLookAndPos != undefined) {
      this.currentMoveVec = vec3.subtract(vec3.create(), this.nextLookAndPos.position, this.position);
      this.currentLookMoveVec = this.nextLookAndPos.lookAt;
      if(this.nextLookAndPos.text) {
        displayText(this.nextLookAndPos.text);
      } else {
        displayText("");
      }
    } else {
      //No more Position to move to
      this.currentLookMoveVec = this.lookAt;
      //Enable Freecam
      this.enable = true;
      displayText("");
    }
  }

  isInRange(a, b, c) {
    return (a >= b && a <= c);
  }

  //Compares if vec3 position is in offset range of vec3 com
  compareVec3(position, com ,offset) {
    let subCom = vec3.sub(vec3.create(), com, vec3.fromValues(offset,offset,offset));
    let addCom = vec3.add(vec3.create(), com, vec3.fromValues(offset,offset,offset));

    return (this.isInRange(position[0],subCom[0],addCom[0]) && this.isInRange(position[1],subCom[1],addCom[1]) && this.isInRange(position[2],subCom[2],addCom[2]));
  }

  computeViewMatrix() {
    let pitch = glMatrix.toRadian(this.rotation.y);
    let yaw = glMatrix.toRadian(-this.rotation.x);

    let rotationVec = vec3.fromValues(Math.cos(pitch) * Math.cos(yaw),Math.sin(pitch),Math.cos(pitch) * Math.sin(yaw));
    let lookAt = vec3.normalize(vec3.create(), rotationVec);

    if(this.enable) {
      this.lookAt = lookAt;
      let lookAtMatrix = mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.lookAt), [0,1,0]);
      return lookAtMatrix;
    }else {
      this.lookAt = this.currentLookMoveVec
      let lookAtMatrix = mat4.lookAt(mat4.create(), this.position, this.lookAt, [0,1,0]);
      return lookAtMatrix;
    }
  }

  proccessMovement(keys, time) {
    if(this.enable) {
      if(keys["KeyW"] == true) {
        this.position = vec3.add(vec3.create(), this.position, vec3.scale(vec3.create(), this.lookAt, this.moveSens));
      }
      if(keys["KeyS"] == true) {
        this.position = vec3.sub(vec3.create(), this.position, vec3.scale(vec3.create(), this.lookAt, this.moveSens));
      }
      if(keys["KeyA"] == true) {
        this.position = vec3.sub(vec3.create(), this.position, vec3.scale(vec3.create(),vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.lookAt, [0,1,0])), this.moveSens));
      }
      if(keys["KeyD"] == true) {
        this.position = vec3.add(vec3.create(), this.position, vec3.scale(vec3.create(),vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.lookAt, [0,1,0])), this.moveSens));
      }
    } else {
      if(this.nextLookAndPos.position == undefined) {
        this.generateMoveVec();
      } else if(this.compareVec3(this.position, this.nextLookAndPos.position, 0.05*time)) {
        this.generateMoveVec();
      }
      if(!isNaN(time))
      this.position = vec3.add(vec3.create(), this.position, vec3.scale(vec3.create(), this.currentMoveVec, this.movePathSens*time));
    }
  }
}
class PositionLookAt {
  constructor(position, lookAt, displayText) {
    this.position = position;
    this.lookAt = lookAt;
    this.text = displayText;
  }
}
