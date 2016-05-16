"use strict";
var extend = require("./lib").extend;
var Iterator = require("./lib").Iterator;

/**
 * Default Options
 */
var defaultOptions = {
    canvasElement:null,
    fps:29.97,
    quality:0.5,
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
  
  this.now;
  this.then = Date.now();
  this.interval = 1000 / this.options.fps;
  this.delta;
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
        this.imagesIterator = Iterator(this.frames);
        console.log("Stop recording...");
        return this;    
    }
    return this; 
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
 * @param {HTMLCanvasElement} [target=HTMLCanvasElement] - target canvas
 */
CanvasPlayer.prototype.play = function(targetCanvas, loop){
    var self = this;
    
    if(!targetCanvas && !document.getElementById("playCanvas")){
        this.targetCanvas = this.__buildTargetCanvas__();
        this.targetCtx = this.targetCanvas.getContext("2d");
        document.body.appendChild(this.targetCanvas);
    }
    
    if(!self.recording && self.frames.length > 0){
               
        this.myRequestAnimationID = requestAnimationFrame(self.play.bind(self, targetCanvas, loop));
        this.now = Date.now();
        this.delta = this.now - this.then;
            
        if (this.delta > this.interval) {
            // update time stuffs
                
            // Just `then = now` is not enough.
            // Lets say we set fps at 10 which means
            // each frame must take 100ms
            // Now frame executes in 16ms (60fps) so
            // the loop iterates 7 times (16*7 = 112ms) until
            // delta > interval === true
            // Eventually this lowers down the FPS as
            // 112*10 = 1120ms (NOT 1000ms).
            // So we have to get rid of that extra 12ms
            // by subtracting delta (112) % interval (100).
            // Hope that makes sense.
                
            this.then = this.now - (this.delta % this.interval);
                
            self.playing = true;
            self.image.addEventListener("load", self._render.bind(self)); 

            var _next = this.imagesIterator.next();
            if(_next.value){
                self.image.setAttribute("src", _next.value);
            } else if(_next.done && loop) {
                self.image.setAttribute("src", this.imagesIterator.next(true).value);
            }
        }        
        
    }
}

CanvasPlayer.prototype._render = function(){
     var self = this;
     self.targetCtx.clearRect(0, 0, self.targetCanvas.width, self.targetCanvas.height);
     self.targetCtx.drawImage(self.image, 0, 0, self.targetCanvas.width, self.targetCanvas.height);
}

CanvasPlayer.prototype.__buildTargetCanvas__ = function(){
    var canvas = document.createElement("canvas");
    canvas.setAttribute("style", "position:absolute;bottom:10px;left:5px;");
    canvas.setAttribute("id", "playCanvas");
    canvas.setAttribute("width", this.canvasElement.width);
    canvas.setAttribute("height", this.canvasElement.height);    
    return canvas;
}

/**
 * stopPlay. stopplay if it's playing
 */
CanvasPlayer.prototype.stopPlay = function(){
    if(this.playing && this.myRequestAnimationID){
        cancelAnimationFrame(this.myRequestAnimationID);
        this.playing = false;
        this.myRequestAnimationID = null;
    }
}

module.exports = CanvasPlayer;