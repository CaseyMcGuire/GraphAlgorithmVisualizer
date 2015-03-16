'use strict';//let's catch our errors early
var SIMGraphs = function(){};
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

	var graphs = new Array(types.length);
	
	var spacePerGraph = this.canvas.height/graphs.length;
	

	for(var i = 0; i < types.length; i++){
	    //have each graph take up the entire third of the canvas
	    //right now, there is no space for buttons but that will be fixed
	    graphs[i] = new SIMGraphs.Graph(0, i*spacePerGraph, spacePerGraph, canvas.width);
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

  @param {Number} x The top-left x-coordinate of the graph
  @param {Number} y The top-left y-coordinate of the graph
  @param {Number} height The height of the graph in pixels(?)
  @param {Number} width The width of the graph in pixels(?)

*/
SIMGraphs.Graph = function(x, y, height, width){
    
    this.init = function(){
	console.log("Graph created");
	
    }

    this.draw = function(context){
	

    }

    this.depthFirstStep = function(){


    }

    this.breadthFirstStep = function(){

    }

    this.aStarStep = function(){

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


