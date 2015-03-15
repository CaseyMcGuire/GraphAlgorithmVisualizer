'use strict';//let's catch our errors early
var SIMGraphs = function(){};


SIMGraphs.go = function() {
    var canvases = document.getElementByTagName("canvas");
    for(var i = 0; i < canvases.length; i++){
	if(canvases[i].getAttribute("data-program") === "graphs") new SIMGraphs.GraphCanvas(canvases[i]);
    }

}
