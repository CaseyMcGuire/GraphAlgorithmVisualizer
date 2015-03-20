
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
///////////////////////////////////////////////////////////

SIMGraphs.GraphCanvas = function(canvas){

    
    
    this.init = function(canvas){
	this.canvas = canvas;
	this.context = canvas.getContext('2d');
	this.context.font = "15px sans-serif";
	this.controlsHeight = 100;//controls should have about 100 pixels regardless of how
       	                          //big the canvas is
	this.graphs = this.makeGraphs();
	this.isPlaying = false;


	//draw the board
	this.draw();
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
	if(this.isPlaying) this.stepGraphs();
	for(var i = 0; i < this.graphs.length; i++){
	    this.graphs[i].draw(this.context);
	}

    }

    //should cause each graph to take one step
    //I'll need a counter at some point
    this.stepGraphs = function(){

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

	//first, figure out which type of graph we're using
	if(type === SIMGraphs.Graph.DEPTH){
	    this.algoStep = this.depthFirstStep;
	    this.name = "Depth First Search";
	    this.stack = [];
	}

	else if(type === SIMGraphs.Graph.BREADTH){
	    this.algoStep = this.breadthFirstStep;
	    this.name = "Breadth First Search";
	}

	else if(type === SIMGraphs.Graph.ASTAR){
	    this.algoStep = this.aStarStep;
	    this.name = "A* Search";
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


	//create our nodes
	//at some point, probably want to add colors and dimensions and such
	this.nodes = [];
	for(var i = 0; i < numXNodes; i++){

	    this.nodes[i] = new Array();
	    for(var j = 0; j < numYNodes; j++){


		this.nodes[i][j] = new SIMGraphs.Graph.Node(i * this.xPixels, j * this.yPixels + this.y, this.xPixels, this.yPixels);		
		assert(this.nodes[i][j] !== undefined, "We have a problem");
	    }
	}
	
	//for right now, lets make the beginning node in the bottom left corner and the goal node
	//in the top right corner
	var v = this.nodes[0][numYNodes - 1];//.isActive = true;//for testing purposes
	var goal = this.nodes[numXNodes - 1][0];//.isGoal = true;
	v.isActive = true;
	goal.isGoal = true;
//	console.log(this.nodes);
    }

    this.draw = function(context){
	
	//Give the background a light grayish color
	//perhaps this should go in the node ?
	context.fillStyle = "#eee";
	context.fillRect(this.x, this.y, this.width, this.height);


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

    this.depthFirstStep = function(){

    }

    this.breadthFirstStep = function(){

    }

    this.aStarStep = function(){

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
*/
SIMGraphs.Graph.Node = function(x, y, width, height){

    this.init = function(x, y){
	
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.isActive = false;//whether this is the current node
	this.isGoal = false;
	/*
	console.log('========');
	console.log("x");
	console.log(x);
	console.log("y");
	console.log(y);
	console.log('========');
	*/
	//some other constants I think this might need at some point
	
	//this.isWall = false;
	//this.isOnOpenSet = false;
	//this.isOnClosedSet = false;
	//this.color = "#000";//fine for right now
	
    }

    this.draw = function(context){

	//this is getting messy... probably wanna start doing some cleanup
	if(this.isGoal === true){
	    context.beginPath();
            var radius = width > height ? height*.30 : width*.30;
            context.arc(this.x + (width * .5), this.y + (height * .5), radius, 0, 2*Math.PI, true);
            context.fillStyle = 'green';
            context.fill();
            context.closePath();
	    return;
	}
	if(this.isActive === false) return;//this will be changed later
	//draw top-to-bottom diagonal leg
	context.beginPath();
	console.log("hello world");
	context.moveTo(this.x, this.y);
	context.lineTo(this.x + width, this.y + height);
	context.stroke();
	context.closePath();
	
	//draw bottom-to-top diagonal lef
	context.beginPath();
	context.moveTo(this.x, this.y + height);
	context.lineTo(this.x + width, this.y);
	context.stroke();
	context.closePath();

	//draw side-to-side leg
	context.beginPath();
	context.moveTo(this.x, this.y + (height * .5));
	context.lineTo(this.x + width, this.y + (height * .5));
	context.stroke();
	context.closePath();

	//draw top-to-bottom leg
	context.beginPath();
	context.moveTo(this.x + (width * .5), this.y);
	context.lineTo(this.x + (width * .5), this.y + this.height);
	context.stroke();
	context.closePath();

	//draw a circle in the middle of the node
	context.beginPath();
	var radius = width > height ? height*.30 : width*.30;
	context.arc(this.x + (width * .5), this.y + (height * .5), radius, 0, 2*Math.PI, true);
	context.fillStyle = 'black';
	context.fill();
	context.closePath();
    }

    this.init(x, y);
}


//some constants to help clear up code
SIMGraphs.Graph.DEPTH = 0;
SIMGraphs.Graph.BREADTH = 1;
SIMGraphs.Graph.ASTAR = 2;

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


