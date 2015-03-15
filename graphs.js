'use strict';//let's catch our errors early
var SIMGraphs = function(){};
var DEBUG = true;

SIMGraphs.go = function() {
    //Adam uses getElementByTagName
    var canvases = document.getElementsByClassName("graph-canvas");
    for(var i = 0; i < canvases.length; i++){
//	if(canvases[i].getAttribute("data-program") === "graphs") new SIMGraphs.GraphCanvas(canvases[i]);
	assert(canvases.length == 1);
    }

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
