class PositionLookAt {
  constructor(position, lookAt) {
    this.position = position;
    this.lookAt = lookAt;
  }
}

class Camera {

  constructor(enableCam, position, rotationX, rotationY) {
    this.positionLookQueue = [];
    this.currentMoveVec = vec3.create();
    this.currentLookMoveVec = vec3.create();
    this.circular = true;

    this.rotation = {
      x: rotationX,
      y: rotationY
    }
    this.position = position;
    this.lookAt = vec3.create();
    this.nextLookAndPos = new PositionLookAt(this.position, this.lookAt);
    //Used for regulating camera freecam speed (rotation and movement)
    this.rotateSens = 0.25;
    this.moveSens = 0.25;
    //Used for regulating camera path movement speed
    this.movePathSens = 0.004;

    //This variable is used for switchting between path and freecam
    this.enable = enableCam;

    this.maxTime = 30000;
    this.computeViewMatrix();
  }

  addNextPosition(position, lookat) {
    this.positionLookQueue.push(new PositionLookAt(position, lookat));
  }

  getNextPosition() {
    return this.positionLookQueue.shift();
  }

  peekNextPosition() {
    return this.positionLookQueue[0];
  }

  generateMoveVec() {
    this.nextLookAndPos = this.getNextPosition();
    if(this.nextLookAndPos != undefined) {
      this.currentMoveVec = vec3.subtract(vec3.create(), this.nextLookAndPos.position, this.position);
      //console.log(this.nextLookAndPos.lookAt);
      this.currentLookMoveVec = this.nextLookAndPos.lookAt;
      this.setRotateDirection();
    } else {
      //No more Position to move to
      //this.nextLookAndPos = vec2.fromValues(this.position,this.lookAt);
      //this.currentMoveVec = vec3.fromValues(0,0,0);
      this.currentLookMoveVec = this.lookAt;
      //Enable Freecam
      this.enable = true;
    }
  }

  setRotateDirection() {
    //console.log(this.lookAt);
    let perpendicular1 = vec3.fromValues(-this.lookAt[2], this.lookAt[1], this.lookAt[0]);
    let perpendicular2 = vec3.fromValues(this.lookAt[2], this.lookAt[1], -this.lookAt[0]);
    let perpen1Angle = vec3.angle(perpendicular1, this.currentLookMoveVec);
    let perpen2Angle = vec3.angle(perpendicular2, this.currentLookMoveVec);
    //console.log(perpendicular1 + " " + perpen1Angle);
    //console.log(perpendicular2 + " " + perpen2Angle);
    if(perpen1Angle < perpen2Angle) {
      this.circular = true;
    } else {
      this.circular = false;
    }
  }

  isInRange(a, b, c) {
    return (a >= b && a <= c);
  }

  compareCoordinate(position, com, offset) {
    let subCom = com - offset;
    let addCom = com + offset;

    return (this.isInRange(position,subCom,addCom));
  }

  compareVec2(position, com, offset) {
    let subCom = vec2.sub(vec3.create(), com, vec2.fromValues(offset,offset));
    let addCom = vec2.add(vec3.create(), com, vec2.fromValues(offset,offset));

    return (this.isInRange(position[0],subCom[0],addCom[0]) && this.isInRange(position[1],subCom[1],addCom[1]));
  }
  //Compares if vec3 position is in offset range of vec3 com
  compareVec3(position, com ,offset) {
    let subCom = vec3.sub(vec3.create(), com, vec3.fromValues(offset,offset,offset));
    let addCom = vec3.add(vec3.create(), com, vec3.fromValues(offset,offset,offset));

    return (this.isInRange(position[0],subCom[0],addCom[0]) && this.isInRange(position[1],subCom[1],addCom[1]) && this.isInRange(position[2],subCom[2],addCom[2]));
  }

  //Convertes Vec3 to Vec2 by using x and z coordinate
  createVec2FromVec3(input) {
    return vec2.fromValues(input[0],input[2]);
  }

  computeViewMatrix() {
    if(!this.enable) {
      //TODO
      //Maybe change this with fixed offset to stand still
      this.setRotateDirection();
      //console.log("X Lookat:" + this.lookAt[0] + " X Target" + this.currentLookMoveVec[0]);
      let angle = vec3.angle(this.lookAt, this.currentLookMoveVec);
      if(!this.compareVec3(this.lookAt, this.currentLookMoveVec, 0.1)) {
        if(this.circular) {
          this.rotation.x -= angle;
        } else {
          this.rotation.x += angle;
        }
      }

      if(!(this.compareCoordinate(this.lookAt[1], this.currentLookMoveVec[1], 0.1))) {
        //console.log("Y lookat:" + this.lookAt[1] + " Y Target:" + this.currentLookMoveVec[1]);
        if(this.lookAt[1] < this.currentLookMoveVec[1]) {
          this.rotation.y += angle;
        } else {
          this.rotation.y -= angle;
        }
      }
    }

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

    //let lookAtMatrix = mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.lookAt), [0,1,0]);

  }

  proccessMovement(keys) {
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
      } else if(this.compareVec3(this.position, this.nextLookAndPos.position, 0.1)) {
        this.generateMoveVec();
      }
      this.position = vec3.add(vec3.create(), this.position, vec3.scale(vec3.create(), this.currentMoveVec, this.movePathSens));
    }
  }
}
