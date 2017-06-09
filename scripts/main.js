//the OpenGL context
var gl = null;

//Rootnode for scene
var root = null;
var camera = null;

var lastFrameTime = 0;

var canvasWidth = 1200;
var canvasHeight = 500;

const keys = {};

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(canvasWidth, canvasHeight);

  gl.enable(gl.BLEND);
  //gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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

  var sunLight;
  var moonLight;
  const root = new ShaderSGNode(createProgram(gl, resources.materialvs, resources.materialfs));
  {
    //add skybox by putting large sphere around us
    let skyBox = new CubeMap(resources, gl);
    let envcubetexture = skyBox.envcubetexture;
    var skybox = new ShaderSGNode(createProgram(gl, resources.envvs, resources.envfs),[
        new EnvironmentSGNode(envcubetexture,4,false,
                    new RenderSGNode(makeSphere(200)))]);
    root.append(skybox);
  }

  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), [
      new TextureSGNode(floorTexture,0,new RenderSGNode(makeSphere(.2,10,10)))
    ]);
  }

    //floor
  {
    let floorTexture = createImage2DTexture(resources.floortexture);
    let floor = new MaterialSGNode(
              new TextureSGNode(floorTexture,0,
                new RenderSGNode(makeFloor())
              ));
    floor.ambient = [0, 0, 0, 1];
    floor.diffuse = [0.1, 0.1, 0.1, 1];
    floor.specular = [0.0, 0.0, 0.0, 1];
    floor.shininess = 50.0;
    root.append(new TransformationSGNode(glm.transform({ translate: [0,-1.5,0], rotateX: -90, scale: 3}), [
      floor
    ]));
  }

  {
    //initialize light
    sunLight = new LightSGNode(); //use now framework implementation of light node
    sunLight.ambient = [0.8, 0.8, 0.8, 1];
    sunLight.diffuse = [0.6, 0.6, 0.6, 1];
    sunLight.specular = [1, 1, 1, 1];
    sunLight.position = [0, 0, 0];

    let animateLight = new AnimationSGNode(mat4.create(), sunLight.position, camera, 1000, { rotateZ: 0.001});
    let translateLight = new TransformationSGNode(glm.transform({translate: [150,5,0]})); //translating the light is the same as setting the light position
    animateLight.append(translateLight);
    translateLight.append(sunLight);


    let sunTexture = createImage2DTexture(resources.suntexture);
    let sun = new TextureSGNode(sunTexture,0,new RenderSGNode(makeSphere(16)));
    translateLight.append(sun); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source

    root.append(animateLight);
  }

  {
    moonLight = new LightSGNode(); //use now framework implementation of light node
    moonLight.ambient = [0.2, 0.2, 0.2, 1];
    moonLight.diffuse = [0.6, 0.6, 0.6, 1];
    moonLight.specular = [1, 1, 1, 1];
    moonLight.position = [0, 0, 0];
    moonLight.uniform = 'u_light2';

    let animateLight = new AnimationSGNode(mat4.create(), moonLight.position, camera, 1000, { rotateZ: 0.001});
    let translateLight = new TransformationSGNode(glm.transform({translate: [-150,5,0]}));
    animateLight.append(translateLight);
    translateLight.append(moonLight);

    let moonTexture = createImage2DTexture(resources.moontexture);
    let moon = new TextureSGNode(moonTexture,0,new RenderSGNode(makeSphere(4)));
    translateLight.append(moon);

    root.append(animateLight);

  }
  //car
  {
    let carNode = new TransformationSGNode(glm.transform({ translate: [0,2,4]}));
    let carBodyFront = new MaterialSGNode([
        new RenderSGNode(Objects.makeCarBody(2,3,7.5))
      ]);
    carBodyFront.ambient = [1, 0, 0, 1];
    carBodyFront.diffuse = [1, 0, 0, 1];
    carBodyFront.specular = [0.5, 0.5, 0.5, 1];
    carBodyFront.shininess = 500.0;

    let carBodyBack = new TransformationSGNode(glm.transform({translate:[0,0,6.875], rotateY:180}),new MaterialSGNode([
        new RenderSGNode(Objects.makeCarBody(2,3,7.5))
      ]));
    carBodyFront.ambient = [1, 0, 0, 1];
    carBodyFront.diffuse = [1, 0, 0, 1];
    carBodyFront.specular = [0.5, 0.5, 0.5, 1];
    carBodyFront.shininess = 500.0;

    //TODO Change Container method
    let carBodyMiddle = new TransformationSGNode(glm.transform({translate:[0,0,3.437], rotateZ:180}),new MaterialSGNode([
        new RenderSGNode(Objects.makeContainer(2,1.25,3))
      ]));

    carNode.append(carBodyFront);
    carNode.append(carBodyBack);
    carNode.append(carBodyMiddle);
    root.append(carNode);
  }

  //pool
  {
    //water in pool
    let waterShader = new ShaderSGNode(createProgram(gl, resources.envvs, resources.envfs));
    let waterNode = new WaterSGNode(modelRendererStrip(Objects.makeRectMesh(50,50)), true);
    let waterAnimation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 150, { waterWave:waterNode});
    waterAnimation.append(waterNode);
    let water = new MaterialSGNode();
    setMaterialParameter(water, [0.25098, 0.54313, 1, 0.165], [0.25098, 0.54313, 0.5, 0.165], [0.8, 0.8, 0.8, 0.165], [0,0,0,0.165], 50.0);
    water.append(waterAnimation);
    water.lights.push(sunLight);
    water.lights.push(moonLight);

    let reflectWater = new EnvironmentSGNode(envcubetexture, 4, true);
    reflectWater.append(water);

    waterShader.append(new TransformationSGNode(glm.transform({ translate: [-10,-0.7,-10], rotateX: 0, rotateY:0, scale: 0.20}), [
      reflectWater
    ]));

    let poolEdgeTexture = createImage2DTexture(resources.woodtexture);
    let poolEdgeObject = new MaterialSGNode(new TextureSGNode(poolEdgeTexture,0,new RenderSGNode(Objects.makePoolEdge(10,10))));
    let poolLadder = new MaterialSGNode(new TransformationSGNode(glm.transform({ translate: [-9.45,-1.85,5], scale:1, rotateY:180}), [new RenderSGNode(resources.poolladdermodel)]));
    setMaterialParameter(poolLadder, [0.5,0.5,0.5,1], [0.5,0.5,0.5,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 0.4);
    //pool object
    let poolTexture = createImage2DTexture(resources.pooltexture);
    let poolObject = new MaterialSGNode(new TextureSGNode(poolTexture,0,new RenderSGNode(Objects.makePool(10,10,4))));
    poolObject.append(poolLadder);
    poolObject.append(waterShader);
    poolObject.append(poolEdgeObject);

    let completePool = new TransformationSGNode(glm.transform({ translate: [-25,10,25], scale:1.0}), [poolObject]);
    root.append(completePool);

  }

  {
    let snowManNode = new TransformationSGNode(glm.transform({ translate: [1,0,0], scale:1.0}));
    let snowManNodeAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 30, {rotateY:0.1}, [snowManNode]);

    let snowManLowMaterial  = new MaterialSGNode([new RenderSGNode(makeSphere(0.5))]);
    setMaterialParameter(snowManLowMaterial, [0.9,0.9,1,1],[0.9,0.9,1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let snowManLow = new TransformationSGNode(glm.transform({ translate: [0,0,0], scale:1.0}), [snowManLowMaterial]);

    let snowManMiddleMaterial  = new MaterialSGNode([new RenderSGNode(makeSphere(0.4))]);
    setMaterialParameter(snowManMiddleMaterial, [0.9,0.9,1,1],[0.9,0.9,1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let snowManMiddle = new TransformationSGNode(glm.transform({ translate: [0,0.7,0], scale:1.0}), [snowManMiddleMaterial]);

    let snowManHighMaterial = new MaterialSGNode([new RenderSGNode(makeSphere(0.3))]);
    setMaterialParameter(snowManHighMaterial, [0.9,0.9,1,1],[0.9,0.9,1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let snowManHigh = new TransformationSGNode(glm.transform({ translate: [0,1.25,0], scale:1.0}), [snowManHighMaterial]);

    let snowManArmLeftMaterial = new MaterialSGNode([new RenderSGNode(Objects.makeCube(0.3))]);
    setMaterialParameter(snowManArmLeftMaterial, [0.45,0.27,0.07,1],[0.45,0.27,0.07,1],[0.0, 0.0, 0.0, 1], [0,0,0,1], 1);
    let snowManArmLeft = new TransformationSGNode(glm.transform({ translate: [-0.65,0,0], scale:[1,0.2,0.2]}), [snowManArmLeftMaterial]);
    let snowManArmLeftAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 30, { rotateZSin:[0.01,20,0]}, snowManArmLeft);

    let snowManArmRightMaterial = new MaterialSGNode([new RenderSGNode(Objects.makeCube(0.3))]);
    setMaterialParameter(snowManArmRightMaterial, [0.45,0.27,0.07,1],[0.45,0.27,0.07,1],[0.0, 0.0, 0.0, 1], [0,0,0,1], 1);
    let snowManArmRight = new TransformationSGNode(glm.transform({ translate: [0.65,0,0], scale:[1,0.2,0.2]}), [snowManArmRightMaterial]);
    let snowManArmRightAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 30, { rotateZSin:[0.01,20,0]}, snowManArmRight);

    let snowManArms = new TransformationSGNode(glm.transform({ translate: [0,0.7,0]}), [snowManArmLeftAnimate, snowManArmRightAnimate]);

    snowManNode.append(snowManLow);
    snowManNode.append(snowManMiddle);
    snowManNode.append(snowManHigh);
    snowManNode.append(snowManArms);

    root.append(new TransformationSGNode(glm.transform({ translate: [-25,-1,-25]}), [
      snowManNodeAnimate
    ]));
  }

  {
    let treeTexture = createImage2DTexture(resources.palmtexture);
    let tree = new MaterialSGNode(
              new TextureSGNode(treeTexture,0,
                new RenderSGNode(makeTree())
              ));
    //tree.ambient = [0, 0, 0, 0.5]; - not used because texture
    //tree.diffuse = [0.1, 0.1, 0.1, 0.5]; - not used because texture
    tree.specular = [0.0, 0.0, 0.0, 0];
    tree.emission = [0,0,0,0];
    tree.shininess = 50.0;

    root.append(new TransformationSGNode(glm.transform({ translate: [25,0,-25], rotateX: 0, scale: 6}), [
      tree
    ]));
  }



  return root;
}

function setMaterialParameter(node, ambient, diffuse, specular, emission, shininess) {
  node.ambient = ambient;
  node.diffuse = diffuse;
  node.specular = specular;
  node.emission = emission;
  node.shininess = shininess;
}

function createImage2DTexture(image) {
  var textureNode = gl.createTexture();
  gl.activeTexture(gl.TEXTURE0);
  //bind texture to active texture unit
  gl.bindTexture(gl.TEXTURE_2D, textureNode);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  //texture sampling behaviour
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  //upload texture data
  gl.texImage2D(gl.TEXTURE_2D, //texture unit target == texture type
    0, //level of detail level (default 0)
    gl.RGBA, //internal format of the data in memory
    gl.RGBA, //image format (should match internal format)
    gl.UNSIGNED_BYTE, //image data type
    image); //actual image data
    //upload texture data
  //clean up/unbind texture
  gl.bindTexture(gl.TEXTURE_2D, null);
  return textureNode;
}

function makeFloor() {
  var floor = makeRect(25, 25);
  return floor;
}

function makeTree() {
  var tree = makeRect(1, 1);
  //Texture would be upside down
  tree.texture = [1, 1 /**/, 0, 1 /**/, 0, 0 /**/, 1, 0];
  return tree;
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
        //  console.log(event.code);
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
  document.addEventListener('keydown', function(event) {
    //https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
    switch(event.code) {
      case "KeyR":
        camera.rotation.x = 90;
    		camera.rotation.y = 0;
        camera.position.xy = 0;
        camera.position.z = 0;
      break;
      case "ArrowUp":
      case "KeyW":
      //Move forward in look direction
      keys["KeyW"] = true;
      break;
      case "ArrowDown":
      console.log(event.code)
      case "KeyS":

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

  context.timeInMilliseconds = timeInMilliseconds;
  context.deltaTime = deltaTime;
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
  treetexture:'models/tree1.png',
  floortexture: 'models/floor.jpg',
  suntexture: 'models/sun.jpg',
  moontexture: 'models/moon.jpg',
  pooltexture: 'models/poolMosaic.jpg',
  palmtexture: 'models/Palme.png',
  woodtexture: 'models/woodTexture.jpg',
  poolladdermodel: 'models/poolladder.obj',

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
