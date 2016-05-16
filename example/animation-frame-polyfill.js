window.requestAnimationFrame = window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            window.oRequestAnimationFrame || 
            window.requestAnimationFrame ||  
            function(callback){
                window.setTimeout(callback, 1000 / 60);
            };