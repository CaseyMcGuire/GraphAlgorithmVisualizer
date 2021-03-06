
var SIMGraphs = function(){'use strict';};
var DEBUG = true;

SIMGraphs.go = function() {
    //Adam uses getElementByTagName
    var canvases = document.getElementsByClassName("graph-canvas");
    for(var i = 0; i < canvases.length; i++){
	if(canvases[i].getAttribute("data-program") === "graphs") new SIMGraphs.GraphCanvas(canvases[i]);
	assert(canvases.length == 1);
    }
}

////////////////////////////////////////////////////////////
//CANVAS OBJECT
////////////////////////////////////////////////////////////

SIMGraphs.GraphCanvas = function(canvas){
    
    this.init = function(canvas){
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.context.font = "15px sans-serif";
	this.controlsHeight = 100;//controls should have about 100 pixels regardless of how
       	                          //big the canvas is
	this.graphs = this.makeGraphs();
	this.isPlaying = false;
	this.draw();


	//draw the board
	this.isPlaying = true;//remove this
	this.timer = setInterval(this.draw.bind(this), 500);
    }
    
    this.makeGraphs = function(){

	var types = this.getPropertyArray("type");
	for(var i = 0; i < types.length; i++){
	    types[i] = SIMGraphs.Graph.parseTypeString(types[i]);
	}
	
	//find out how many nodes along the x and y axes
	var nodeDimensions = this.getPropertyArray("map-size");
	for(var i = 0; i < nodeDimensions.length; i++){
	    nodeDimensions[i] = parseInt(nodeDimensions[i],10);
	}
	var graphs = new Array(types.length);
	
	var widthPerGraph = (this.canvas.width)/graphs.length;

	for(var i = 0; i < types.length; i++){
	    //have each graph take up the entire third of the canvas
	    //right now, there is no space for buttons but that will be fixed
	    //There should be a single row of buttons on the bottom
	    graphs[i] = new SIMGraphs.Graph(types[i], i*widthPerGraph, 0, canvas.height, widthPerGraph, nodeDimensions[0], nodeDimensions[1]);
	}
	return graphs;
    }

    /*
      Grabs the canvas's 'data-' attribute with the given property name, splits it with a comma
      delimiter, and then returns it as a string array.
      Source: Prof. Adam A. Smith

      @param{String} propName The suffix of the 'data-' attribute in the canvas element to 
      retrieve
      @param{Array} An array of strings which are the 
     */
    this.getPropertyArray = function(propName){
	var string = canvas.getAttribute("data-" + propName);
	if(string === null) return [];
	var array = string.split(",");
	
	//get rid of trailing and/or leading whitespace (I think)
	for(var i = 0; i < array.length; i++){
	    array[i] = array[i].replace(/^\s\s*/, '').replace(/\s\s*$/, '');
	}
	return array;
    }

    
    this.draw = function(){
	this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	if(this.isPlaying) this.stepGraphs();
	for(var i = 0; i < this.graphs.length; i++){
	    this.graphs[i].draw(this.context);
	}

    }

    //should cause each graph to take one step
    //I'll need a counter at some point
    this.stepGraphs = function(){
	console.log("In step Graphs");
	var allGraphsFinished = true;
	for(var i = 0; i < this.graphs.length; i++){
	    if(!this.graphs[i].isFinished) allGraphsFinished = false;
	    this.graphs[i].takeAlgoStep();
	}
	if(allGraphsFinished) clearInterval(this.timer);

    }

    //initialize our canvas
    this.init(canvas);
}

