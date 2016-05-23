var canvasElement = document.getElementsByTagName("canvas")[0];
canvasElement.width = 800, canvasElement.height = 400;
var ctx = canvasElement.getContext('2d');
var circles = [];
var baseCircleOptions = {
  x:100,
  y:100,
      radius:10,
      color:'green',
      step:5
}

var Options = function(options){
  this.options = options;
}
Options.prototype.extend = function(objectToMerge){
  var cloned = Object.create(this.options);
  for(var key in objectToMerge){
    cloned[key] = objectToMerge[key];
  }
  return cloned;
}

var option1 = new Options(baseCircleOptions).extend({step:1, color:'red'});
var option2 = new Options(baseCircleOptions).extend({step:5, color:'green'});
var option3 = new Options(baseCircleOptions).extend({step:3, color:'yellow'});

function Circle(ctx, defaults) {
  this.ctx = ctx;
  this.centerX = defaults.x;
  this.centerY = defaults.y;
  this.radius = defaults.radius;
  this.color = defaults.color;
  this.step = defaults.step;
  this.isMoving = false;
  this.directionX = 1;
  this.directionY = 1;
}

Circle.prototype.render = function() {
  this.ctx.beginPath();
  this.ctx.arc(this.centerX, this.centerY, this.radius, 0, 2 * Math.PI, false);
  this.ctx.fillStyle = this.color;
  this.ctx.fill();
  this.ctx.closePath();
};

Circle.prototype.move = function() {
  this.centerX += this.step * this.directionX;
  this.centerY += this.step * this.directionY;
  
  if((this.centerX + this.radius) > canvasElement.width || this.centerX - this.radius < 0){  
		  this.directionX *= -1;
  }
  
  if((this.centerY + this.radius) > canvasElement.height || this.centerY - this.radius < 0){  
		  this.directionY *= -1;
  }
};


circles.push(new Circle(ctx, option1));
circles.push(new Circle(ctx, option2));
circles.push(new Circle(ctx, option3));

function draw(){  
  ctx.clearRect(0, 0, 800, 400);  
  circles.forEach(function(circle){ circle.move();circle.render(); });  
}


var animID;
function animate() {

    animID = window.requestAnimationFrame(animate);
    draw();
}

function stop(){
  window.cancelAnimationFrame(animID);
}