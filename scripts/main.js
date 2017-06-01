//the OpenGL context
var gl = null;

//Rootnode for scene
var root = null;
var camera = null;

var lastFrameTime = 0;

var canvasWidth = 1200;
var canvasHeight = 500;

var rotateLight;

var envcubetexture;
const keys = {};
/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(canvasWidth, canvasHeight);

  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  gl.enable(gl.DEPTH_TEST);
  initSkybox(resources,gl);
  initCamera();
  root = createSceneGraph(gl, resources);
  initInteraction(gl.canvas);
}

function initSkybox(resources, gl) {
  let skyBox = new CubeMap(resources, gl);
  envcubetexture = skyBox.envcubetexture;
}

function initCamera() {
  camera = new Camera(true, vec3.fromValues(0,0,0), 90, 0);
  camera.addNextPosition(vec3.fromValues(0,0,50), vec3.fromValues(1,0,0));
  camera.addNextPosition(vec3.fromValues(0,0,0), vec3.fromValues(0,0,1));
  camera.addNextPosition(vec3.fromValues(0,0,50), vec3.fromValues(-1,1,0));
  camera.addNextPosition(vec3.fromValues(0,0,40), vec3.fromValues(0,0,-1));
}

function createSceneGraph(gl, resources) {
  var light;
  const root = new ShaderSGNode(createProgram(gl, resources.materialvs, resources.materialfs));
  {
    //add skybox by putting large sphere around us
    var skybox = new ShaderSGNode(createProgram(gl, resources.envvs, resources.envfs),[
        new EnvironmentSGNode(envcubetexture,4,false,
                    new RenderSGNode(makeSphere(200)))]);
    root.append(skybox);
  }

  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), [
      new RenderSGNode(makeSphere(.2,10,10))
    ]);
  }

  {
    //initialize light
    light = new LightSGNode(); //use now framework implementation of light node
    light.ambient = [0.2, 0.2, 0.2, 1];
    light.diffuse = [0.8, 0.8, 0.8, 1];
    light.specular = [1, 1, 1, 1];
    light.position = [0, 0, 0];

    rotateLight = new AnimationSGNode(mat4.create(), light.position, camera, 30, { rotationY:1});
    let translateLight = new TransformationSGNode(glm.translate(0,2,2)); //translating the light is the same as setting the light position
    rotateLight.append(translateLight);
    translateLight.append(light);
    translateLight.append(createLightSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source

    root.append(rotateLight);
  }
  {
    let tire = new MaterialSGNode([
        new RenderSGNode(makeSphere(.5,25,25))
      ]);
    tire.ambient = [0, 0, 1, 1];
    tire.diffuse = [1, 1, 1, 1];
    tire.specular = [0.5, 0.5, 0.5, 1];
    tire.shininess = 5.0;

    root.append(new TransformationSGNode(glm.transform({ translate: [0,2,-2], scale: [0.4,1,1]}), [
      tire
    ]));
  }
  // Water Wave
  {
    let waterShader = new ShaderSGNode(createProgram(gl, resources.envvs, resources.envfs));

    let water = new MaterialSGNode([
      new WaterSGNode(Objects.makeRectMesh(50,50), true)
    ]);
    water.ambient = [0, 0, 1, 1];
    water.diffuse = [1, 1, 1, 1];
    water.specular = [0.5, 0.5, 0.5, 1];
    water.shininess = 5.0;
    water.lights.push(light);

    let reflectWater = new EnvironmentSGNode(envcubetexture, 4, true);
    reflectWater.append(water);

    waterShader.append(new TransformationSGNode(glm.transform({ translate: [-10,-3,-10], rotateX: 0, scale: 0.25}), [
      reflectWater
    ]));

    root.append(waterShader);
  }

  return root;
}