/*
  A graph object. 

  @param {Number} type A constant representing the type of the graph
  @param {Number} x The top-left x-coordinate of the graph in terms of the canvas
  @param {Number} y The top-left y-coordinate of the graph in terms of the canvas
  @param {Number} height The height of the graph in pixels(?)
  @param {Number} width The width of the graph in pixels(?)
  @param {Number} numXNodes The number of nodes along the X axis
  @param {Number} numYNodes The number of nodes along the Y axis
  @param {String} color The color of this graph's nodes

*/
SIMGraphs.Graph = function(type, x, y, height, width, numXNodes, numYNodes, color){
    
    //see above for parameter specifications
    this.init = function(type, x, y, height, width){
	console.log("Initializing our graphs");

	
	//first, figure out which type of graph we're using
	if(type === SIMGraphs.Graph.DEPTH){
	    this.type = SIMGraphs.Graph.DEPTH;
	    this.algoStep = this.depthFirstStep;
	    this.name = "Depth First Search";
	    this.stack = [];
	    if(color === undefined) color = "red";
	}

	else if(type === SIMGraphs.Graph.BREADTH){
	    this.type = SIMGraphs.Graph.BREADTH;
	    this.algoStep = this.breadthFirstStep;
	    this.name = "Breadth First Search";
	    this.queue = [];
	    if(color === undefined) color = "blue";
	}

	else if(type === SIMGraphs.Graph.ASTAR){
	    this.type = SIMGraphs.Graph.ASTAR;
	    this.algoStep = this.aStarStep;
	    this.name = "A* Search";
	    this.openSet = [];
	    if(color === undefined) color = "green";
	}
	else throw Error("no such type");

	assert(this.name !== undefined);
	assert(this.algoStep !== undefined);

	this.x = x;
	this.y = y;
	this.isFinished = false;
	this.panelHeight = 50;//about 50 pixels should be reserved for the name and
	                      //and the counter
	this.spaceBetweenGraphs = 10;//put about 10 pixels between graphs
	this.height = height - this.panelHeight;
	this.width = width - this.spaceBetweenGraphs;
	this.counter = 0;
	this.parentMap = {};
	this.topOfPanel = this.y + this.height + (this.panelHeight * 0.25);

	this.colors = SIMGraphs.makeColors(color);
	
	//get the dimensions for each node on the canvas
	this.xPixels = this.width / numXNodes;
	this.yPixels = this.height / numYNodes;

	//create our nodes
	//at some point, probably want to add colors and dimensions and such
	this.nodes = [];
	for(var i = 0; i < numXNodes; i++){

	    this.nodes[i] = new Array();
	    for(var j = 0; j < numYNodes; j++){

		this.nodes[i][j] = new SIMGraphs.Graph.Node(i * this.xPixels + this.x, j * this.yPixels, this.xPixels, this.yPixels, i, j, this.colors);		
		assert(this.nodes[i][j] !== undefined, "One of our nodes is undefined");
	    }
	}
	
	//for right now, lets make the beginning node in the bottom left corner and the goal node
	//in the top right corner
	this.curNode = this.nodes[0][numYNodes - 1];//beginning active node
	this.start = this.curNode;
	this.goal = this.nodes[numXNodes - 5][0];//goal node
	this.curNode.type = SIMGraphs.Graph.Node.ACTIVE;
	this.goal.type = SIMGraphs.Graph.Node.GOAL;

	if(this.type === SIMGraphs.Graph.DEPTH){
	    this.stack.push(this.curNode);
	}
	if(this.type === SIMGraphs.Graph.BREADTH){
	    this.queue.push(this.curNode);
	}
	if(this.type === SIMGraphs.Graph.ASTAR){
	    this.openSet.push(this.curNode);

	    this.curNode.gScore = 0;
	    this.curNode.fScore = this.curNode.gScore + this.heuristicCostEstimate(this.curNode, this.goal);
	    assert(this.curNode.fScore !== undefined, "this.curNode.fScore is undefined");
	    assert(this.curNode.gScore !== undefined, "this.curNode.gScore is undefined");
	}
	assert(this.curNode.type !== undefined, "curNode is undefined");
	assert(this.goal.type !== undefined, "this.goal is undefined");

    }

    this.draw = function(context){

	//now, lets the draw the graph
	context.strokeStyle = "#000000";

	context.stroke();
	context.lineWidth = 1;
	context.save();
	for(var i = 0;i< this.nodes.length; i++){
	    for(var j = 0; j < this.nodes[i].length; j++){
		this.nodes[i][j].draw(context);
	    }
	}
	context.restore();

	this.drawPanel(context);
    }

    this.drawPanel = function(context) {
	context.save();
	context.fillStyle = "black";
	context.fillText(this.name, this.x, this.topOfPanel);
	this.drawCounter(context);
	context.restore();
    }

    /*
      Draws the counter on the lower right-hand corner of a graph's panel.
     */
    this.drawCounter = function(context){
	context.save();
	context.fillStyle = "black";
	context.fillText(this.counter, (this.width + this.x) * 0.95, this.topOfPanel);	
	context.restore();
    }

    /*
      A launcher function for each graph's algorithm.
     */
    this.takeAlgoStep = function(){
	if(this.isFinished) return;
	this.algoStep();
	this.counter++;
    }

    /////////////////////////////////////////////////////////////////////
    //DEPTH-FIRST SEARCH
    ////////////////////////////////////////////////////////////////////
    this.depthFirstStep = function(){

	if(this.stack.length === 0) {
	    this.finish();
	}

	if(this.isFinished) return;

	this.curNode.type = SIMGraphs.Graph.Node.CLOSED;
	this.curNode = this.stack.pop();
	if(this.curNode.type === SIMGraphs.Graph.Node.GOAL) {
	    this.finish();
	    this.retracePath();
	}



	this.curNode.type = SIMGraphs.Graph.Node.ACTIVE;
	var arr = this.getNeighborNodes(this.curNode);
	shuffle(arr);//makes the path more winding
	
	for(var i = 0; i < arr.length; i++){
	    if(arr[i].type === SIMGraphs.Graph.Node.UNEXPLORED){
		this.parentMap[arr[i].key] = this.curNode;
		arr[i].type = SIMGraphs.Graph.Node.OPEN;
		this.stack.push(arr[i]);
	    }
	    else if(arr[i].type === SIMGraphs.Graph.Node.GOAL){
		this.parentMap[arr[i].key] = this.curNode;
		this.stack.push(arr[i]);
	    }
	}
    }


    ///////////////////////////////////////////////////////////////////////
    //BREADTH-FIRST SEARCH
    //////////////////////////////////////////////////////////////////////

    this.breadthFirstStep = function(){

	if(this.queue.length === 0) {
	    this.finish();
	}

	if(this.isFinished) return;

	this.curNode.type = SIMGraphs.Graph.Node.CLOSED;
	this.curNode = this.queue.shift();

	if(this.curNode.type === SIMGraphs.Graph.Node.GOAL) {
	    this.finish();
	    this.retracePath();
	    return;
	}
	this.curNode.type = SIMGraphs.Graph.Node.ACTIVE;

	var arr = this.getNeighborNodes(this.curNode);
	
	for(var i = 0; i < arr.length; i++){
	    if(arr[i].type === SIMGraphs.Graph.Node.UNEXPLORED){
		this.parentMap[arr[i].key] = this.curNode;
		arr[i].type = SIMGraphs.Graph.Node.OPEN;
		this.queue.push(arr[i]);
	    }
	    else if(arr[i].type === SIMGraphs.Graph.Node.GOAL){
		this.parentMap[arr[i].key] = this.curNode;
		this.queue.push(arr[i]);
	    }
	}

    }

    ///////////////////////////////////////////////////////////////////////
    //A* SEARCH
    //////////////////////////////////////////////////////////////////////

    this.aStarStep = function(){

	console.log("We're in aStarStep");
	console.log(this.openSet.length);
	if(this.openSet.length === 0){
	    this.finish();
	}

	if(this.isFinished) return;

	this.curNode.type = SIMGraphs.Graph.Node.CLOSED;
	this.curNode = this.getNodeWithLowestFScore();
	//	assert(typeof this.curNode !== 'string');

	if(this.curNode.type === SIMGraphs.Graph.Node.GOAL) {
	    this.finish();
	    this.retracePath();
	    return;
	}
	this.curNode.type = SIMGraphs.Graph.Node.ACTIVE;
	
	var arr = this.getNeighborNodes(this.curNode);
	
	for(var i = 0; i < arr.length; i++){
	    if(arr[i].type === SIMGraphs.Graph.Node.CLOSED) continue;
	    var tentativeGScore = this.curNode.gScore + this.distanceBetween(this.curNode, arr[i]);

	    if(arr[i].type !== SIMGraphs.Graph.Node.OPEN || tentativeGScore < arr[i].gScore){
		this.parentMap[arr[i].key] = this.curNode;
		arr[i].gScore = tentativeGScore;
		arr[i].fScore = arr[i].gScore + this.heuristicCostEstimate(arr[i], this.goal);
		if(arr[i].type === SIMGraphs.Graph.Node.GOAL){
		    this.openSet.push(arr[i]);
		}
		else if(arr[i].type !== SIMGraphs.Graph.Node.OPEN){
		    arr[i].type = SIMGraphs.Graph.Node.OPEN;
		    this.openSet.push(arr[i]);
		}
	    }
	}
    }

    //this should be replaced with a priority queue but we'll do linear search for right now
    this.getNodeWithLowestFScore = function(){
	var king;
	var indexToRemove;
	for(var i = 0; i < this.openSet.length; i++){
	    if(king === undefined || this.openSet[i].fScore < king.fScore){
		king = this.openSet[i];
		indexToRemove = i;
	    }
	}
	this.openSet.splice(indexToRemove, indexToRemove + 1);
	return king;
    }
    
    //our heuristic will be euclidean distance
    this.heuristicCostEstimate = function(node1, node2){
	var a = node2.i - node1.i;
	var b = node2.j - node1.j;
	var dist = Math.sqrt(a*a + b*b);
	assert(dist !== Math.NaN);
	return dist;
    }

    //right now, all nodes have the same distance so this is fine
    this.distanceBetween = function(node1, node2){
	return 1;
    }

    /*
      Returns the neighbor nodes for the current node.
     */
    this.getNeighborNodes = function(node){
	var arr = [];
	var startX = node.i - 1;
	var startY = node.j - 1;

	for(var m = 0; m < 3; m++){
	    for(var n = 0; n < 3; n++){
		if(n === 1 && m === 1) continue;//1x1 is the current node we're getting neighbors for
		if(startX + m < this.nodes.length && startX + m >= 0 && startY + n < this.nodes[0].length && startY + n >= 0){

		    arr.push(this.nodes[startX + m][startY + n]);

		}
	    }
	}

	return arr;
    }

    this.retracePath2 = function(){
	if(this.type === SIMGraphs.Graph.DEPTH){
	    this.retraceDepthFirstPath();
	}
	else if(this.type === SIMGraphs.Graph.BREADTH){
	    this.retraceBreadthFirstPath();
	}
	else if(this.type === SIMGraphs.Graph.ASTAR){
//	    this.retraceAStarPath();
	}
	else{
	    throw new Error("Undefined Graph type");
	}
    }

    this.finish = function(){
	this.isFinished = true;
	
	//make nodes a little darker
	for(var i = 0; i < numXNodes; i++){
	    for(var j = 0; j < numYNodes; j++){
		this.nodes[i][j].offset = 2;
	    }
	}
    }

    this.retracePath = function(){
	var iter = this.goal;
	iter.offset = 0;
	while(iter !== undefined){
	    iter.offset = 0;
	    iter = this.parentMap[iter.key];
	}
    }

    this.retraceBreadthFirstPath = function(){
	var iter = goal;
    }

    this.init(type, x, y, height, width);

}

