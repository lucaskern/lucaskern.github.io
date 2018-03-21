// The myKeys object will be in the global scope - it makes this script 
// really easy to reuse between projects

"use strict";

var myKeys = {};

myKeys.KEYBOARD = Object.freeze({
	"KEY_LEFT": 37, 
	"KEY_UP": 38, 
	"KEY_RIGHT": 39, 
	"KEY_DOWN": 40,
	"KEY_SPACE": 32,
	"KEY_SHIFT": 16
});

// myKeys.keydown array to keep track of which keys are down
// this is called a "key daemon"
// main.js will "poll" this array every frame
// this works because JS has "sparse arrays" - not every language does
myKeys.keydown = [];

// event listeners
window.addEventListener("keydown",function(e){
	//console.log("keydown=" + e.keyCode);
	myKeys.keydown[e.keyCode] = true;
    
    var char = String.fromCharCode(e.keyCode);
    
    if(e.keyCode == 32 && e.target == document.body) {
        e.preventDefault();
        app.main.attackBlock();
        return false;
    }
    
    if(app.main.GAMESTATE == 5) {
        
        if(char == "h" || char == "H"){
            app.main.buyItem("heart");
        }
        
        if(char == "p" || char == "P"){
            app.main.buyItem("pick");
        }
        
        if(char == "e" || char == "E") {
            app.main.GAMESTATE = 1;
            app.main.sound.playBGAudio(1);
        }
    }
    
    if(char == "f" || char == "F"){
        app.main.damage();
    }
    
    if(char == "w" || char == "W"){
        app.main.movePlayer(0);
        app.main.flipPlayerSprite(0);
    } else if(char == "d" || char == "D"){
        app.main.movePlayer(1);
        app.main.flipPlayerSprite(1);
    } else if(char == "s" || char == "S"){
        app.main.movePlayer(2);
        app.main.flipPlayerSprite(2);
    } else if(char == "a" || char == "A"){
        app.main.movePlayer(3);
        app.main.flipPlayerSprite(3);
    }
    
    if(e.keyCode == "13" && app.main.GAMESTATE == 0)    
    {
        app.main.GAMESTATE = 1;
        app.main.sound.playBGAudio(1);
    } else if (e.keyCode == "13" && app.main.GAMESTATE == 4)
    {
        app.main.restart();
    }
});
	
window.addEventListener("keyup",function(e){
	//console.log("keyup=" + e.keyCode);
	myKeys.keydown[e.keyCode] = false;
	
	// pausing and resuming
    //pausing with key and then resuming with mouse causes speed to increase
	var char = String.fromCharCode(e.keyCode);
    
    
    
    
});

