class Objects {

  static makeRectMesh(width, height) {
    var vertexPositionData = [];
    var normalData = [];
    var indexData = [];

    //We need twice the points
    width = width*2;
    height = height*2;

    { //Set all Vertex Points TODO Maybe center it?
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
      -width, height/2,depth, /**/  width, height/2,depth, /**/  width, (height+0.12)/2, 1.25*depth/2, /**/ -width, (height+0.12)/2,1.25*depth/2, //bonnet

      width,0, depth, /**/ width, 0, 8*depth/9, /**/ width, (height+0.04)/2, 8*depth/9, /**/  width, height/2, depth, //Side Right
      width, height/3.5, 8*depth/9, /**/ width, height/3.5, 3*depth/4, /**/ width, (height+0.08)/2, 3*depth/4, /**/ width, (height+0.04)/2, 8*depth/9, //Side Right above wheel
      width, 0, 3*depth/4, /**/ width, 0, 1.25*depth/2, /**/ width, (height+0.12)/2, 1.25*depth/2, /**/ width, (height+0.08)/2, 3*depth/4, //Side right

      width, 0, 8*depth/9, /**/ 5*width/8, 0, 8*depth/9, /**/ 5*width/8, height/3.5, 8*depth/9, /**/ width, height/3.5, 8*depth/9, //Side right front wheel
      5*width/8, height/3.5, 8*depth/9, /**/ width, height/3.5, 8*depth/9, /**/ width, height/3.5, 3*depth/4, /**/ 5*width/8, height/3.5, 3*depth/4,
      5*width/8, 0, 3*depth/4, /**/ width, 0, 3*depth/4, /**/ width, height/3.5, 3*depth/4, /**/ 5*width/8, height/3.5, 3*depth/4,
       5*width/8, 0, 8*depth/9, /**/ 5*width/8, 0, 3*depth/4, /**/ 5*width/8, height/3.5, 3*depth/4, /**/ 5*width/8, height/3.5, 8*depth/9,

      -width,0, depth, /**/ -width, 0, 8*depth/9, /**/ -width, (height+0.04)/2, 8*depth/9, /**/  -width, height/2, depth, //Side Left
      -width, height/3.5, 8*depth/9, /**/ -width, height/3.5, 3*depth/4, /**/ -width, (height+0.08)/2, 3*depth/4, /**/ -width, (height+0.04)/2, 8*depth/9, //Side Left above wheel
      -width, 0, 3*depth/4, /**/ -width, 0, 1.25*depth/2, /**/ -width, (height+0.12)/2, 1.25*depth/2, /**/ -width, (height+0.08)/2, 3*depth/4, //Side Left

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

    return {
      position: bodyVertices,
      index: bodyIndexData,
      normal: bodyNormals
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

    return {
      position: cubeVertices,
      normal: cubeNormals,
      index: cubeIndices,
      texture: cubeTextures
    };
  }

  static makeContainer(width, depth, height) {
    var containerVertices = new Float32Array([
       -width,-height,-depth, /**/ width,-height,-depth, /**/width, 0,-depth, /**/-width, 0,-depth, //Back
       -width,-height, depth, /**/ width,-height, depth, /**/width, 0, depth, /**/-width, 0, depth, //Front
       -width,-height,-depth, /**/-width, 0,-depth, /**/-width, 0, depth,/**/-width,-height, depth, //Left
        width,-height,-depth, /**/ width, 0,-depth, /**/width, 0, depth, /**/width,-height, depth, //Right
       -width,-height,-depth, /**/-width,-height, depth, /**/width,-height, depth, /**/width,-height,-depth //Bottom
    ]);

    var containerNormals = new Float32Array([
      0,0,1, 0,0,1, 0,0,1, 0,0,1,
      0,0,-1, 0,0,-1, 0,0,-1, 0,0,-1,
      1,0,0, 1,0,0, 1,0,0, 1,0,0,
      -1,0,0, -1,0,0, -1,0,0, -1,0,0,
      0,1,0, 0,1,0, 0,1,0, 0,1,0
    ]);

    var containerIndices =  new Float32Array([
       0,1,2, 0,2,3,
       4,5,6, 4,6,7,
       8,9,10, 8,10,11,
       12,13,14, 12,14,15,
       16,17,18, 16,18,19
    ]);

    var containerTextures = new Float32Array([
       0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
       0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
       0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
       0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
       0, 0 /**/, 1, 0 /**/, 1, 1 /**/, 0, 1,
    ]);

    return {
      position: containerVertices,
      normal: containerNormals,
      index: containerIndices,
      texture: containerTextures
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

    return {
      position: cubeVertices,
      normal: cubeNormals,
      index: cubeIndices
    };
  }

  //Not the best Implementation...
  //Use makeSphere and scale it
  //TODO Delete this method if sure it wont be used!
  static makeTire(radius, segments, z) {
    var vertexPositionData = [];
    var normalData = [];
    var indexData = [];

    let startIndex = 0;
    startIndex = this.pushVertexCircle(vertexPositionData, normalData, indexData, radius, segments, 1, startIndex);
    //console.log(startIndex);
    let endIndex = this.pushVertexCircle(vertexPositionData, normalData, indexData, radius, segments, 0, startIndex);

    for(var seg=1; seg <= segments; seg++) {
      indexData.push(seg);
      indexData.push(startIndex+seg);
      if(seg+1 == startIndex) {
        indexData.push(1);
      } else {
        indexData.push(seg+1);
      }
      indexData.push(seg+1);
      indexData.push(startIndex+seg);
      if(startIndex+seg+1 == endIndex) {
        indexData.push(startIndex+1);
      } else {
        indexData.push(startIndex+seg+1);
      }
    }

    //console.log(vertexPositionData);
    //console.log(indexData);
    return {
      position: vertexPositionData,
      normal: normalData,
      index: indexData
    };
  }

  //Call by reference
  //Use with caution
  static pushVertexCircle(vertexPositionData,normalData,indexData, radius, segments, z, startIndex) {
    vertexPositionData.push(0);
    vertexPositionData.push(0);
    vertexPositionData.push(z);
    var counter = startIndex+1;
    for(var deg=0; deg < 360; deg += 360 / segments) {
      let position = glMatrix.toRadian(deg);
      vertexPositionData.push(Math.cos(position) * radius);
      vertexPositionData.push(Math.sin(position) * radius);
      vertexPositionData.push(z);
      //console.log("Vertices:"+Math.cos(position) * radius + " " + Math.sin(position) * radius + " " + z);
      normalData.push(0);
      normalData.push(0);
      normalData.push(1);
      indexData.push(startIndex);
      indexData.push(counter++);

      //If counter exceeds vertices size -> Take first vertice
      if((counter-startIndex) > (360/(360/segments)))
      {
        indexData.push(startIndex+1);
        //console.log("Index:"+startIndex + " " + (counter-1) + " " + (startIndex+1));
      }
      else
      {
        indexData.push(counter);
        //console.log("Index:"+startIndex + " " + (counter-1) + " " + (counter));
      }
    }

    return counter;
  }
}