/*
  A single node in the graph

  @param {Number} x The top-left hand x-coordinate of this node (in terms of the entire canvas)
  @param {Number} y The top-left hand y-coordinate of this ndoe (in terms of the entire canvas)
  @param {Number} width The width of this node in pixels.
  @param {Number} height The height of this node in pixels.
  @param {Number} i The x-value of the node in the graph matrix
  @param {Number} j The y-value of the node in the graph matrix
  @param {Array} colors An array of length holding various hues of the graph's color(0 is darkest, 5 is lightest)
*/
SIMGraphs.Graph.Node = function(x, y, width, height, i, j, colors){

    this.init = function(x, y, width, height, i, j, colors){
	
	this.x = x;
	this.y = y;
	this.i = i;
	this.j = j;
	this.key = "(" + i + "," + j + ")";
	this.offset = 0;//the offset to use for colors when we're done
	this.partOfPath = false;

	//note: this array is shared by all nodes in a graph. As such, DO NOT MODIFY IT
	this.colors = colors;
	this.width = width;
	this.height = height;
	this.type = SIMGraphs.Graph.Node.UNEXPLORED;
	this.radius = this.width > this.height ? this.height * .30 : this.width * .30;
	assert(this.type !== undefined);
    }

    this.draw = function(context){

	//right now, give each node a light grayish background color
	this.drawBackground(context);

	//if its the goal node, just put a green node and return
	if(this.type === SIMGraphs.Graph.Node.UNEXPLORED){
	    //do nothing (for now?)
	}
	else if(this.type === SIMGraphs.Graph.Node.OPEN){
	    this.drawOpen(context);
	}
	else if(this.type === SIMGraphs.Graph.Node.CLOSED){
	    this.drawClosed(context);
	}
	else if(this.type === SIMGraphs.Graph.Node.GOAL){
	    this.drawGoal(context);
	}
	else if(this.type === SIMGraphs.Graph.Node.ACTIVE){
	    this.drawActive(context);
	}else{
	    throw Error("Invalid type");
	}
    }

    this.drawBackground = function(context){
	context.fillStyle = "#fbfbfb";
	context.fillRect(this.x, this.y, this.width, this.height);	
    }

    this.drawOpen = function(context){

//	this.drawLegs(context);
	this.drawCircle(context, 'white');
    }
    
    this.drawClosed = function(context){
	this.drawLegs(context);
	this.drawCircle(context, colors[5-this.offset]);

    }

    this.drawGoal = function(context){
	this.drawCircle(context, 'green');
    }

    this.drawActive = function(context){
	this.drawLegs(context);
	this.drawCircle(context, colors[2]);
    }


    this.drawCircle = function(context, color){
	context.beginPath();
        context.arc(this.x + (width * .5), this.y + (height * .5), this.radius, 0, 2*Math.PI, true);
        context.fillStyle = color;
	context.fill();
	context.strokeStyle = "black";
	context.stroke();
        context.closePath();
    }

    /*
      Draws the legs of a single node
     */
    this.drawLegs = function(context){

	//draw top-to-bottom diagonal leg
	this.drawLeg(context, this.x, this.y, this.x + this.width, this.y + this.height);

	//draw bottom-to-top diagonal leg
	this.drawLeg(context, this.x, this.y + this.height, this.x + this.width, this.y);
	
	//draw side-to-side leg
	this.drawLeg(context, this.x, this.y + (this.height * .5), this.x + this.width, this.y + (this.height * .5));

	//draw top-to-bottom leg
	this.drawLeg(context, this.x + (this.width * .5), this.y, this.x + (this.width * .5), this.y + this.height);
    }
    
    this.drawLeg = function(context, beginX, beginY, endX, endY){
	context.beginPath();
	context.moveTo(beginX, beginY);
	context.lineTo(endX, endY);
	context.stroke();
	context.closePath();
    }


    this.init(x, y, width, height, i, j, colors);
}


