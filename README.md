#CanvasPlayer

```javascript
    // Recording 5 seconds
    var canvasPlayer = new CanvasPlayer();
    canvasPlayer.record();
    setTimeout(function(){
        canvasPlayer.stopRecord()
                    .play(null, true);
    }, 5000);
```

[DEMO](http://eatsjobs.github.io/canvas-player/example/)