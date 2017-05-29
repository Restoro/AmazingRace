//the OpenGL context
var gl = null;

//Rootnode for scene
var root = null;
var camera = null;

var canvasWidth = 1200;
var canvasHeight = 500;

var rotateLight = null;

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
  initCubeMap(resources);
  initCamera();
  root = createSceneGraph(gl, resources);
  initInteraction(gl.canvas);
}

function initCamera() {
  camera = new Camera(false, vec3.fromValues(0,0,0), vec3.fromValues(0,0,0));
  camera.addNextPosition(vec3.fromValues(0,0,30), vec3.fromValues(10,1,-1));
  camera.addNextPosition(vec3.fromValues(0,0,10), vec3.fromValues(1,0,-1));
}

function initCubeMap(resources) {
  //create the texture
  envcubetexture = gl.createTexture();
  //define some texture unit we want to work on
  gl.activeTexture(gl.TEXTURE0);
  //bind the texture to the texture unit
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, envcubetexture);
  //set sampling parameters
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);
  //gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.MIRRORED_REPEAT); //will be available in WebGL 2
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  //set correct image for each side of the cube map
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);//flipping required for our skybox, otherwise images don't fit together
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_x);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_x);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_y);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_y);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_pos_z);
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, resources.env_neg_z);
  //generate mipmaps (optional)
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
  //unbind the texture again
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}

function createSceneGraph(gl, resources) {
  const root = new ShaderSGNode(createProgram(gl, resources.wirevs, resources.wirefs));
  {
    //add skybox by putting large sphere around us
    var skybox = new ShaderSGNode(createProgram(gl, resources.wirevs, resources.wirefs),[
        new EnvironmentSGNode(envcubetexture,4,false,
                    new RenderSGNode(makeSphere(50)))]);
    root.append(skybox);
  }
  // Water Wave
  {
    let water = new MaterialSGNode([
      new WaterSGNode(makeRectMesh(50,50), true)
    ]);
    water.ambient = [0, 0, 1, 1];
    water.diffuse = [1, 1, 1, 1];
    water.specular = [0.5, 0.5, 0.5, 1];
    water.shininess = 5.0;


    let reflectWater = new EnvironmentSGNode(envcubetexture, 4, true);
    reflectWater.append(water);

    root.append(new TransformationSGNode(glm.transform({ translate: [-10,-3,-10], rotateX: 0, scale: 0.25}), [
      reflectWater
    ]));

  }

  function createLightSphere() {
    return new ShaderSGNode(createProgram(gl, resources.vs, resources.fs), [
      new RenderSGNode(makeSphere(.2,10,10))
    ]);
  }

  {
    //initialize light
    let light = new LightSGNode(); //use now framework implementation of light node
    light.ambient = [0.3, 0.3, 0.3, 1];
    light.diffuse = [0.7, 0.7, 0.7, 1];
    light.specular = [1, 1, 1, 1];
    light.position = [0, 0, 0];

    rotateLight = new TransformationSGNode(mat4.create());
    let translateLight = new TransformationSGNode(glm.translate(0,5,0)); //translating the light is the same as setting the light position

    rotateLight.append(translateLight);
    translateLight.append(light);
    translateLight.append(createLightSphere()); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source
    root.append(rotateLight);
  }

  return root;
}



function makeRectMesh(width, height) {
  var vertexPositionData = [];
  var normalData = [];
  var indexData = [];
  var barycentricData = [];

  //We need twice the points
  width = width * 2;
  height = height * 2;

  { //Set all Vertex Points TODO Maybe center it?
    for(var row = 0; row < height; row++) {
      for(var col = 0; col < width; col++) {
        //X-Axis
        vertexPositionData.push(col);
        //Y-Axis (Flat surface!)
        vertexPositionData.push(0);
        //Z-Axis
        vertexPositionData.push(row);

        //The reflecion is pointed upwards - Y-Axis
        normalData.push(0);
        normalData.push(1);
        normalData.push(0);
      }
    }
  }

  { //Set all Indices
    for(var row=0; row < height -1; row++) {
      if(row > 0) {
        indexData.push(row * height);
      }
      for(var col=0; col < width; col++) {
        indexData.push((row * height) + col);
        indexData.push(((row+1) * height) + col);
      }

      if(row < height-2) {
        indexData.push((row+1)*height + (width-1));
      }
    }
  }

  return {
    position: vertexPositionData,
    normal: normalData,
    index: indexData
  };
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
  context.timeInMilliseconds = timeInMilliseconds;
  //Parameter: out, fieldofview, aspect ratio, near clipping, far clipping
  context.projectionMatrix = mat4.perspective(mat4.create(), glm.deg2rad(25), gl.drawingBufferWidth / gl.drawingBufferHeight, 0.01, 100);

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
  wirevs: 'shader/water.vs.glsl',
  wirefs: 'shader/water.fs.glsl',

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
