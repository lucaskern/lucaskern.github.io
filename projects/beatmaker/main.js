/*
Beat Maker
Created by: Lucas Kern
Github repo: https://github.com/lucaskern/BeatMaker
*/

'use strict'

//init vars
var canvas = undefined;
var ctx = undefined;
//sets up grid when true
var firstRun = true;
var accurate = false;
//pause/play
var playBool = true;
var frames = 100;
//speed of player
var framesLimit = 10;
//which column the player is on
var xSpot = 0;
var grid = [];
var temp = [];
//dimensions of grid, add 2 for each to account for border areas.
var width = 30 + 2;
var height = 9 + 2;
//size of each cell in px
var cellSize = 35;
//create an audioCtx  
var audCtx = undefined;
// create an oscillator
//var osc = undefined;
var playNote = function (frequency, attack, decay, cmRatio, index, oscType) {
    //lowers gain of overall sound to minimize distortion
    var compressor = audCtx.createDynamicsCompressor();
    // create our primary oscillator
    var carrier = audCtx.createOscillator();
    carrier.type = oscType;
    carrier.frequency.value = frequency;
    // create an oscillator for modulation
    var mod = audCtx.createOscillator();
    mod.type = oscType;
    // The FM synthesis formula states that our modulators 
    // frequency = frequency * carrier-to-modulation ratio.
    mod.frequency.value = frequency * cmRatio;
    var modGainNode = audCtx.createGain();
    // The FM synthesis formula states that our modulators 
    // amplitude = frequency * index
    modGainNode.gain.value = frequency * index;
    mod.connect(modGainNode);
    // plug the gain node into the frequency of
    // our oscillator
    modGainNode.connect(carrier.frequency);
    var envelope = audCtx.createGain();
    //Ramp up over attack time, fade out over decay time
    envelope.gain.linearRampToValueAtTime(1, audCtx.currentTime + attack);
    envelope.gain.linearRampToValueAtTime(0, audCtx.currentTime + attack + decay);
    //Connect nodes and then attach audio context
    carrier.connect(envelope);
    envelope.connect(compressor);
    compressor.connect(audCtx.destination);
    //start and play notes for specified time and stop it.
    mod.start(audCtx.currentTime);
    carrier.start(audCtx.currentTime);
    mod.stop(audCtx.currentTime + attack + decay);
    carrier.stop(audCtx.currentTime + attack + decay);
    //End this note to mitigate distortion with many notes
    //osc.stop(audCtx.currentTime + attack + decay);
}
var init = function () {
    console.log("app.main.init() called");
    $("#tabs").tabs();
    // initialize properties
    canvas = document.querySelector('canvas');
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    ctx = canvas.getContext('2d');
    //set up controls
    controls();
    console.log("init ran");
    audCtx = new AudioContext();

    //set up grid on first init only
    if (firstRun) {
        gridSetup();
        firstRun = false;
    }

    update();
}
//create grid using default or user modified values
var gridSetup = function () {
    grid = [];
    temp = [];
    //create canvas at appropriate size
    canvas.width = width * cellSize;
    canvas.height = height * cellSize;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, 3000, 3000);
    //instantiate spaces in arrays
    for (var y = 0; y < height; y++) {
        grid[y] = [[]];
        temp[y] = [[]];
        for (var x = 0; x < width; x++) {
            //fill with empty
            grid[y][x] = [0];
            temp[y][x] = [0];
            //create border
            if (x == 0 || y == 0 || x == width - 1 || y == height - 1) {
                grid[y][x] = 0;
            }
        }
    }
}
//set up value controllers
var getMousePos = function (canvas, evt) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: Math.floor((evt.clientX - rect.left) / cellSize),
        y: Math.floor((evt.clientY - rect.top) / cellSize)
    };
}
var clickEffect = function (xCoord, yCoord) {
    if (grid[yCoord][xCoord][0] == 0) {
        var freqVal = parseFloat(document.getElementById("freq").value);
        var attackVal = parseFloat(document.getElementById("attack").value);
        var decayVal = parseFloat(document.getElementById("decay").value);
        var cmVal = parseFloat(document.getElementById("cm").value);
        var indexVal = parseFloat(document.getElementById("indexV").value);
        var oscType = document.getElementById("osc").value;
        //playNote(freqVal, attackVal, decayVal, cmVal, indexVal);
        //Create array of sound vals at loc
        grid[yCoord][xCoord][0] = 1;
        grid[yCoord][xCoord][1] = freqVal;
        grid[yCoord][xCoord][2] = attackVal;
        grid[yCoord][xCoord][3] = decayVal;
        grid[yCoord][xCoord][4] = cmVal;
        grid[yCoord][xCoord][5] = indexVal;
        grid[yCoord][xCoord][6] = oscType;
    } else {
        //delete note
        for (var i = 0; i < grid[yCoord][xCoord].length; i++) {
            grid[yCoord][xCoord][i] = 0;
        }
    }
    //console.log(xCoord + "," + yCoord);
}
var controls = function () {

    //add a note on click
    document.querySelector("canvas").addEventListener('click', function (evt) {
        var mousePos = getMousePos(canvas, evt);
        var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
        //console.log(message);
        clickEffect(mousePos.x, mousePos.y);
        //console.log("canvas click");
    }, false);

    //html control set up
    document.querySelector("#play").onclick = function (e) {
        play();
    };
    document.querySelector("#forward").onclick = function (e) {
        forward();
    };
    document.querySelector("#rand").onclick = function (e) {
        randomize();
    };
    document.querySelector("#speed").onchange = function (e) {
        framesLimit = e.target.value;
        document.querySelector("#speedVal").value = e.target.value;
    };
    document.querySelector("#getSong").onclick = function (e) {
        getSong();
    };
    document.querySelector("#setSong").onclick = function (e) {
        setSong();
    };

    $("#play").keypress(function () {
        console.log("Handler for .keypress() called.");
    });

    //Note table functionality
    var notes = document.getElementsByClassName("noteFreq");
    for (var i = 0; i < notes.length; i++) {
        notes[i].addEventListener('click', function (event) {
            var freqEl = document.querySelector("#freq");
            console.log(event);
            freqEl.value = event.target.innerText;
        }, false);
    }
}

