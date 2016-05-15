"use strict";
var extend = require("./lib").extend;
var Iterator = require("./lib").Iterator;

/**
 * Default Options
 */
var defaultOptions = {
    canvasElement:null,
    fps:24,
    quality:1.0,
    format:"png"   
};

var FORMAT = {
    "jpeg":"image/jpeg",
    "jpg":"image/jpeg",
    "png":"image/png"
}


/**
 * CanvasPlayer class
 * 
 * @class
 * @constructor
 * @alias module:src/CanvasPlayer
 * @param {Object} [options={}] - the options
 * */
function CanvasPlayer(options){
  
  this.options = extend(defaultOptions, options || {});
  this.canvasElement = this.options.canvasElement || document.querySelectorAll("canvas")[0];
  this.ctx = this.canvasElement.getContext("2d");  
  this.frames = [];  
  this.intervalID = null;
  this.playIntervalID = null;
  this.image = new Image();
  this.recording = false;
  this.playing = false;
}

/**
 * Record. start recording
 * @param {Object} options
 * @param {String} options.format - jpeg|jpg|png|JPG|PNG|JPEG
 * @param {Number} options.quality - 1.0 maximum quality 0.1 minimum quality
 * @returns {Array} an array of base64 encode images
 */
CanvasPlayer.prototype.record = function(){
    console.log(["Start recording ", "FPS:" + this.options.fps, "quality:" + this.options.quality, "format:" + this.options.format].join(", "));
    this.recording = true;
    var self = this;
    this.intervalID = setInterval(function(){
        var dataURL = self.canvasElement.toDataURL(FORMAT[self.options.format.toLowerCase()], self.options.quality);
        self.frames.push(dataURL);    
    }, 1000 / self.options.fps);
    
    /*var imagedata = this.ctx.getImageData(0, 0, this.canvasElement.width, this.canvasElement.height);
  
    var canvaspixelarray = imagedata.data;    
    var canvaspixellen = canvaspixelarray.length;
    
  
    /*var bytearray = new Uint8Array(canvaspixellen);

    for (var i=0;i<canvaspixellen;++i) {
        bytearray[i] = canvaspixelarray[i];
    }
    return bytearray.buffer;*/
    return this;
}


CanvasPlayer.prototype.stopRecord = function(){
    if(this.recording && this.intervalID){
        clearInterval(this.intervalID);
        this.recording = false;
        this.intervalID = null;
        console.log("Stop recording...");
        return this;    
    }    
}

/**
 * getImages. Get a copy of the images in the canvas player buffer
 * @returns {Array} a copy of the images array
 */
CanvasPlayer.prototype.getImages = function(){
    if(!this.recording){
        return this.frames.slice(0);    
    }
    console.warn("Cannot get images while recording");
}

/**
 * clearBuffer. delete the array of images in the buffer
 */
CanvasPlayer.prototype.clearBuffer = function(){
    this.frames = [];
}

/**
 * play. if not a target canvas is specified it will create a new one canvas
 * where to play the images
 * @param {HTMLCanvasElement} target - target canvas
 */
CanvasPlayer.prototype.play = function(targetCanvas, loop){
    var self = this;
    
    if(!targetCanvas && !document.getElementById("playCanvas")){
        targetCanvas = document.createElement("canvas");
        /**
         *  TODO: calculate and consider the device pixel ratio and the orientation and the scale!!
         */                
        targetCanvas.setAttribute("style", "position:absolute;bottom:10px;left:0;");
        targetCanvas.width = self.canvasElement.width;
        targetCanvas.height = self.canvasElement.height;
        targetCanvas.setAttribute("id", "playCanvas");
        document.body.appendChild(targetCanvas);
    } else {
        targetCanvas = document.getElementById("playCanvas");
    }
    
    var targetCtx = targetCanvas.getContext("2d");
    var it = Iterator(self.frames);
    if(!self.recording && self.frames.length > 0){
        self.playing = true;
        
        self.image.addEventListener("load", function() {
           targetCtx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
           targetCtx.drawImage(self.image, 0, 0, targetCanvas.width, targetCanvas.height);           
        });
        
        self.playIntervalID = setInterval(function(){             
            var _next = it.next();
            if(_next.value){
                self.image.setAttribute("src", _next.value);
            } else if(_next.done && loop) {
                self.image.setAttribute("src", it.next(true).value);
            }            
            
        }, 1000 / self.options.fps);
    }
}

/**
 * stopPlay. stopplay if it's playing
 */
CanvasPlayer.prototype.stopPlay = function(){
    if(this.playing && this.playIntervalID){
        clearInterval(this.playIntervalID);
        this.playing = false;
        this.playIntervalID = null;
    }
}

module.exports = CanvasPlayer;