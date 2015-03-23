
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
	setInterval(this.draw.bind(this), 1000);
    }
    
    this.makeGraphs = function(){

	var types = this.getPropertyArray("type");
	for(var i = 0; i < types.length; i++){
	    types[i] = SIMGraphs.Graph.parseTypeString(types[i]);
	}
	
	//find out how many nodes along the x and y axes
	var nodeDimensions = this.getPropertyArray("nodes");
	for(var i = 0; i < nodeDimensions.length; i++){
	    nodeDimensions[i] = parseInt(nodeDimensions[i],10);
	}
	var graphs = new Array(types.length);
	
	//each graph should have about a third of the canvas minus the space for 
	//control panel at the bottom
	var spacePerGraph = (this.canvas.height-this.controlsHeight)/graphs.length;
	

	for(var i = 0; i < types.length; i++){
	    //have each graph take up the entire third of the canvas
	    //right now, there is no space for buttons but that will be fixed
	    //There should be a single row of buttons on the bottom
	    graphs[i] = new SIMGraphs.Graph(types[i], 0, i*spacePerGraph, spacePerGraph, canvas.width, nodeDimensions[0], nodeDimensions[1]);
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
	for(var i = 0; i < this.graphs.length; i++){
	    this.graphs[i].algoStep();
	    console.log("In step Graphs");
	}
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

*/
SIMGraphs.Graph = function(type, x, y, height, width, numXNodes, numYNodes){
    
    //see above for parameter specifications
    this.init = function(type, x, y, height, width){
	console.log("Iniializing our graphs");
	//first, figure out which type of graph we're using
	if(type === SIMGraphs.Graph.DEPTH){
	    this.type = SIMGraphs.Graph.DEPTH;
	    this.algoStep = this.depthFirstStep;
	    this.name = "Depth First Search";
	    this.stack = [];

	}

	else if(type === SIMGraphs.Graph.BREADTH){
	    this.type = SIMGraphs.Graph.BREADTH;
	    this.algoStep = this.breadthFirstStep;
	    this.name = "Breadth First Search";
	    this.queue = [];
	}

	else if(type === SIMGraphs.Graph.ASTAR){
	    this.type = SIMGraphs.Graph.ASTAR;
	    this.algoStep = this.aStarStep;
	    this.name = "A* Search";
	    this.openSet = [];
	}

	else throw Error("no such type");



	assert(this.name !== undefined);
	assert(this.algoStep !== undefined);
//	console.log("Graph created");
	

	this.x = x;
	this.y = y;
	this.panelHeight = 50;//about 50 pixels should be reserved for the name and
	                               //and the counter
	this.height = height - this.panelHeight;
	this.width = width;
	this.counter = 0;
	
	//get the dimensions for each node on the canvas
	this.xPixels = this.width / numXNodes;
	this.yPixels = this.height / numYNodes;

	console.log("Hello");
	//create our nodes
	//at some point, probably want to add colors and dimensions and such
	this.nodes = [];
	for(var i = 0; i < numXNodes; i++){

	    this.nodes[i] = new Array();
	    for(var j = 0; j < numYNodes; j++){


		this.nodes[i][j] = new SIMGraphs.Graph.Node(i * this.xPixels, j * this.yPixels + this.y, this.xPixels, this.yPixels, i, j);		
		assert(this.nodes[i][j] !== undefined, "One of our nodes is undefined");
	    }
	}
	
	//for right now, lets make the beginning node in the bottom left corner and the goal node
	//in the top right corner
	this.curNode = this.nodes[0][numYNodes - 1];//beginning active node
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
	    console.log("we're in init");
	    console.log(this.openSet.length);
	    this.curNode.gScore = 0;//	    this.gScore[this.curNode] = 0;
	    this.curNode.fScore = this.curNode.gScore + this.heuristicCostEstimate(this.curNode, this.goal);//	    this.fScore[this.curNode] = this.gScore[this.curNode] + this.heuristicCostEstimate(this.curNode, this.goal);
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
	//console.log("hellol");
	context.save();
	for(var i = 0;i< this.nodes.length; i++){
	    for(var j = 0; j < this.nodes[i].length; j++){
		this.nodes[i][j].draw(context);
	    }
	}
	context.restore();
	
	context.lineWidth = 0.1;
	//draw bars down the y-axis
	for(var i = 0; i < this.nodes.length; i++){
	    context.beginPath();
	    context.moveTo(i * this.xPixels, this.y);
	    context.lineTo(i * this.xPixels, this.y + this.height);
	    context.closePath();
	    context.stroke();
	}


	//draw bars along the x-axis
	//the inner array should all be the same length so using the zero-index should be fine.
	for(var j = 0; j < this.nodes[0].length; j++){
	    context.beginPath();
	    context.moveTo(this.x, j * this.yPixels + this.y);
	    context.lineTo(this.x + this.width, j * this.yPixels + this.y);
	    context.closePath();
	    context.stroke();
	}

	//TODO: draw panel here
	context.fillStyle = "black";
	var middleOfPanel = this.height + (this.panelHeight * 0.5) + this.y;
	context.fillText(this.name, 0, middleOfPanel );
	context.fillText(this.counter, this.width * 0.95, middleOfPanel);

    }


    /////////////////////////////////////////////////////////////////////
    //DEPTH-FIRST SEARCH
    ////////////////////////////////////////////////////////////////////
    this.depthFirstStep = function(){
//	console.log("in depth first step");
//	console.log(this.stack.length);
	if(this.stack.length === 0) return;
	this.curNode.type = SIMGraphs.Graph.Node.CLOSED;
	this.curNode = this.stack.pop();
	if(this.curNode.type === SIMGraphs.Graph.Node.GOAL) this.stack = [];//a dirty hack but I still wanna ponder how to do this.
	this.curNode.type = SIMGraphs.Graph.Node.ACTIVE;

	var arr = this.getNeighborNodes(this.curNode);
	
	for(var i = 0; i < arr.length; i++){
	    if(arr[i].type === SIMGraphs.Graph.Node.UNEXPLORED){
		arr[i].type = SIMGraphs.Graph.Node.OPEN;
		this.stack.push(arr[i]);
	    }
	    else if(arr[i].type === SIMGraphs.Graph.Node.GOAL){
		this.stack.push(arr[i]);
	    }
	}
    }

    ///////////////////////////////////////////////////////////////////////
    //BREADTH-FIRST SEARCH
    //////////////////////////////////////////////////////////////////////

    this.breadthFirstStep = function(){

	if(this.queue.length === 0) return;

	this.curNode.type = SIMGraphs.Graph.Node.CLOSED;
	this.curNode = this.queue.shift();

	if(this.curNode.type === SIMGraphs.Graph.Node.GOAL) this.queue = [];
	this.curNode.type = SIMGraphs.Graph.Node.ACTIVE;

	var arr = this.getNeighborNodes(this.curNode);
	
	for(var i = 0; i < arr.length; i++){
	    if(arr[i].type === SIMGraphs.Graph.Node.UNEXPLORED){
		arr[i].type = SIMGraphs.Graph.Node.OPEN;
		this.queue.push(arr[i]);
	    }
	    else if(arr[i].type === SIMGraphs.Graph.Node.GOAL){
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
	if(this.openSet.length === 0) return;
	console.log("Type of curNode is ");
//	console.log(typeof this.curNode);
	console.log(this.curNode);

	this.curNode.type = SIMGraphs.Graph.Node.CLOSED;
	this.curNode = this.getNodeWithLowestFScore();
	//	assert(typeof this.curNode !== 'string');

	if(this.curNode.type === SIMGraphs.Graph.Node.GOAL) this.openSet = [];
	this.curNode.type = SIMGraphs.Graph.Node.ACTIVE;
	
	var arr = this.getNeighborNodes(this.curNode);
	
	for(var i = 0; i < arr.length; i++){
	    if(arr[i].type === SIMGraphs.Graph.Node.CLOSED) continue;
	    var tentativeGScore = this.curNode.gScore + this.distanceBetween(this.curNode, arr[i]);// this.gScore[this.curNode] + this.distanceBetween(this.curNode, arr[i]);
	    //	    assert(typeof this.curNode !== 'string');
	    if(arr[i].type !== SIMGraphs.Graph.Node.OPEN || tentativeGScore < arr[i].gScore){
		arr[i].gScore = tentativeGScore;//this.gScore[arr[i]] = tentativeGScore;
		arr[i].fScore = arr[i].gScore + this.heuristicCostEstimate(arr[i], this.goal);//		this.fScore[arr[i]] = gScore[arr[i]] + this.heuristicCostEstimate(arr[i], this.goal);
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
		if(n === 1 && m === 1) continue;
		if(startX + m < this.nodes.length && startX + m >= 0 && startY + n < this.nodes[0].length && startY + n >= 0){

		    arr.push(this.nodes[startX + m][startY + n]);

		}
	    }
	}

	return arr;
    }

    this.init(type, x, y, height, width);

}



//perhaps want to add i and j as well?
/*
  A single node in the graph

  @param {Number} x The top-left hand x-coordinate of this node (in terms of the entire canvas)
  @param {Number} y The top-left hand y-coordinate of this ndoe (in terms of the entire canvas)
  @param {Number} width The width of this node in pixels.
  @param {Number} height The height of this node in pixels.
  @param {Number} i The x-value of the node in the graph matrix
  @param {Number} j The y-value of the node in the graph matrix
*/
SIMGraphs.Graph.Node = function(x, y, width, height, i, j){

    this.init = function(x, y){
	
	this.x = x;
	this.y = y;
	this.i = i;
	this.j = j;
//	console.log("This node's coordinates in the matrix are: (" + this.i + ", " + this.j + ")");
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
	context.fillStyle = "#eee";
	context.fillRect(this.x, this.y, this.width, this.height);	
    }

    this.drawOpen = function(context){

	this.drawLegs(context);
	this.drawCircle(context, 'white');
    }
    
    this.drawClosed = function(context){
	this.drawLegs(context);
	this.drawCircle(context, '#ddd');//dark gray ?
    }

    this.drawGoal = function(context){
	this.drawCircle(context, 'green');
    }

    this.drawActive = function(context){
	this.drawLegs(context);
	this.drawCircle(context, 'black');
    }

    this.drawCircle = function(context, color){
	context.beginPath();
        context.arc(this.x + (width * .5), this.y + (height * .5), this.radius, 0, 2*Math.PI, true);
        context.fillStyle = color;
        context.fill();
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


    this.init(x, y);
}


//some constants to help clear up code
SIMGraphs.Graph.DEPTH = 0;
SIMGraphs.Graph.BREADTH = 1;
SIMGraphs.Graph.ASTAR = 2;

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
