const camera = {
    rotation: {
      x: 0,
      y: 0
    },
    position: vec3.create(),
    lookAt: vec3.create(),
    rotateSens: 0.25,
    moveSens: 0.25
  };

//getCamera returns reference!
function getCamera() {
  return camera;
}

function computeViewMatrix() {
  let pitch = glMatrix.toRadian(camera.rotation.y);
  let yaw = glMatrix.toRadian(-camera.rotation.x);

  let rotationVec = vec3.fromValues(Math.cos(pitch) * Math.cos(yaw),Math.sin(pitch),Math.cos(pitch) * Math.sin(yaw));
  let lookAt = vec3.normalize(vec3.create(), rotationVec);
  camera.lookAt = lookAt;

  let lookAtMatrix = mat4.lookAt(mat4.create(), camera.position, vec3.add(vec3.create(), camera.position, camera.lookAt), [0,1,0]);
  return lookAtMatrix;
}

function proccessMovement(keys) {
  if(keys["KeyW"] == true) {
    camera.position = vec3.add(vec3.create(), camera.position, vec3.scale(vec3.create(), camera.lookAt, camera.moveSens));
  }
  if(keys["KeyS"] == true) {
    camera.position = vec3.sub(vec3.create(), camera.position, vec3.scale(vec3.create(), camera.lookAt, camera.moveSens));
  }
  if(keys["KeyA"] == true) {
    camera.position = vec3.add(vec3.create(), camera.position, vec3.scale(vec3.create(),vec3.normalize(vec3.create(), vec3.cross(vec3.create(), camera.position, [0,1,0])), camera.moveSens));
  }
  if(keys["KeyD"] == true) {
    camera.position = vec3.sub(vec3.create(), camera.position, vec3.scale(vec3.create(),vec3.normalize(vec3.create(), vec3.cross(vec3.create(), camera.position, [0,1,0])), camera.moveSens));
  }
}
