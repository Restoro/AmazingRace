//the OpenGL context
var gl = null;
//Rootnode for scene
var root = null;
var camera = null;
var lastFrameTime = 0;

var canvasWidth = 1200;
var canvasHeight = 500;

//Map for current state of keys
const keys = {};

/**
 * initializes OpenGL context, compile shader, and load buffers
 */
function init(resources) {
  //create a GL context
  gl = createContext(canvasWidth, canvasHeight);

  //enable blending + blending function (alphatexturing)
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  //depth buffering
  gl.enable(gl.DEPTH_TEST);

  initSkybox(resources,gl);
  initCamera();

  root = createSceneGraph(gl, resources);
  initInteraction(gl.canvas);

}

//Sets skyBox texture
function initSkybox(resources, gl) {
  let skyBox = new CubeMap(resources, gl);
  envcubetexture = skyBox.envcubetexture;
}

function initCamera() {
  camera = new Camera(false, vec3.fromValues(10 ,10,-70), 0, 0);

  //Camera path
  camera.addNextPosition(vec3.fromValues(15,10,-60), vec3.fromValues(60,0,0), "Sun (Light Source) Rising, Billboarding Trees, Car Driving");
  camera.addNextPosition(vec3.fromValues(30,5,-10), vec3.fromValues(40,0,20), "Dragon (Composed Model, Material) flying , Billboarding Trees, Car Driving");
  camera.addNextPosition(vec3.fromValues(35,5,20), vec3.fromValues(7.5,2.5,30), "Water (Material) moving, Billboarding Trees, Car Driving");
  camera.addNextPosition(vec3.fromValues(0,5,25), vec3.fromValues(-50,-1,5,40), "Water (Material) moving, Beachballs Jumping, Billboarding Trees, Car Driving");
  camera.addNextPosition(vec3.fromValues(-20,5,10), vec3.fromValues(-30,0,30), "Water (Material) moving, Beachball rolling, Fence (Alpha Texture), Car Driving");
  camera.addNextPosition(vec3.fromValues(-5,5,0), vec3.fromValues(-30,2.5,-30),"Icespikes (Comlex Objects), Car Driving");
  camera.addNextPosition(vec3.fromValues(-30,5,-10), vec3.fromValues(-10,2.5,-30), "Snowman (Composed Model, Material) Running, Sowman falling apart, Spotlight, Billboarding Trees, Car Driving");
}