//some constants to help clear up code
SIMGraphs.Graph.DEPTH = 0;
SIMGraphs.Graph.BREADTH = 1;
SIMGraphs.Graph.ASTAR = 2;

SIMGraphs.Graph.GAP_BETWEEN_GRAPHS = 10;

//for nodes
SIMGraphs.Graph.Node.UNEXPLORED = 0;
SIMGraphs.Graph.Node.OPEN = 1;
SIMGraphs.Graph.Node.CLOSED = 2;
SIMGraphs.Graph.Node.GOAL = 3;
SIMGraphs.Graph.Node.ACTIVE = 4;

SIMGraphs.Graph.parseTypeString = function(string){
    string = string.toLowerCase();
    if(string === "depth") return SIMGraphs.Graph.DEPTH;
    if(string === "breadth") return SIMGraphs.Graph.BREADTH;
    if(string === "astar") return SIMGraphs.Graph.ASTAR;
    throw Error("Unknown graph type");
}


/////////////////////////////////////////////////
// THE BUTTON OBJECT
////////////////////////////////////////////////

SIMGraphs.Button = function(){

    this.init = function(){
	console.log("A button was just created");
    }

    this.init();
}

///////////////////////////////////////////////
//UTILITY FUNCTIONS
//Source: Prof. Adam A. Smith
//////////////////////////////////////////////

