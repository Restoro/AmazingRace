class Objects {

  static makeRectMesh(width, height) {
    var vertexPositionData = [];
    var normalData = [];
    var indexData = [];

    //We need twice the points
    width = width*2;
    height = height*2;

    { //Set all Vertex Points
      for(var row = 0; row < height; row++) {
        for(var col = 0; col < width; col++) {
          //X-Axis
          vertexPositionData.push(col);
          //Y-Axis (Flat surface!)
          vertexPositionData.push(0);
          //Z-Axis
          vertexPositionData.push(row);

          //The reflection is pointed upwards - Y-Axis
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

  static makeIceSpikes(width, height) {

    var edgeWidth = width/6;
    var spikeVertices = new Float32Array([

      0, 0, 0, /**/ width, 0,0, /**/ width, height/3, 0, /**/ 0, height/2, 0,
      width, 0,0, /**/ width + edgeWidth, 0, 0-edgeWidth, /**/ width + edgeWidth, height/3, 0-edgeWidth, /**/ width, height/3, 0,
      width + edgeWidth, 0, 0-edgeWidth, /**/ width + edgeWidth, 0, -width, /**/ width + edgeWidth, height/2, -width, /**/ width + edgeWidth, height/3, 0-edgeWidth,
      width + edgeWidth, 0, -width, /**/ width, 0, -width-edgeWidth, /**/ width, height/2, -width-edgeWidth, /**/ width + edgeWidth, height/2, -width,
      width, 0, -width-edgeWidth, /**/ 0, 0, -width-edgeWidth, /**/ 0, height/3, -width-edgeWidth, /**/ width, height/2, -width-edgeWidth,
      0, 0, -width-edgeWidth, /**/ 0-edgeWidth, 0, -width, /**/ 0-edgeWidth, height/3, -width, /**/ 0, height/3, -width-edgeWidth,
      0-edgeWidth, 0, -width, /**/ 0-edgeWidth, 0, 0-edgeWidth, /**/ 0-edgeWidth, height/2, 0-edgeWidth, /**/ 0-edgeWidth, height/3, -width,
      0-edgeWidth, 0, 0-edgeWidth, /**/ 0,0,0, /**/ 0,height/2,0, /**/ 0-edgeWidth, height/2, 0-edgeWidth,

      width, height/3, 0, /**/  width + edgeWidth, height/3, 0-edgeWidth, /**/  width, height/3+edgeWidth, 0-edgeWidth*2,  /**/ width-edgeWidth, height/3+edgeWidth, 0-edgeWidth,
      width + edgeWidth, height/2, -width, /**/ width, height/2, -width-edgeWidth, /**/ width-edgeWidth, height/2 +edgeWidth, -width, /**/ width, height/2 +edgeWidth, -width+edgeWidth,
      0, height/3, -width-edgeWidth, /**/ 0-edgeWidth, height/3, -width, /**/ 0, height/3+edgeWidth, -width+edgeWidth, /**/ edgeWidth, height/3+edgeWidth, -width,
      0-edgeWidth, height/2, 0-edgeWidth, /**/ 0,height/2,0, /**/ 0+edgeWidth,height/2+edgeWidth,0-edgeWidth, /**/ 0, height/2+edgeWidth, 0-edgeWidth*2,

      width + edgeWidth, height/3, 0-edgeWidth, /**/ width + edgeWidth, height/2, -width, /**/ width, height/2 +edgeWidth, -width+edgeWidth, /**/ width, height/3+edgeWidth, 0-edgeWidth*2,
      width, height/2, -width-edgeWidth, /**/ 0, height/3, -width-edgeWidth, /**/ edgeWidth, height/3+edgeWidth, -width, /**/  width-edgeWidth, height/2 +edgeWidth, -width,
      0-edgeWidth, height/3, -width, /**/ 0-edgeWidth, height/2, 0-edgeWidth, /**/ 0, height/2+edgeWidth, 0-edgeWidth*2, /**/ 0, height/3+edgeWidth, -width+edgeWidth,
      0,height/2,0, /**/ width, height/3, 0, /**/ width-edgeWidth, height/3+edgeWidth, 0-edgeWidth,  /**/ 0+edgeWidth,height/2+edgeWidth,0-edgeWidth,

      0+edgeWidth,height/2+edgeWidth,0-edgeWidth, /**/ width-edgeWidth, height/3+edgeWidth, 0-edgeWidth, /**/ width-edgeWidth, height, 0-edgeWidth, /**/ 0+edgeWidth,3*height/4,0-edgeWidth,
      width-edgeWidth, height/3+edgeWidth, 0-edgeWidth, /**/ width, height/3+edgeWidth, 0-edgeWidth*2,  /**/ width, height, 0-edgeWidth*2,  /**/ width-edgeWidth, height, 0-edgeWidth,
      width, height/3+edgeWidth, 0-edgeWidth*2,  /**/ width, height/2 +edgeWidth, -width+edgeWidth, /**/ width, 3*height/4, -width+edgeWidth, /**/ width, height, 0-edgeWidth*2,
      width, height/2 +edgeWidth, -width+edgeWidth, /**/ width-edgeWidth, height/2 +edgeWidth, -width, /**/ width-edgeWidth, 3*height/4, -width, /**/ width, 3*height/4, -width+edgeWidth,
      width-edgeWidth, height/2 +edgeWidth, -width, /**/ edgeWidth, height/3+edgeWidth, -width, /**/ edgeWidth, height, -width, /**/ width-edgeWidth, 3*height/4, -width,
      edgeWidth, height/3+edgeWidth, -width, /**/ 0, height/3+edgeWidth, -width+edgeWidth, /**/ 0, height, -width+edgeWidth, /**/ edgeWidth, height, -width,
      0, height/3+edgeWidth, -width+edgeWidth, /**/ 0, height/2+edgeWidth, 0-edgeWidth*2, /**/ 0, 3*height/4, 0-edgeWidth*2, /**/ 0, height, -width+edgeWidth,
      0, height/2+edgeWidth, 0-edgeWidth*2, /**/ 0+edgeWidth,height/2+edgeWidth,0-edgeWidth, /**/ 0+edgeWidth,3*height/4,0-edgeWidth, /**/ 0, 3*height/4, 0-edgeWidth*2,

      width-edgeWidth, height, 0-edgeWidth, /**/ width, height, 0-edgeWidth*2,  /**/  width-edgeWidth, height+edgeWidth, 0-edgeWidth*3, /**/ width-edgeWidth*2, height+edgeWidth, 0-edgeWidth*2,
      width, 3*height/4, -width+edgeWidth, /**/ width-edgeWidth, 3*height/4, -width, /**/ width-edgeWidth*2, 3*height/4+edgeWidth, -width+edgeWidth, /**/ width-edgeWidth, 3*height/4+edgeWidth, -width+edgeWidth*2,
      edgeWidth, height, -width, /**/ 0, height, -width+edgeWidth, /**/  0+edgeWidth, height+edgeWidth, -width+edgeWidth*2, /**/ edgeWidth*2, height+edgeWidth, -width+edgeWidth,
      0, 3*height/4, 0-edgeWidth*2, /**/  0+edgeWidth,3*height/4,0-edgeWidth, /**/  0+edgeWidth*2,3*height/4+edgeWidth,0-edgeWidth*2, /**/ 0+edgeWidth, 3*height/4+edgeWidth, 0-edgeWidth*3,

      width, height, 0-edgeWidth*2,  /**/ width, 3*height/4, -width+edgeWidth, /**/ width-edgeWidth, 3*height/4+edgeWidth, -width+edgeWidth*2, /**/  width-edgeWidth, height+edgeWidth, 0-edgeWidth*3,
      width-edgeWidth, 3*height/4, -width, /**/ edgeWidth, height, -width, /**/ edgeWidth*2, height+edgeWidth, -width+edgeWidth, /**/ width-edgeWidth*2, 3*height/4+edgeWidth, -width+edgeWidth,
      0, height, -width+edgeWidth, /**/ 0, 3*height/4, 0-edgeWidth*2, /**/  0+edgeWidth, 3*height/4+edgeWidth, 0-edgeWidth*3, /**/ 0+edgeWidth, height+edgeWidth, -width+edgeWidth*2,
      0+edgeWidth,3*height/4,0-edgeWidth, /**/   width-edgeWidth, height, 0-edgeWidth, /**/ width-edgeWidth*2, height+edgeWidth, 0-edgeWidth*2, /**/  0+edgeWidth*2,3*height/4+edgeWidth,0-edgeWidth*2,

      width-edgeWidth, 3*height/4+edgeWidth, -width+edgeWidth*2, /**/width-edgeWidth*2, 3*height/4+edgeWidth, -width+edgeWidth, /**/ edgeWidth*2, height+edgeWidth, -width+edgeWidth, /**/ width-edgeWidth, height+edgeWidth, 0-edgeWidth*3,
      0+edgeWidth, 3*height/4+edgeWidth, 0-edgeWidth*3, /**/ 0+edgeWidth*2,3*height/4+edgeWidth,0-edgeWidth*2, /**/  width-edgeWidth*2, height+edgeWidth, 0-edgeWidth*2, /**/ 0+edgeWidth, height+edgeWidth, -width+edgeWidth*2,
      width-edgeWidth*2, height+edgeWidth, 0-edgeWidth*2, /**/ width-edgeWidth, height+edgeWidth, 0-edgeWidth*3, /**/  edgeWidth*2, height+edgeWidth, -width+edgeWidth, /**/ 0+edgeWidth, height+edgeWidth, -width+edgeWidth*2,
    ]);


    var spikeNormals = new Float32Array([
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      1,0,1, 1,0,1, 1,0,1, 1,0,1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      1,0,-1, 1,0,-1, 1,0,-1, 1,0,-1,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      -1,0,-1, -1,0,-1, -1,0,-1, -1,0,-1,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      -1,0,1, -1,0,1, -1,0,1, -1,0,1,

      1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1,
      1,edgeWidth,-1, 1,edgeWidth,-1, 1,edgeWidth,-1, 1,edgeWidth,-1,
      -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1,
      -1,edgeWidth,1, -1,edgeWidth,1, -1,edgeWidth,1, -1,edgeWidth,1,

      1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,-1, 1,edgeWidth,-1,
      1,edgeWidth,-1, 1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1,
      -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,1, -1,edgeWidth,1,
      -1,edgeWidth,1, -1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1,

      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      1,0,1, 1,0,1, 1,0,1, 1,0,1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      1,0,-1, 1,0,-1, 1,0,-1, 1,0,-1,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      -1,0,-1, -1,0,-1, -1,0,-1, -1,0,-1,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      -1,0,1, -1,0,1, -1,0,1, -1,0,1,

      1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1,
      1,edgeWidth,-1, 1,edgeWidth,-1, 1,edgeWidth,-1, 1,edgeWidth,-1,
      -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1,
      -1,edgeWidth,1, -1,edgeWidth,1, -1,edgeWidth,1, -1,edgeWidth,1,

      1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,-1, 1,edgeWidth,-1,
      1,edgeWidth,-1, 1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1,
      -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,1, -1,edgeWidth,1,
      -1,edgeWidth,1, -1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1,

      1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1, 1,edgeWidth,1,
      -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1, -1,edgeWidth,-1,

      0,1,0, 0,1,0, 0,1,0, 0,1,0
    ]);

    var spikeIndexData = [];
    for(var i=0; i < spikeVertices.length/3; i+=4) {
      spikeIndexData.push(i)
      spikeIndexData.push(i+1);
      spikeIndexData.push(i+2);
      spikeIndexData.push(i);
      spikeIndexData.push(i+2);
      spikeIndexData.push(i+3);
    }

    var spikeTexture = [];
    for (var i=0; i < spikeVertices.length; i+=12) {
      spikeTexture.push(0);
      spikeTexture.push(0);
      spikeTexture.push(1);
      spikeTexture.push(0);
      spikeTexture.push(1);
      spikeTexture.push(1);
      spikeTexture.push(0);
      spikeTexture.push(1);
    }

    return {
      position: spikeVertices,
      normal: spikeNormals,
      index: spikeIndexData,
      texture: spikeTexture
    };
  }

  static makePoolEdge(width, depth) {
    const offset = 3;
    const height = 0.5
    var edgeVertices = new Float32Array([
       -(width+offset),0,-depth, /**/ (width+offset),0,-depth, /**/(width+offset), 0,-(depth+offset), /**/-(width+offset), 0,-(depth+offset), //Back extend
       -(width+offset),0,depth, /**/ (width+offset),0,depth, /**/(width+offset), 0,(depth+offset), /**/-(width+offset), 0,(depth+offset), //Front extend
       -width,-0,-depth, /**/-width, 0,depth, /**/-(width+offset), 0, depth,/**/-(width+offset),-0, -depth, //Left extend
       width,-0,-depth, /**/width, 0,depth, /**/(width+offset), 0, depth,/**/(width+offset),-0, -depth, //Right extend
       (width+offset), -height,-(depth+offset), /**/-(width+offset), -height,-(depth+offset), /**/-(width+offset), 0,-(depth+offset), /**/ (width+offset), 0,-(depth+offset),  //Back extend height
       (width+offset), -height,(depth+offset), /**/-(width+offset), -height,(depth+offset), /**/-(width+offset), 0,(depth+offset), /**/ (width+offset), 0,(depth+offset),  //Front extend height
       -(width+offset), -height,-(depth+offset), /**/ -(width+offset), -height,(depth+offset), /**/ -(width+offset), 0,(depth+offset), /**/-(width+offset), 0,-(depth+offset),  //Left extend height
       (width+offset), -height,-(depth+offset), /**/ (width+offset), -height,(depth+offset),/**/ (width+offset), 0,(depth+offset), /**/(width+offset), 0,-(depth+offset),  //Left extend height
    ]);


    var edgeNormals = new Float32Array([
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0
    ]);

    var edgeIndexData = [];
    for(var i=0; i < edgeVertices.length/3; i+=4) {
      edgeIndexData.push(i)
      edgeIndexData.push(i+1);
      edgeIndexData.push(i+2);
      edgeIndexData.push(i);
      edgeIndexData.push(i+2);
      edgeIndexData.push(i+3);
    }

    var edgeTexture = new Float32Array([
        0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
        0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
        0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
        0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
        0, 0 /**/, 0.7, 0 /**/, 0.7, 0.15 /**/, 0, 0.15,
        0, 0 /**/, 0.7, 0 /**/, 0.7, 0.15 /**/, 0, 0.15,
        0, 0 /**/, 0.7, 0 /**/, 0.7, 0.15 /**/, 0, 0.15,
        0, 0 /**/, 0.7, 0 /**/, 0.7, 0.15 /**/, 0, 0.15,
     ]);

   return {
     position: edgeVertices,
     normal: edgeNormals,
     index: edgeIndexData,
     texture: edgeTexture
   };
  }

  static makeCarBody(width, height, depth) {
    var bodyVertices = new Float32Array([
      -width,0, depth, /**/ width,0, depth, /**/ width, height/2, depth, /**/-width, height/2, depth, //Front
      -width, height/2,depth, /**/  width, height/2,depth, /**/  width, (height+0.6)/2, 1.25*depth/2, /**/ -width, (height+0.6)/2,1.25*depth/2, //bonnet

      width,0, depth, /**/ width, 0, 8*depth/9, /**/ width, (height+0.2)/2, 8*depth/9, /**/  width, height/2, depth, //Side Right
      width, height/3.5, 8*depth/9, /**/ width, height/3.5, 3*depth/4, /**/ width, (height+0.4)/2, 3*depth/4, /**/ width, (height+0.2)/2, 8*depth/9, //Side Right above wheel
      width, 0, 3*depth/4, /**/ width, 0, 1.25*depth/2, /**/ width, (height+0.6)/2, 1.25*depth/2, /**/ width, (height+0.4)/2, 3*depth/4, //Side right

      width, 0, 8*depth/9, /**/ 5*width/8, 0, 8*depth/9, /**/ 5*width/8, height/3.5, 8*depth/9, /**/ width, height/3.5, 8*depth/9, //Side right front wheel
      5*width/8, height/3.5, 8*depth/9, /**/ width, height/3.5, 8*depth/9, /**/ width, height/3.5, 3*depth/4, /**/ 5*width/8, height/3.5, 3*depth/4,
      5*width/8, 0, 3*depth/4, /**/ width, 0, 3*depth/4, /**/ width, height/3.5, 3*depth/4, /**/ 5*width/8, height/3.5, 3*depth/4,
       5*width/8, 0, 8*depth/9, /**/ 5*width/8, 0, 3*depth/4, /**/ 5*width/8, height/3.5, 3*depth/4, /**/ 5*width/8, height/3.5, 8*depth/9,

      -width,0, depth, /**/ -width, 0, 8*depth/9, /**/ -width, (height+0.2)/2, 8*depth/9, /**/  -width, height/2, depth, //Side Left
      -width, height/3.5, 8*depth/9, /**/ -width, height/3.5, 3*depth/4, /**/ -width, (height+0.4)/2, 3*depth/4, /**/ -width, (height+0.2)/2, 8*depth/9, //Side Left above wheel
      -width, 0, 3*depth/4, /**/ -width, 0, 1.25*depth/2, /**/ -width, (height+0.6)/2, 1.25*depth/2, /**/ -width, (height+0.4)/2, 3*depth/4, //Side Left

      -width, 0, 8*depth/9, /**/ 5*-width/8, 0, 8*depth/9, /**/ 5*-width/8, height/3.5, 8*depth/9, /**/ -width, height/3.5, 8*depth/9, //Side left front wheel
      5*-width/8, height/3.5, 8*depth/9, /**/ -width, height/3.5, 8*depth/9, /**/ -width, height/3.5, 3*depth/4, /**/ 5*-width/8, height/3.5, 3*depth/4,
      5*-width/8, 0, 3*depth/4, /**/ -width, 0, 3*depth/4, /**/ -width, height/3.5, 3*depth/4, /**/ 5*-width/8, height/3.5, 3*depth/4,
       5*-width/8, 0, 8*depth/9, /**/ 5*-width/8, 0, 3*depth/4, /**/ 5*-width/8, height/3.5, 3*depth/4, /**/ 5*-width/8, height/3.5, 8*depth/9,
    ]);

    var bodyNormals = new Float32Array([
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
    ]);


    var bodyIndexData = [];
    for(var i=0; i < bodyVertices.length/3; i+=4) {
      bodyIndexData.push(i)
      bodyIndexData.push(i+1);
      bodyIndexData.push(i+2);
      bodyIndexData.push(i);
      bodyIndexData.push(i+2);
      bodyIndexData.push(i+3);
    }

    var bodyTextures = [];
    for (var i=0; i < bodyVertices.length; i+=12) {
      bodyTextures.push(0);
      bodyTextures.push(0);
      bodyTextures.push(1);
      bodyTextures.push(0);
      bodyTextures.push(1);
      bodyTextures.push(1);
      bodyTextures.push(0);
      bodyTextures.push(1);
    }

    return {
      position: bodyVertices,
      index: bodyIndexData,
      normal: bodyNormals,
      texture: bodyTextures
    }
  }

  static makePool(width, depth, height) {
    var cubeVertices = new Float32Array([
       -width,-height,-depth, /**/ width,-height,-depth, /**/width, 0,-depth, /**/-width, 0,-depth, //Back
       -width,-height, depth, /**/ width,-height, depth, /**/width, 0, depth, /**/-width, 0, depth, //Front
       -width,-height,-depth, /**/-width, 0,-depth, /**/-width, 0, depth,/**/-width,-height, depth, //Left
        width,-height,-depth, /**/ width, 0,-depth, /**/width, 0, depth, /**/width,-height, depth, //Right
       -width,-height,-depth, /**/-width,-height, depth, /**/width,-height, depth, /**/width,-height,-depth, //Bottom
    ]);

    var cubeNormals = new Float32Array([
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      0,1,0, 0,1,0, 0,1,0, 0,1,0,
    ]);

    var cubeIndices =  new Float32Array([
       0,1,2, 0,2,3,
       4,5,6, 4,6,7,
       8,9,10, 8,10,11,
       12,13,14, 12,14,15,
       16,17,18, 16,18,19,
    ]);

    var cubeTextures = new Float32Array([
       0, 0 /**/, 1, 0 /**/, 1 ,(1/height) /**/, 0, (1/height),
       0, 0 /**/, 1, 0 /**/, 1, (1/height) /**/, 0, (1/height),
       0, 0 /**/, (1/height), 0 /**/, (1/height), 1 /**/, 0, 1,
       0, 0 /**/, (1/height), 0 /**/, (1/height), 1 /**/, 0, 1,
       0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
    ]);

    var cubeTextures = [];
    for (var i=0; i < cubeVertices.length; i+=12) {
      cubeTextures.push(0);
      cubeTextures.push(0);
      cubeTextures.push(1);
      cubeTextures.push(0);
      cubeTextures.push(1);
      cubeTextures.push(1);
      cubeTextures.push(0);
      cubeTextures.push(1);
    }

    return {
      position: cubeVertices,
      normal: cubeNormals,
      index: cubeIndices,
      texture: cubeTextures
    };
  }

  static makeCube(s) {
    var cubeVertices = new Float32Array([
       -s,-s,-s, s,-s,-s, s, s,-s, -s, s,-s, //Back
       -s,-s, s, s,-s, s, s, s, s, -s, s, s, //Front
       -s,-s,-s, -s, s,-s, -s, s, s, -s,-s, s, //Left
       s,-s,-s, s, s,-s, s, s, s, s,-s, s, //Right
       -s,-s,-s, -s,-s, s, s,-s, s, s,-s,-s, //Bottom
       -s, s,-s, -s, s, s, s, s, s, s, s,-s, //Top
    ]);

    var cubeNormals = new Float32Array([
       0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
       0,0,1, 0,0,1, 0,0,1, 0,0,1,
       -1,0,0, -1,0,0, -1,0,0, -1,0,0,
       1,0,0, 1,0,0, 1,0,0, 1,0,0,
       0,-1,0, 0,-1,0, 0,-1,0, 0,-1,0,
       0,1,0, 0,1,0, 0,1,0, 0,1,0
    ]);

    var cubeIndices =  new Float32Array([
       0,1,2, 0,2,3,
       4,5,6, 4,6,7,
       8,9,10, 8,10,11,
       12,13,14, 12,14,15,
       16,17,18, 16,18,19,
       20,21,22, 20,22,23
    ]);

    var cubeTextures = [];
    for (var i=0; i < cubeVertices.length; i+=12) {
      cubeTextures.push(0);
      cubeTextures.push(0);
      cubeTextures.push(1);
      cubeTextures.push(0);
      cubeTextures.push(1);
      cubeTextures.push(1);
      cubeTextures.push(0);
      cubeTextures.push(1);
    }

    return {
      position: cubeVertices,
      normal: cubeNormals,
      index: cubeIndices,
      texture: cubeTextures
    };
  }
}