function createSceneGraph(gl, resources) {
  var sunLight;
  var moonLight;
  const root = new ShaderSGNode(createProgram(gl, resources.materialvs, resources.materialfs));
  //skybox
  {
    //add skybox by putting large sphere around us
    let skyBox = new CubeMap(resources, gl);
    let envcubetexture = skyBox.envcubetexture;
    var skybox = new ShaderSGNode(createProgram(gl, resources.envvs, resources.envfs),[
        new EnvironmentSGNode(envcubetexture,4,false,
                    new RenderSGNode(makeSphere(200)))]);
    root.append(skybox);
  }

  //spotlight
  {
    let spotLight = new SpotLightSGNode();
    spotLight.dir = [0.7,-1,0];
    spotLight.cosineCutoff = 30;
    spotLight.exponent = 10.0;
    let translateLight = new TransformationSGNode(glm.transform({translate: [0.5,7,0]}), spotLight);

    let streetLampTexture = createImage2DTexture(resources.streetlamptexture);
    let streetLampTransform = new TransformationSGNode(glm.transform({translate: [0,0,0], scale:0.05}));
    let streetLamp = new MaterialSGNode(new TextureSGNode(streetLampTexture,0,new RenderSGNode(resources.streetlampmodel)));
    setMaterialParameter(streetLamp, [0.5,0.5,0.5,1], [0.5,0.5,0.5,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 0.4);
    streetLampTransform.append(streetLamp);
    let fullStreetLamp = new TransformationSGNode(glm.transform({translate: [0,-1.5,-45], rotateY:270}), [streetLampTransform, translateLight]);
    root.append(fullStreetLamp);
  }

  //sun
  {
    //initialize light
    sunLight = new LightSGNode(); //use now framework implementation of light node
    sunLight.ambient = [0.5, 0.5, 0.5, 1];
    sunLight.diffuse = [0.6, 0.6, 0.6, 1];
    sunLight.specular = [0, 0, 0, 1];
    sunLight.position = [0, 0, 0];

    let animateLight = new AnimationSGNode(mat4.create(), sunLight.position, camera, 1000, "Sun (Light Source) moving", { rotateZ: 0.005});
    let translateLight = new TransformationSGNode(glm.transform({translate: [150,5,0]})); //translating the light is the same as setting the light position
    animateLight.append(translateLight);
    translateLight.append(sunLight);

    let sunTexture = createImage2DTexture(resources.suntexture);
    let sun = new TextureSGNode(sunTexture,0,new RenderSGNode(makeSphere(16)));
    translateLight.append(sun); //add sphere for debugging: since we use 0,0,0 as our light position the sphere is at the same position as the light source

    root.append(animateLight);
  }

  //moon
  {
    moonLight = new LightSGNode(); //use now framework implementation of light node
    moonLight.ambient = [0.2, 0.2, 0.2, 1];
    moonLight.diffuse = [0.4, 0.4, 0.4, 1];
    moonLight.specular = [0, 0, 0, 1];
    moonLight.position = [0, 0, 0];
    moonLight.uniform = 'u_light2';

    let animateLight = new AnimationSGNode(mat4.create(), moonLight.position, camera, 1000, "Moon (Light Source) moving", { rotateZ: 0.005});
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
    let texture = createImage2DTexture(resources.metaltexture);
    let wheelTexture = createImage2DTexture(resources.wheeltexture);

    let carBodyFront = new MaterialSGNode([
        new RenderSGNode(Objects.makeCarBody(2,3,9.5))
      ]);
    setMaterialParameter(carBodyFront, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);

    let tireTransform = new TransformationSGNode(glm.transform({translate:[1.7,0.1,7.8], scale:[0.3,0.6,0.6], rotateY:180}));

    let tire = new MaterialSGNode([
        new RenderSGNode(makeSphere(1))
      ]);
    setMaterialParameter(tire, [0,0,0,1], [0,0,0,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    let tireAnimation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 100, "Wheel moving", {rotateX:-0.5}, [tire]);
    tireTransform.append(tireAnimation);
    carBodyFront.append(new TextureSGNode(wheelTexture, 0, tireTransform));

    let tire2Transform = new TransformationSGNode(glm.transform({translate:[-1.7,0.1,7.8], scale:[0.3,0.6,0.6]}));
    let tire2 = new MaterialSGNode([
        new RenderSGNode(makeSphere(1))
      ]);
    setMaterialParameter(tire2, [0,0,0,1], [0,0,0,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    let tire2Animation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 100, "Wheel moving", {rotateX:0.5}, [tire2]);
    tire2Transform.append(tire2Animation);
    carBodyFront.append(new TextureSGNode(wheelTexture, 0, tire2Transform));

    let carBodyBackTransform = new TransformationSGNode(glm.transform({translate:[0,0,7.57], rotateY:180}));
    let carBodyBack = new MaterialSGNode([
        new RenderSGNode(Objects.makeCarBody(2,3,9))
      ]);
    setMaterialParameter(carBodyBack, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carBodyBackTransform.append(new TextureSGNode(texture, 0, carBodyBack));

    let tire3Transform = new TransformationSGNode(glm.transform({translate:[1.7,0.1,7.35], scale:[0.3,0.6,0.6], rotateY:180}));
    let tire3 = new MaterialSGNode([
        new RenderSGNode(makeSphere(1))
      ]);
    setMaterialParameter(tire3, [0,0,0,1], [0,0,0,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    let tire3Animation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 100, "Wheel moving", {rotateX:0.5}, [tire3]);
    tire3Transform.append(tire3Animation);
    carBodyBackTransform.append(new TextureSGNode(wheelTexture, 0, tire3Transform));

    let tire4Transform = new TransformationSGNode(glm.transform({translate:[-1.7,0.1,7.35], scale:[0.3,0.6,0.6]}));
    let tire4 = new MaterialSGNode([
        new RenderSGNode(makeSphere(1))
      ]);
    setMaterialParameter(tire4, [0,0,0,1], [0,0,0,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    let tire4Animation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 100, "Wheel moving", {rotateX:-0.5}, [tire4]);
    tire4Transform.append(tire4Animation);
    carBodyBackTransform.append(new TextureSGNode(wheelTexture, 0, tire4Transform));

    let carBodyMiddleTransform = new TransformationSGNode(glm.transform({translate:[0,0.9,3.94], scale:[1,0.45,1]}));
    let carBodyMiddle = new MaterialSGNode([
        new RenderSGNode(Objects.makeCube(2))
      ]);
    setMaterialParameter(carBodyMiddle, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carBodyMiddleTransform.append(new TextureSGNode(texture, 0, carBodyMiddle));

    let carScreenLeftTransform = new TransformationSGNode(glm.transform({translate:[-1.9,3.5,1.9], scale:[0.1,1.5,0.1]}));
    let carScreenLeft = new MaterialSGNode([
        new RenderSGNode(Objects.makeCube(1))
      ]);
    setMaterialParameter(carScreenLeft, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carScreenLeftTransform.append(carScreenLeft);
    carBodyMiddleTransform.append(new TextureSGNode(texture, 0, carScreenLeftTransform));

    let carScreenRightTransform = new TransformationSGNode(glm.transform({translate:[1.9,3.5,1.9], scale:[0.1,1.5,0.1]}));
    let carScreenRight = new MaterialSGNode([
        new RenderSGNode(Objects.makeCube(1))
      ]);
    setMaterialParameter(carScreenRight, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carScreenRightTransform.append(carScreenRight);
    carBodyMiddleTransform.append(new TextureSGNode(texture, 0, carScreenRightTransform));

    let carScreenLeftBackTransform = new TransformationSGNode(glm.transform({translate:[-1.9,3.5,-1.9], scale:[0.1,1.5,0.1]}));
    let carScreenLeftBack = new MaterialSGNode([
        new RenderSGNode(Objects.makeCube(1))
      ]);
    setMaterialParameter(carScreenLeftBack, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carScreenLeftBackTransform.append(carScreenLeftBack);
    carBodyMiddleTransform.append(new TextureSGNode(texture, 0, carScreenLeftBackTransform));

    let carScreenRightBackTransform = new TransformationSGNode(glm.transform({translate:[1.9,3.5,-1.9], scale:[0.1,1.5,0.1]}));
    let carScreenRightBack = new MaterialSGNode([
        new RenderSGNode(Objects.makeCube(1))
      ]);
    setMaterialParameter(carScreenRightBack, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carScreenRightBackTransform.append(carScreenRightBack);
    carBodyMiddleTransform.append(new TextureSGNode(texture, 0, carScreenRightBackTransform));

    let carRoofTransform = new TransformationSGNode(glm.transform({translate:[0,5.2,0], scale:[2,0.2,2]}));
    let carRoof = new MaterialSGNode([
        new RenderSGNode(Objects.makeCube(1))
      ]);
    setMaterialParameter(carRoof, [0.9,0.9,0.9,1], [0.9,0.9,0.9,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carRoofTransform.append(carRoof);
    carBodyMiddleTransform.append(new TextureSGNode(texture, 0, carRoofTransform));

    let carInteriorTransform = new TransformationSGNode(glm.transform({translate:[0,3.5,0], scale:[1.9,1.5,1.9]}));
    let carInterior = new MaterialSGNode([
        new RenderSGNode(Objects.makeCube(1))
      ]);
    setMaterialParameter(carInterior, [0,0,0,1], [0,0,0,1], [0.75, 0.75, 0.75, 1], [0,0,0,1], 5);
    carInteriorTransform.append(carInterior);
    carBodyMiddleTransform.append(carInteriorTransform);

    let carNode = new TransformationSGNode(glm.transform({ translate: [0,-1,-33], scale:0.75, rotateY:90}));
    carNode.append(new TextureSGNode(texture, 0, carBodyFront));
    carNode.append(carBodyBackTransform);
    carNode.append(carBodyMiddleTransform);

    let carAnimation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 100, "Car driving", {rotateY:-0.012}, [carNode]);

    root.append(new TransformationSGNode(glm.transform({ translate: [0,0,-5]}), carAnimation));
  }

  //pool
  {
    //water in pool
    let waterShader = new ShaderSGNode(createProgram(gl, resources.envvs, resources.envfs));
    let waterNode = new WaterSGNode(modelRendererStrip(Objects.makeRectMesh(100,100)), true);
    let waterAnimation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 80, "Water moving", { waterWave:waterNode});
    waterAnimation.append(waterNode);
    let water = new MaterialSGNode();
    setMaterialParameter(water, [0.25098, 0.54313, 1, 0.165], [0.25098, 0.54313, 0.5, 0.165], [0.8, 0.8, 0.8, 0.165], [0,0,0,0.165], 50.0);
    water.append(waterAnimation);
    water.lights.push(sunLight);
    water.lights.push(moonLight);

    let reflectWater = new EnvironmentSGNode(envcubetexture, 4, true);
    reflectWater.append(water);

    waterShader.append(new TransformationSGNode(glm.transform({ translate: [-10,-0.7,-9.975], rotateX: 0, rotateY:0, scale: 0.20175}), [
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

    let completePool = new TransformationSGNode(glm.transform({ translate: [-35,-1,35], scale:0.81}), [poolObject]);
    root.append(completePool);
  }

  //floor
  {
    let floorTexture = createImage2DTexture(resources.floortexture);
    let floor = new MaterialSGNode(new TextureSGNode(floorTexture,0,new RenderSGNode(makeRect(25, 25))));
    setMaterialParameter(floor,[0,0,0,0] ,[0,0,0,0] , [0.0, 0.0, 0.0, 1], [0,0,0,0], 50.0);
    root.append(new TransformationSGNode(glm.transform({ translate: [0,-1.5,0], rotateX: -90, scale: 2}), [
      floor
    ]));
  }

//dragon
  {
    let animateRange = 75;
    let dragonleftfootMaterial  = new MaterialSGNode([new RenderSGNode(Objects.makeCube(0.2))]);
    setMaterialParameter(dragonleftfootMaterial,[0.05,0.2,0.0,1],[0.1,0.1,0.1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let dragonleftfoot = new TransformationSGNode(glm.transform({ translate: [0,0,0], scale:1.0}), [dragonleftfootMaterial]);
    let dragonLeftFootAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, animateRange, "Dragon (Composed Model, Material) flying", { rotateZSin:[0.01,-20,0]}, dragonleftfoot);
    dragonLeftFootAnimate.reset = true;
    let dragonrightfootMaterial  = new MaterialSGNode([new RenderSGNode(Objects.makeCube(0.2))]);
    setMaterialParameter(dragonrightfootMaterial, [0.05,0.2,0.0,1],[0.1,0.1,0.1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let dragonrightfoot = new TransformationSGNode(glm.transform({ translate: [0,0,0.8], scale:1.0}), [dragonrightfootMaterial]);
    let dragonRightFootAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, animateRange, "Dragon (Composed Model, Material) flying", { rotateZSin:[0.01,20,0]}, dragonrightfoot);
    dragonRightFootAnimate.reset = true;
    let dragonFeet = new TransformationSGNode(glm.transform({ translate: [0,0.5,0]}), [dragonLeftFootAnimate, dragonRightFootAnimate]);

    //eyes
    let eyeTexture = createImage2DTexture(resources.eyetexture);
    let dragonlefteyeMaterial  = new TextureSGNode(eyeTexture,0,new RenderSGNode(makeSphere(0.15)));
    let dragonlefteye = new TransformationSGNode(glm.transform({ translate: [0,0,0], rotateY: -50, scale:1.0}), [dragonlefteyeMaterial]);
    let dragonrighteyeMaterial  = new TextureSGNode(eyeTexture,0,new RenderSGNode(makeSphere(0.15)));
    let dragonrighteye = new TransformationSGNode(glm.transform({ translate: [0,0,0.6],rotateY: -55, scale:1.0}), [dragonrighteyeMaterial]);
    let dragonEyes = new TransformationSGNode(glm.transform({ translate: [0.6,1.2,0.1]}), [dragonlefteye, dragonrighteye]);

    //body
    let dragonbodyMaterial = new MaterialSGNode([new RenderSGNode(Objects.makeCube(0.6))]);
    setMaterialParameter(dragonbodyMaterial, [0.05,0.2,0.0,1],[0.1,0.1,0.1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let dragonbody = new TransformationSGNode(glm.transform({ translate: [0,1.17,0.4], scale:1.0}), [dragonbodyMaterial]);

    let dragonspikeMaterial = new MaterialSGNode([new RenderSGNode(makeRect(0.2,0.2))]);
    setMaterialParameter(dragonspikeMaterial, [0.6,0.0,0.0,1],[0.1,0.1,0.1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let dragonspike1 = new TransformationSGNode(glm.transform({ translate: [-0.3,1.75,0.4], rotateZ:60, scale:1.1}), [dragonspikeMaterial]);
    let dragonspike2 = new TransformationSGNode(glm.transform({ translate: [0.25,1.75,0.4], rotateZ:45, scale:1.1}), [dragonspikeMaterial]);
    let dragonspike3 = new TransformationSGNode(glm.transform({ translate: [-0.55,1.45,0.4], rotateZ:45, scale:1.1}), [dragonspikeMaterial]);
    let dragonspike4 = new TransformationSGNode(glm.transform({ translate: [-0.55,0.95,0.4], rotateZ:60, scale:1.3}), [dragonspikeMaterial]);
    let dragonSpikes = new TransformationSGNode(glm.transform({ translate: [0,0,0]}), [dragonspike1,dragonspike2,dragonspike3,dragonspike4]);

    //wings
    let dragonwingMaterial  = new MaterialSGNode([new RenderSGNode(makeRect(0.2,0.7))]);
    setMaterialParameter(dragonwingMaterial, [0.6,0.0,0.0,1],[0.1,0.1,0.1,1],[0.1, 0.1, 0.1, 1], [0,0,0,1], 1);
    let dragonrightwing = new TransformationSGNode(glm.transform({ translate: [-0.5,0,0.8],rotateZ: 10,rotateY: 10,rotateX:90}), [dragonwingMaterial]);
    let dragonrightWingAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, animateRange, "Dragon (Composed Model, Material) flying", { rotateXSin:[0.02,10,0]}, dragonrightwing);
    let dragonleftwing = new TransformationSGNode(glm.transform({ translate: [-0.5,0,-0.3],rotateZ: 10,rotateY: 10,rotateX:90}), [dragonwingMaterial]);
    let dragonleftWingAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, animateRange, "Dragon (Composed Model, Material) flying", { rotateXSin:[-0.02,10,0]}, dragonleftwing);
    let dragonWings = new TransformationSGNode(glm.transform({ translate: [0.6,1.2,0.1]}), [dragonleftWingAnimate, dragonrightWingAnimate]);

    let dragon = new TransformationSGNode(glm.transform({ translate: [40,-1.5,20], rotateY:160, scale:3.0}), [dragonbody,dragonFeet,dragonEyes,dragonSpikes,dragonWings]);
    let dragonAnimate = new AnimationSGNode(mat4.create(), [40,-1.5,20], camera, animateRange, "Dragon (Composed Model, Material) flying", { rotateZSin:[-0.005,1,0]}, dragon);
    dragonAnimate.reset = true;
    let dragonNodeStartFlying = new AnimationSGNode(mat4.create(), [40,-1.5,20], camera, animateRange, "Dragon (Composed Model, Material) flying", {translate:[0,0.005,0]}, dragonAnimate);
    dragonNodeStartFlying.maxDelta = 500;
    dragonNodeStartFlying.reset = true;

    root.append(new TransformationSGNode(glm.transform({ translate: [-4,-1,-7]}), [
      dragonNodeStartFlying
    ]));
  }

  //snowman
  {
    let snowManNode = new TransformationSGNode(glm.transform({ translate: [1.5,0,0], scale:1.0}));
    let snowManNodeAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 33, "Snowman (Composed Model, Material) moving", {rotateY:0.1}, [snowManNode]);

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


    let snowManArmRightMaterial = new MaterialSGNode([new RenderSGNode(Objects.makeCube(0.3))]);
    setMaterialParameter(snowManArmRightMaterial, [0.45,0.27,0.07,1],[0.45,0.27,0.07,1],[0.0, 0.0, 0.0, 1], [0,0,0,1], 1);
    let snowManArmRight = new TransformationSGNode(glm.transform({ translate: [0.65,0,0], scale:[1,0.2,0.2]}), [snowManArmRightMaterial]);

    let snowManArmRightAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 33, "Snowman (Composed Model, Material) moving",{ rotateZSin:[0.01,20,0]}, snowManArmRight);
    let snowManArmLeftAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 33, "Snowman (Composed Model, Material) moving",{ rotateZSin:[0.01,20,0]}, snowManArmLeft);
    let snowManArms = new TransformationSGNode(glm.transform({ translate: [0,0.7,0]}), [snowManArmLeftAnimate, snowManArmRightAnimate]);

    snowManNode.append(snowManLow);
    snowManNode.append(snowManMiddle);
    snowManNode.append(snowManHigh);
    snowManNode.append(snowManArms);

    root.append(new TransformationSGNode(glm.transform({ translate: [-5, -1,-30]}), [
      snowManNodeAnimate
    ]));

    let snowManNode2 = new TransformationSGNode(glm.transform({ translate: [1.5,0,0], scale:1.0}));
    let snowManHighAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 31, "Snowman falling apart", { rotateXSin:[0.0015,150,0]}, snowManHigh);
    snowManHighAnimate.maxDelta = 600;
    snowManHighAnimate.reset = true;
    let snowManMiddleAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 30, "Snowman falling apart", { rotateZSin:[-0.0015,150,0]}, snowManMiddle);
    snowManNode2.append(snowManHighAnimate);
    snowManNode2.append(snowManMiddleAnimate);
    snowManMiddleAnimate.maxDelta = 600;
    snowManMiddleAnimate.reset = true;
    snowManNode2.append(snowManLow);
    root.append(new TransformationSGNode(glm.transform({ translate: [-10,-1,-30]}), [
      snowManNode2
    ]));

  }

  //beachballs
  {
    let beachBallNode = new TransformationSGNode(glm.transform({ translate: [0,1,0], scale:1.0}));

    let beachBallTexture = createImage2DTexture(resources.beachballtexture);
    let beachBall = new TextureSGNode(beachBallTexture,0,new RenderSGNode(makeSphere(0.4)));
    beachBallNode.append(beachBall);

    let beachBallNodeAnimate = new AnimationSGNode(mat4.create(), [0,0,0], camera, 30, "Beachball rolling", {translate: [0.005,0,0], rotateZ:-0.20}, [beachBall]);
    beachBallNodeAnimate.maxDelta = 5000;
    beachBallNodeAnimate.reset = true;
    root.append(new TransformationSGNode(glm.transform({ translate: [-35,-1,22.5]}), [beachBallNodeAnimate]));
    let beachBallNodeAnimate2 = new AnimationSGNode(mat4.create(), [0,0,0], camera, 60, "Beachball jumping", {rotateXSin:[0.005,100,0]}, [beachBallNode]);
    root.append(new TransformationSGNode(glm.transform({ translate: [-33,1.5,0], rotateY:90, scale:5}), [beachBallNodeAnimate2]));
    let beachBallNodeAnimate3 = new AnimationSGNode(mat4.create(), [0,0,0], camera, 60, "Beachball jumping", {rotateXSin:[0.005,100,0]}, [beachBallNode]);
    root.append(new TransformationSGNode(glm.transform({ translate: [-12,0,17], rotateY:30, scale:2.5}), [beachBallNodeAnimate3]));

  }

  //wood fence and sharkshield
  {
    let fullFence = new TransformationSGNode(glm.transform({ translate: [-50,-0.5,-4], scale:1.0}));
    let fenceX = new TransformationSGNode(glm.transform({ translate: [0,0,0], scale:1.0}));
    for(var i=0; i < 14; i++) {
      let fenceTransform = new TransformationSGNode(glm.transform({ translate: [0,0,i*4], scale:1.0,rotateY:90, rotateZ:180}));
      let fenceTexture = createImage2DTexture(resources.woodfencetexture);
      let fence = new MaterialSGNode(new TextureSGNode(fenceTexture,0,new RenderSGNode(makeRect(2,1))));
      setMaterialParameter(fence, [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], 200);
      fenceTransform.append(fence);
      fenceX.append(fenceTransform);
    }
    let fenceY = new TransformationSGNode(glm.transform({ translate: [2,0,54], scale:1.0}));
    for(var i=0; i < 13; i++) {
      let fenceTransform = new TransformationSGNode(glm.transform({ translate: [i*4,0,0], scale:1.0, rotateZ:180}));
      let fenceTexture = createImage2DTexture(resources.woodfencetexture);
      let fence = new MaterialSGNode(new TextureSGNode(fenceTexture,0,new RenderSGNode(makeRect(2,1))));
      setMaterialParameter(fence, [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], 200);
      fenceTransform.append(fence);
      fenceY.append(fenceTransform);
    }
    let wholeSharkShield = new TransformationSGNode(glm.transform({ translate: [-30,-0.5,49]}));

    let sharkShieldTexture = createImage2DTexture(resources.sharkshieldtexture);
    let sharkShield = new MaterialSGNode(new TextureSGNode(sharkShieldTexture,0,new RenderSGNode(makeRect(2,1))));
    setMaterialParameter(sharkShield, [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], 200);
    let sharkShieldTransform = new TransformationSGNode(glm.transform({ translate: [0,1,-0.15], rotateZ:180}), sharkShield);
    wholeSharkShield.append(sharkShieldTransform);

    let sharkShieldPole = new MaterialSGNode(new RenderSGNode(Objects.makeCube(1)));
    setMaterialParameter(sharkShield, [0,0,0,0], [0,0,0,0], [0,0,0,0], [0,0,0,0], 200);
    let sharkShieldPoleTransform = new TransformationSGNode(glm.transform({ translate: [0,0,0], scale:[0.1,1.0,0.1]}), sharkShieldPole);
    wholeSharkShield.append(sharkShieldPoleTransform)

    fullFence.append(fenceX);
    fullFence.append(fenceY);
    root.append(fullFence);
    root.append(wholeSharkShield);
  }

  //icespikes
  {
    let iceSpikeTexture = createImage2DTexture(resources.icetexture);
    let iceSpike = new MaterialSGNode(new TextureSGNode(iceSpikeTexture,0,new RenderSGNode(Objects.makeIceSpikes(1.25,4.5))));
    let iceSpike2 = new MaterialSGNode(new TextureSGNode(iceSpikeTexture,0,new RenderSGNode(Objects.makeIceSpikes(1.5,5))));
    let iceSpike3 = new MaterialSGNode(new TextureSGNode(iceSpikeTexture,0,new RenderSGNode(Objects.makeIceSpikes(1.25,3.5))));

    let randomIce = [];
    for(var i=0; i < 30; i++) {
      let width = Math.random() * 2 + 0.25;
      let height = Math.random() * 5 + 1;
      let translateX = Math.random() * 15 + 3;
      let translateZ = Math.random() * 15 + 3;
      let rotY = Math.random() * 180;

      let iceSpikeRandom = new MaterialSGNode(new TextureSGNode(iceSpikeTexture,0,new RenderSGNode(Objects.makeIceSpikes(width,height))));
      let iceSpikeRandomMove = new TransformationSGNode(glm.transform({ translate: [translateX,0,translateZ], rotateY:rotY}), [
        iceSpikeRandom
      ]);
      randomIce.push(iceSpikeRandomMove)
    }


    let iceSpikeMove = new TransformationSGNode(glm.transform({ translate: [0,0,-2], scale:1}), [
      iceSpike
    ]);

    let iceSpikeMove2 = new TransformationSGNode(glm.transform({ translate: [0.5,0,-2.1], scale:1, rotateY:45}), [
      iceSpike2
    ]);

    let iceSpikeMove3 = new TransformationSGNode(glm.transform({ translate: [0.25,0,-2.25], scale:1, rotateY:90}), [
      iceSpike3
    ]);

    root.append(new TransformationSGNode(glm.transform({ translate: [-50,-1.5,-50]}), randomIce));

  }

  //tree
  {
    let treeTexture = createImage2DTexture(resources.treetexture);
    let tree = new MaterialSGNode(new TextureSGNode(treeTexture,0, new RenderSGNode(makeRect(1,1))));
    setMaterialParameter(tree,[0,0,0,0] , [0,0,0,0],[0.0, 0.0, 0.0, 0],[0,0,0,0],50.0 );

    let treeAnimation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 15000, "Billboarding Trees", { treeRotate:tree});
    treeAnimation.append(tree);

    root.append(new TransformationSGNode(glm.transform({ translate: [30,4.5,-40], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [30,4.5,-35], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [40,4.5,-40], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [30,4.5,40], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [0,4.5,10], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [10,4.5,0], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [15,4.5,0], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [15,4.5,15], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [0,4.5,15], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [20,4.5,5], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [15,4.5,9], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [40,4.5,-4], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [20,4.5,45], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [35,4.5,35], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [15,4.5,35], scale: 6}), [ treeAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [15,4.5,15], scale: 6}), [ treeAnimation]));

  }
  //palmtree
  {
    let palmTexture = createImage2DTexture(resources.palmtexture);
    let palm = new MaterialSGNode(new TextureSGNode(palmTexture,0, new RenderSGNode(makeRect(1,1))));
    setMaterialParameter(palm,[0,0,0,0] , [0,0,0,0],[0.0, 0.0, 0.0, 0],[0,0,0,0],50.0 );
    let palmAnimation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 15000, "Billboarding Trees", { treeRotate:palm});
    palmAnimation.append(palm);

    root.append(new TransformationSGNode(glm.transform({ translate: [-40,4.5,20], scale: 6}), [ palmAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [-10,4.5,10], scale: 6}), [ palmAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [-38,4.5,13], scale: 6}), [ palmAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [-10,4.5,40], scale: 6}), [ palmAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [-18,4.5,45], scale: 6}), [ palmAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [-5,4.5,5], scale: 6}), [ palmAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [-10,4.5,5], scale: 6}), [ palmAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [-5,4.5,42], scale: 6}), [ palmAnimation]));

  }

  //fir
  {
    let firTexture = createImage2DTexture(resources.firtexture);
      let fir = new MaterialSGNode(new TextureSGNode(firTexture,0,new RenderSGNode(makeRect(1,1))));
    setMaterialParameter(fir,[0,0,0,0] , [0,0,0,0],[0.0, 0.0, 0.0, 0],[0,0,0,0],50.0 );

    let firAnimation = new AnimationSGNode(mat4.create(), [0,0,0], camera, 15000, "Billboarding Trees", { treeRotate:fir});
    firAnimation.append(fir);

    root.append(new TransformationSGNode(glm.transform({ translate: [35,4.5,30], scale: 6}), [ firAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [40,4.5,-25], scale: 6}), [ firAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [10,4.5,-25], scale: 6}), [ firAnimation]));
    root.append(new TransformationSGNode(glm.transform({ translate: [15,4.5,-15], scale: 6}), [ firAnimation]));
  }

  return root;
}

//callby reference
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
    if(camera.enable) {
    mouse.pos = toPos(event);
    mouse.leftButtonDown = event.button === 0;
    }
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
      case "KeyC":
      if(!camera.enable)
        camera.enable = true;
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

  camera.proccessMovement(keys, deltaTime);

  context.viewMatrix = camera.computeViewMatrix();
  context.invViewMatrix = mat4.invert(mat4.create(), context.viewMatrix);
  camera.clearDisplayText();
  root.render(context);
  camera.showDisplayText();
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
  floortexture: 'models/floorhole.png',
  suntexture: 'models/sun.jpg',
  moontexture: 'models/moon.jpg',
  pooltexture: 'models/poolMosaic.jpg',
  palmtexture: 'models/Palme.png',
  woodtexture: 'models/woodTexture.jpg',
  icetexture: 'models/icetexture.jpg',
  poolladdermodel: 'models/poolladder.obj',
  metaltexture: 'models/metalTexture.jpg',
  wheeltexture: 'models/wheelTexture.jpg',
  beachballtexture: 'models/beachballTexture.jpg',
  woodfencetexture: 'models/woodFence.png',
  sharkshieldtexture: 'models/sharkShield.png',
  firtexture: 'models/fir.png',
  streetlampmodel: 'models/streetlamp.obj',
  streetlamptexture: 'models/lampMetal.jpg',
  eyetexture: 'models/eye.png',

  env_pos_x: 'skybox/sky/skyposx1.png',
  env_neg_x: 'skybox/sky/skynegx1.png',
  env_pos_y: 'skybox/sky/skyposy1.png',
  env_neg_y: 'skybox/sky/skynegy1.png',
  env_pos_z: 'skybox/sky/skyposz1.png',
  env_neg_z: 'skybox/sky/skynegz1.png'

}).then(function (resources /*an object containing our keys with the loaded resources*/) {
  init(resources);

  //render one frame
  render();
});
