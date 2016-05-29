"use strict";
var extend = require("./lib").extend;
var Iterator = require("./lib").Iterator;

/**
 * Default Options
 */
var defaultOptions = {
    canvasElement:null,
    fps:24,
    quality:0.5,
    format:"jpg"   
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
  this.canvasElement = document.querySelector(this.options.canvasElement);
  this.ctx = this.canvasElement.getContext("2d");
  this.frames = [];
  this.recordIntervalID = null;
  this.playrecordIntervalID = null;
  this.image = new Image();
  this.image.onload = this._render.bind(this);
  this.recording = false;
  this.playing = false;
  
  this.loopPlay = false;
  this.options.format = FORMAT[this.options.format.toLowerCase()];  
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
    this._recordLoop();        

    return this;
}

CanvasPlayer.prototype._recordLoop = function(){
    this.recordIntervalID = window.requestAnimationFrame(this._recordLoop.bind(this));    
    
    this.now = Date.now();
    this.delta = this.now - this.then;
                
    if (this.delta > this.interval) {        
        this.frames.push(this.canvasElement.toDataURL(this.options.format, this.options.quality));  
        this.then = this.now - (this.delta % this.interval);
    }
}

CanvasPlayer.prototype.stopRecord = function(){
    if(this.recording && this.recordIntervalID){
        window.cancelAnimationFrame(this.recordIntervalID);
        this.recording = false;
        this.recordIntervalID = null;
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
 * @param {String} targetCanvasSelector - target canvas
 */
CanvasPlayer.prototype.play = function(targetCanvasSelector, loop){
    var self = this;
    this.loopPlay = loop;
    
    this.targetCanvas = document.querySelector(targetCanvasSelector);
    if(!this.targetCanvas){
        this.targetCanvas = this.__buildTargetCanvas__();        
        document.body.appendChild(this.targetCanvas);
    } 
    
    this.targetCtx = this.targetCanvas.getContext("2d");
    this.playing = true;
    this._playLoop();
}

CanvasPlayer.prototype._playLoop = function(){
    if(!this.recording && this.frames.length > 0){
               
        this.myRequestAnimationID = window.requestAnimationFrame(this._playLoop.bind(this));
        
        this.now = Date.now();
        this.delta = this.now - this.then;
            
        if (this.delta > this.interval) {
            // update time stuffs
            
            var _next = this.imagesIterator.next();
            if(_next.value){
                this.image.setAttribute("src", _next.value);
            } else if(_next.done && this.loopPlay) {
                this.image.setAttribute("src", this.imagesIterator.next(true).value);
            }
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
        }        
    }
}

CanvasPlayer.prototype._render = function(){
     this.targetCtx.clearRect(0, 0, this.targetCanvas.width, this.targetCanvas.height);
     this.targetCtx.drawImage(this.image, 0, 0, this.targetCanvas.width, this.targetCanvas.height);
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
        window.cancelAnimationFrame(this.myRequestAnimationID);
        this.playing = false;
        this.myRequestAnimationID = null;
    }
}

CanvasPlayer.prototype.setFps = function(fps){
    this.options.fps = fps;
    this.interval = 1000 / this.options.fps;
}
module.exports = CanvasPlayer;