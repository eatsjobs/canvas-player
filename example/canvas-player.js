(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.CanvasPlayer = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

module.exports = require("./src/CanvasPlayer");
},{"./src/CanvasPlayer":2}],2:[function(require,module,exports){
"use strict";
var extend = require("./lib").extend;
var Iterator = require("./lib").Iterator;

/**
 * Default Options
 */
var defaultOptions = {
    canvasElement:null,
    fps:29.97,
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
       

        /** self.playIntervalID = setInterval(function(){             
            var _next = it.next();
            if(_next.value){
                self.image.setAttribute("src", _next.value);
            } else if(_next.done && loop) {
                self.image.setAttribute("src", it.next(true).value);
            }
            
        }, 1000 / self.options.fps);**/
        
        requestAnimationFrame(self.play.bind(self, targetCanvas, loop));
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
    if(this.playing && this.playIntervalID){
        clearInterval(this.playIntervalID);
        this.playing = false;
        this.playIntervalID = null;
    }
}

module.exports = CanvasPlayer;
},{"./lib":3}],3:[function(require,module,exports){
/**
 * extend: this function merge two objects in a new one with the properties of both
 *
 * @alias module:src/lib.extend
 * @param {Object} o1 -
 * @param {Object} o2 -
 * @returns {Object} a brand new object results of the merging
 * */
function extend(o1, o2){

    var isObject = Object.prototype.toString.apply({});
    if((o1.toString() !== isObject) || (o2.toString() !== isObject)) {
        throw new Error("Cannot merge different type");
    }
    var newObject = {};
    for (var k in o1){
        if(o1.hasOwnProperty(k)){
            newObject[k] = o1[k];
        }
    }

    for (var j in o2) {
        if(o2.hasOwnProperty(j)){
            newObject[j] = o2[j];
        }
    }
    return newObject;
}


/**
 * Iterator
 *
 * @alias module:src/lib.Iterator
 * @example
 * var myArray = ["pippo", "pluto", "paperino"];
 * var it = lib.Iterator(myArray);
 * it.next().value === "pippo"; //true
 * it.next().value === "pluto"; //true
 * it.next(true).value === "paperino" //false because with true you can reset it!
 * @param {Array} array - the array you want to transform in iterator
 * @returns {Object} - an iterator-like object
 * */
function Iterator(array){
    var nextIndex = 0;

    return {
        next: function(reset){
            if(reset){nextIndex = 0;}
            return nextIndex < array.length ?
            {value: array[nextIndex++], done: false} :
            {done: true};
        }
    };
}

module.exports = {
    extend:extend,
    Iterator:Iterator
}
},{}]},{},[1])(1)
});