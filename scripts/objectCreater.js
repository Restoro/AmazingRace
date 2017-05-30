class Objects {
  static makeRectMesh(width, height) {
    var vertexPositionData = [];
    var normalData = [];
    var indexData = [];

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
