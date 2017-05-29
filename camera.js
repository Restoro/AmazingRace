class PositionLookAt {
  constructor(position, lookAt) {
    this.position = position;
    this.lookAt = lookAt;
  }
}

class Camera {

  constructor(enableCam, position, lookAt) {
    this.positionLookQueue = [];
    this.currentMoveVec = vec3.create();
    this.currentLookMoveVec = vec3.create();
    this.rotateRight = true;
    //this.nextPos = vec3.create();

    this.rotation = {
      x: 90,
      y: 0
    }
    console.log(position);
    this.position = position;
    this.lookAt = lookAt;
    this.nextLookAndPos = new PositionLookAt(this.position, this.lookAt);
    this.rotateSens = 0.25;
    this.moveSens = 0.25;
    this.movePathSens = 0.0050;
    this.enable = enableCam;
  }

  addNextPosition(position, lookat) {
    this.positionLookQueue.push(new PositionLookAt(position, lookat));
  }

  getNextPosition() {
    return this.positionLookQueue.shift();
  }

  generateMoveVec() {
    this.nextLookAndPos = this.getNextPosition();
    if(this.nextLookAndPos != undefined) {
      this.currentMoveVec = vec3.subtract(vec3.create(), this.nextLookAndPos.position, this.position);
      this.currentLookMoveVec = this.nextLookAndPos.lookAt;
      let angle = vec3.angle(this.lookAt, this.currentLookMoveVec) * 180/Math.PI;
      let currentAngle = vec3.angle(vec3.fromValues(0,0,0), this.lookAt) * 180/Math.PI;
      if(Math.sin(currentAngle - angle) >= 0) {
        this.rotateRight = true;
      } else {
        this.rotateRight = false;
      }
    } else {
      this.nextLookAndPos = vec2.fromValues(this.position,this.lookAt);
      this.currentMoveVec = vec3.fromValues(0,0,0);
      this.currentLookMoveVec = this.lookAt;
    }
  }

  isInRange(a, b, c) {
    return (a >= b && a <= c);
  }

  compare(position, com ,offset) {
    let subCom = vec3.sub(vec3.create(), com, vec3.fromValues(offset,offset,offset));
    let addCom = vec3.add(vec3.create(), com, vec3.fromValues(offset,offset,offset));

    return (this.isInRange(position[0],subCom[0],addCom[0]) && this.isInRange(position[1],subCom[1],addCom[1]) && this.isInRange(position[2],subCom[2],addCom[2]));
  }

  computeViewMatrix() {
    if(!this.enable) {
      //TODO
      //Maybe change this with fixed offset to stand still
      if(!this.compare(this.lookAt, this.currentLookMoveVec, 0.01)) {
        let angle = vec3.angle(this.lookAt, this.currentLookMoveVec);
        if(this.rotateRight) {
          this.rotation.x -= angle;
        } else {
          this.rotation.x += angle;
        }
        //this.rotation.x += angle;
      }
    }

    let pitch = glMatrix.toRadian(this.rotation.y);
    let yaw = glMatrix.toRadian(-this.rotation.x);

    let rotationVec = vec3.fromValues(Math.cos(pitch) * Math.cos(yaw),Math.sin(pitch),Math.cos(pitch) * Math.sin(yaw));
    let lookAt = vec3.normalize(vec3.create(), rotationVec);
    this.lookAt = lookAt;

    let lookAtMatrix = mat4.lookAt(mat4.create(), this.position, vec3.add(vec3.create(), this.position, this.lookAt), [0,1,0]);
    return lookAtMatrix;
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
        this.position = vec3.add(vec3.create(), this.position, vec3.scale(vec3.create(),vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.position, [0,1,0])), this.moveSens));
      }
      if(keys["KeyD"] == true) {
        this.position = vec3.sub(vec3.create(), this.position, vec3.scale(vec3.create(),vec3.normalize(vec3.create(), vec3.cross(vec3.create(), this.position, [0,1,0])), this.moveSens));
      }
    } else {
      if(this.nextLookAndPos.position == undefined) {
        this.generateMoveVec();
      } else if(this.compare(this.position, this.nextLookAndPos.position, 0.001)) {
        this.generateMoveVec();
      }
      this.position = vec3.add(vec3.create(), this.position, vec3.scale(vec3.create(), this.currentMoveVec, this.movePathSens));
    }
    //console.log(this.position);
  }
}