SIMGraphs.makeColors = function(color) {
    var r=0, g=0, b=0;
    if (color === "red" || color===undefined) r = 170;
    else if (color === "orange") r = 200, g = 100;
    else if (color === "yellow") r = g = 210;
    else if (color === "green") g = 170, b=33;
    else if (color === "cyan" || color === "teal") g = b = 170;
    else if (color === "blue") b = 204;
    else if (color === "purple") r = b = 128;
    else if (color === "skyblue") r = 102, g = 153, b = 255;
    else if (color === "rose") r = 204, b = 102;//r = 255, b = 127;
    else if (color === "indigo") r = 111, b = 255;
    else if (color === "amber") r = 220, g = 180;
    else if (color === "chartreuse") r = 160, g = 200;
    else if (color === "gray" || color === "grey") r = g = b = 128;

    // calculate HSV
    var h, s, v = Math.max(r,g,b);
    var min = Math.min(r,g,b);
    var delta = v-min;

    if (v===0) h=s=0;
    else {
	s = delta/v;
	if (r === v) h = (g-b)/delta;
	else if (g === v) h = 2 + (b-r)/delta;
	else h = 4 + (r-g)/delta;
	if (h<0) h += 6;
    }

    var colors = new Array(5);
    colors[5] = SIMGraphs.hsv2String(h, s, v*2.25);
    colors[4] = SIMGraphs.hsv2String(h, s, v*1.5);
    colors[3] = SIMGraphs.hsv2String(h, s, v);
    colors[2] = SIMGraphs.hsv2String(h, s, v*2/3);
    colors[1] = SIMGraphs.hsv2String(h, s, v*4/9);
    colors[0] = SIMGraphs.hsv2String(h, s, v*0.25);

    return colors;
}

