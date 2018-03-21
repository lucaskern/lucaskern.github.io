// sound.js
"use strict";
// if app exists use the existing copy
// else create a new object literal
var app = app || {};

// define the .sound module and immediately invoke it in an IIFE
app.sound = (function(){
	console.log("sound.js module loaded");
	var bgAudio = undefined;
	var effectAudio = undefined;
	var currentEffect = 0;
	var currentDirection = 1;
	var effectSounds = ["move.mp3", "blocked.wav", "coin.wav", "attack.wav"];
    var bgSounds = ["bg-loop.wav","overworld-loop.mp3","dungeon-loop.mp3", "dead-loop.mp3", "shop-loop.mp3"];
	

	function init(){
		bgAudio = document.querySelector("#bgAudio");
		bgAudio.volume = 0.5;
        playBGAudio(2);
		effectAudio = document.querySelector("#effectAudio");
		effectAudio.volume = 0.3;
	}
		
	function stopBGAudio(){
		bgAudio.pause();
		bgAudio.currentTime = 0;
	}
	
	function playEffect(num){
		effectAudio.src = "Sounds/" + effectSounds[num];
		effectAudio.play();
	}
    
    function playBGAudio(num) {
        bgAudio.src = "Sounds/" + bgSounds[num];
        bgAudio.play();
    }
		
	// export a public interface to this module
	return{
        init: init,
        stopBGAudio: stopBGAudio,
        playEffect: playEffect,
        playBGAudio: playBGAudio
    };
}());