var getSong = function () {
    //console.log(JSON.stringify(grid));
    console.log(grid);

    var songCode = JSON.stringify(grid);
    var songCodeBox = document.getElementById("trans");

    songCodeBox.value = songCode;
}

var setSong = function () {
    var songCode = document.getElementById("trans").value;
    console.log(grid);
    grid = JSON.parse(songCode);
    console.log(grid);
}

//Fill textboxes with correct ranges
var randomize = function () {
    var randomF = randomRange(10, 1000).toFixed(2);
    var randomA = randomRange(0, .5).toFixed(2);
    var randomD = randomRange(0, .5).toFixed(2);
    var randomC = randomRange(0, 10).toFixed(2);
    var randomI = randomRange(0, 10).toFixed(2);
    document.getElementById("freq").value = randomF;
    document.getElementById("attack").value = randomA;
    document.getElementById("decay").value = randomD;
    document.getElementById("cm").value = randomC;
    document.getElementById("indexV").value = randomI;
}
var randomRange = function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
var draw = function (xSpot) {
    ctx.fillStyle = 'white';
    ctx.strokeStyle = "#293241";
    ctx.lineWidth = 3;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (var y = 1; y < height - 1; y++) {
        for (var x = 1; x < width - 1; x++) {

            //change saturation of note based on octave
            if (grid[y][x][0] == 1) {
                if (grid[y][x][1] < 31) {
                    ctx.fillStyle = "rgb(99, 45, 32)";
                } else if (grid[y][x][1] < 66) {
                    ctx.fillStyle = "rgb(119, 54, 39)";
                } else if (grid[y][x][1] < 130) {
                    ctx.fillStyle = "rgb(139, 64, 45)";
                } else if (grid[y][x][1] < 261) {
                    ctx.fillStyle = "rgb(158, 73, 51)";
                } else if (grid[y][x][1] < 523) {
                    ctx.fillStyle = "rgb(178, 82, 58)";
                } else if (grid[y][x][1] < 1046) {
                    ctx.fillStyle = "rgb(198, 90, 64)";
                } else {
                    ctx.fillStyle = "rgb(217, 99, 70)";
                }

                //change shape of note based on osc type
                switch (grid[y][x][6]) {
                    case "sine":
                        ctx.beginPath();
                        ctx.arc(x * cellSize + cellSize / 2, y * cellSize + cellSize / 2, cellSize / 2.5, 0, 2 * Math.PI);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case "triangle":
                        ctx.beginPath();
                        ctx.moveTo(x * cellSize, y * cellSize + cellSize);
                        ctx.lineTo(x * cellSize + cellSize / 2, y * cellSize);
                        ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case "sawtooth":
                        ctx.beginPath();
                        ctx.moveTo(x * cellSize, y * cellSize + cellSize);
                        ctx.lineTo(x * cellSize + cellSize / 4, y * cellSize);
                        ctx.lineTo(x * cellSize + cellSize / 2, y * cellSize + cellSize / 1.5);
                        ctx.lineTo(x * cellSize + cellSize / 1.38, y * cellSize);
                        ctx.lineTo(x * cellSize + cellSize, y * cellSize + cellSize);
                        ctx.closePath();
                        ctx.fill();
                        break;
                    case "square":
                        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                        break;
                }
            }
        }
    }

    //draw grid
    for (var y = 1; y < height - 1; y++) {
        for (var x = 1; x < width - 1; x++) {
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }

    //play notes in the column
    for (var y = 0; y < height; y++) {

        if (playBool) {
            if (grid[y][xSpot][0] == 1) {
                playNote(grid[y][xSpot][1], grid[y][xSpot][2], grid[y][xSpot][3], grid[y][xSpot][4], grid[y][xSpot][5], grid[y][xSpot][6]);
            }
        }

        ctx.fillStyle = "rgba(238, 108, 77, 0.5)";
        ctx.fillRect(xSpot * cellSize, y * cellSize, cellSize, cellSize);
    }
}
var play = function () {
    if (playBool) {
        playBool = false;
    } else {
        playBool = true;
    }
    //console.log("play");
}
var forward = function () {
    //TO ADD: wrap around value if at end of grid
    xSpot++;
}
var update = function () {
    var animationID = requestAnimationFrame(update.bind());
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    //only draw once threshold is passed
    if (playBool) {
        if (frames >= framesLimit) {
            draw(xSpot);
            frames = 0;
            if (xSpot < width - 1) {
                xSpot = xSpot + 1;
            } else {
                xSpot = 0;
            }
        }
        frames++;
    } else if (!playBool) {
        draw(xSpot);
    }
    //stop tracking fps
    //window.requestAnimationFrame(update);
}
window.addEventListener('load', function () {
    console.log("window.onload ran");
    init();
});