SIMGraphs.hsv2String = function(h, s, v) {
    var r, g, b;

    // if we got brightness above allowed, adjust it back & take away saturation
    if (v > 255) {
	s -= (v-255)/255;
	v = 255;
	if (s < 0) s = 0;
    }

    // the actual HSV->RGB calculation
    if (s===0) r = g = b = v;
    else {
	var i = Math.floor(h);
	var f = h-i;
	var p = v*(1-s), q = v*(1-s*f), t = v*(1-s*(1-f));
	switch(i) {
	    case 0: r = v; g = t; b = p; break;
	    case 1: r = q; g = v; b = p; break;
	    case 2: r = p; g = v; b = t; break;
	    case 3: r = p; g = q; b = v; break;
	    case 4: r = t; g = p; b = v; break;
	    case 5: r = v; g = p; b = q; break;
	    }
    }

    // final rounding/parsing
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);

    var string = "#";
    if (r < 16) string += "0";
    string += r.toString(16);
    if (g < 16) string += "0";
    string += g.toString(16);
    if (b < 16) string += "0";
    string += b.toString(16);
    return string;
}

//Fisher-Yates shuffle
//source: http://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}



//An assertion function for testing
//http://stackoverflow.com/questions/15313418/javascript-assert
function assert(condition, message){
    if(!DEBUG) return;//I added this
    if(!condition){
	message = message || "Assertion failed";
	if(typeof Error !== "undefined"){
	    throw new Error(message);
	}
	throw message;
    }
}


//when the window loads, start your engines.
window.addEventListener('load', SIMGraphs.go, false);