function initInteraction(canvas) {
  const mouse = {
    pos: { x : 0, y : 0},
    leftButtonDown: false
  };
  function toPos(event) {
    //convert to local coordinates
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top
    };
  }
  canvas.addEventListener('mousedown', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
  });
  canvas.addEventListener('mousemove', function(event) {
    const pos = toPos(event);
    const delta = { x : mouse.pos.x - pos.x, y: mouse.pos.y - pos.y };
    if (mouse.leftButtonDown) {
      //add the relative movement of the mouse to the rotation variables
  		camera.rotation.x += delta.x * camera.rotateSens;
  		camera.rotation.y += delta.y * camera.rotateSens;
    }
    mouse.pos = pos;
  });
  canvas.addEventListener('mouseup', function(event) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = false;
  });
  //register globally
  document.addEventListener('keyup', function(event) {
    switch(event.code) {
      case "ArrowUp": case "KeyW":
        keys["KeyW"] = false;
      break;
      case "ArrowDown": case "KeyS":
        keys["KeyS"] = false;
      break;
      case "ArrowLeft": case "KeyA":
        keys["KeyA"] = false;
      break;
      case "ArrowRight": case "KeyD":
        keys["KeyD"] = false;
      break;
    }
  });
  document.addEventListener('keypress', function(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    switch(event.code) {
      case "KeyR":
        camera.rotation.x = 90;
    		camera.rotation.y = 0;
        camera.position.xy = 0;
        camera.position.z = 0;
      break;
      case "ArrowUp": case "KeyW":
      //Move forward in look direction
      keys["KeyW"] = true;
      break;
      case "ArrowDown": case "KeyS":
      //Move backward in look directiom
      keys["KeyS"] = true;
      break;
      case "ArrowLeft": case "KeyA":
      keys["KeyA"] = true;
      break;
      case "ArrowRight": case "KeyD":
      keys["KeyD"] = true;
      break;
    }
  });
}

/**
 * render one frame
 */
function render(timeInMilliseconds) {

  //set viewport
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

  gl.clearColor(0.9, 0.9, 0.9, 1.0);
  //clear the buffer
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  const context = createSGContext(gl);
  //Set time in context to anime things
  var deltaTime = timeInMilliseconds - lastFrameTime;
  lastFrameTime = timeInMilliseconds;
  //rotateLight.matrix = glm.rotateY(-timeInMilliseconds*0.05);

  context.timeInMilliseconds = timeInMilliseconds;
  context.deltaTime = deltaTime;
  //rotateLight.matrix = glm.rotateY(180);
  //rotateLight.matrix = glm.rotateY(timeInMilliseconds);
  //Parameter: out, fieldofview, aspect ratio, near clipping, far clipping
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(25), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 300);

  camera.proccessMovement(keys);

  context.viewMatrix = camera.computeViewMatrix();
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);

  root.render(context);
  //request another call as soon as possible
  requestAnimationFrame(render);
}




//load the shader resources using a utility function
loadResources({
  vs: 'shader/empty.vs.glsl',
  fs: 'shader/empty.fs.glsl',
  envvs: 'shader/water.vs.glsl',
  envfs: 'shader/water.fs.glsl',
  materialvs: 'shader/material.vs.glsl',
  materialfs: 'shader/material.fs.glsl',

/*
  env_pos_x: 'skybox/debug/Red.png',
  env_neg_x: 'skybox/debug/Green.png',
  env_pos_y: 'skybox/debug/Yellow.png',
  env_neg_y: 'skybox/debug/White.png',
  env_pos_z: 'skybox/debug/Purple.png',
  env_neg_z: 'skybox/debug/Blue.png'
*/

/*
  env_pos_x: 'skybox/sky/skyposx1.png',
  env_neg_x: 'skybox/sky/skynegx1.png',
  env_pos_y: 'skybox/sky/skyposy1.png',
  env_neg_y: 'skybox/sky/skynegy1.png',
  env_pos_z: 'skybox/sky/skyposz1.png',
  env_neg_z: 'skybox/sky/skynegz1.png'
*/


  env_pos_x: 'skybox/UnionSquare/posx.jpg',
  env_neg_x: 'skybox/UnionSquare/negx.jpg',
  env_pos_y: 'skybox/UnionSquare/posy.jpg',
  env_neg_y: 'skybox/UnionSquare/negy.jpg',
  env_pos_z: 'skybox/UnionSquare/posz.jpg',
  env_neg_z: 'skybox/UnionSquare/negz.jpg'

}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});
