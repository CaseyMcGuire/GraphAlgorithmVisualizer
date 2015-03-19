
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

	this.graphs = this.makeGraphs();
	this.isPlaying = false;
    }
    
    this.makeGraphs = function(){

	var types = this.getPropertyArray("type");
	for(var i = 0; i < types.length; i++){
	    types[i] = SIMGraphs.Graph.parseTypeString(types[i]);
	}

	var graphs = new Array(types.length);
	
	var spacePerGraph = this.canvas.height/graphs.length;
	

	for(var i = 0; i < types.length; i++){
	    //have each graph take up the entire third of the canvas
	    //right now, there is no space for buttons but that will be fixed
	    graphs[i] = new SIMGraphs.Graph(types[i], 0, i*spacePerGraph, spacePerGraph, canvas.width);
	}
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
	

    }

    //should cause each graph to take one step
    this.stepGraphs = function(){

    }

    //initialize our canvas
    this.init(canvas);
}

/*
  A graph object. 

  @param {Number} type A constant representing the type of the graph
  @param {Number} x The top-left x-coordinate of the graph
  @param {Number} y The top-left y-coordinate of the graph
  @param {Number} height The height of the graph in pixels(?)
  @param {Number} width The width of the graph in pixels(?)

*/
SIMGraphs.Graph = function(type, x, y, height, width){
    
    //see above for parameter specifications
    this.init = function(type, x, y, height, width){

	//first, figure out which type of graph we're using
	if(type === SIMGraphs.Graph.DEPTH){
	    this.algoStep = this.depthFirstStep;
	    this.name = "Depth First Search";
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
	console.log("Graph created");
	
	this.x = x;
	this.y = y;
	this.height = height;
	this.width = width;
	
    }

    this.draw = function(context){
	

    }

    this.depthFirstStep = function(){


    }

    this.breadthFirstStep = function(){

    }

    this.aStarStep = function(){

    }

    this.init(type, x, y, height, width);

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


