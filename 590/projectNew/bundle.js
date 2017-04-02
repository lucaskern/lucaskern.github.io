(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$( function() {
    $( "#tabs" ).tabs();

    $("#controls-toggle").click(function() {
        $("#tabs").toggle();
    });

    $("#info-box").hide();

    $("#info-toggle").click(function() {
      $("#info-box").toggle();
    });
  } );

},{}],2:[function(require,module,exports){
/*
loader.js
variable 'app' is in global scope - i.e. a property of window.
app is our single global object literal - all other functions and properties of 
the game will be properties of app.
*/

"use strict";

const main = require('./main.js');
const controlScript = require('./controls');

window.addEventListener('load', function () {
  console.log("window.onload ran");
    let run = main.init();
})
},{"./controls":1,"./main.js":3}],3:[function(require,module,exports){

'use strict'
const app = {
  canvas: undefined,
  ctx: undefined,
  firstRun: true,
  accurate: false,
  playBool: true,
  audioClick: true,
  frames: 100,
  framesLimit: 3,
  grid: [],
  temp: [],
  width: 60,
  height: 30, //size of each cell in px
  cellSize: 25, //max amount of times a cell can be consecutively alive before dying.
  maxAge: 30, //how fast it changes color (higher : quicker)
  colorRate: 6, //color values for bg
  colorMode: "green", //color of cells
  colorVal: null,
  hueVal: 100,
  satVal: 80,
  brightVal: 12,
  slowCount: 0,
  border: true,
  lineW: 1,
  shape: 'flyer', //live neighbor count
  liveCount: 0, //create an audioCtx
  audCtx: undefined, // create an oscillator
  osc: undefined,

  init() {
    console.log("app.main.init() called");
    // initialize properties
    this.canvas = document.querySelector('canvas');
    this.canvas.width = this.width * this.cellSize;
    this.canvas.height = this.height * this.cellSize;
    this.ctx = this.canvas.getContext('2d');



    //set up controls
    this.controls();
    console.log("init ran");
    this.audCtx = new AudioContext();
    // create an oscillator
    this.osc = this.audCtx.createOscillator();
    // change waveform of oscillator
    this.osc.type = 'sawtooth';
    // start the oscillator running
    this.osc.start();
    //set up grid on first init only
    if (this.firstRun) {
      this.gridSetup();
      this.firstRun = false;
    }
    //this.playNote(880, .01, 1, 1.5307, 1);
    this.update();
  },
  //create grid using default or user modified values
  gridSetup() {
    this.grid = [];
    this.temp = [];
    //create canvas at appropriate size
    this.canvas.width = this.width * this.cellSize;
    this.canvas.height = this.height * this.cellSize;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, 3000, 3000);
    //instantiate spaces in arrays
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [[]];
      this.temp[y] = [[]];
      for (let x = 0; x < this.width; x++) {
        //fill with random values
        this.grid[y][x] = [Math.round(Math.random()), 0];
        this.temp[y][x] = [0, 0];

        //create border
        if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
          this.grid[y][x] = 0;
        }
      }
    }
  },
  getMousePos(canvas, evt) {
    var rect = this.canvas.getBoundingClientRect();
    return {
      x: Math.floor((evt.clientX - rect.left) / this.cellSize),
      y: Math.floor((evt.clientY - rect.top) / this.cellSize)
    };
  },
  clickEffect(xCoord, yCoord) {
    if (this.audioClick) {
      let freqVal = parseFloat(document.getElementById("freq").value);
      let attackVal = parseFloat(document.getElementById("attack").value);
      let decayVal = parseFloat(document.getElementById("decay").value);
      let cmVal = parseFloat(document.getElementById("cm").value);
      let indexVal = parseFloat(document.getElementById("indexV").value);

      this.grid[yCoord][xCoord][3] = 1;
      this.grid[yCoord][xCoord][4] = freqVal;
      this.grid[yCoord][xCoord][5] = attackVal;
      this.grid[yCoord][xCoord][6] = decayVal;
      this.grid[yCoord][xCoord][7] = cmVal;
      this.grid[yCoord][xCoord][8] = indexVal;
    } else {
      switch (this.shape) {
        case 'flyer':
          //this.grid[yCoord][xCoord][0] = 1;
          //this.grid[yCoord][xCoord][0] = 0;
          //this.grid[yCoord - 1][xCoord - 1][0] == 1
          this.grid[yCoord - 1][xCoord][0] = 1
          //this.grid[yCoord - 1][xCoord + 1][0] == 1
          //this.grid[yCoord][xCoord - 1][0] == 1
          this.grid[yCoord][xCoord + 1][0] = 1
          this.grid[yCoord + 1][xCoord - 1][0] = 1
          this.grid[yCoord + 1][xCoord][0] = 1
          this.grid[yCoord + 1][xCoord + 1][0] = 1
          break;
        case 'blinker':
          this.grid[yCoord][xCoord][0] = 1;
          //this.grid[yCoord - 1][xCoord - 1][0] == 1
          this.grid[yCoord - 1][xCoord][0] = 1
          //this.grid[yCoord - 1][xCoord + 1][0] == 1
          //this.grid[yCoord][xCoord - 1][0] == 1
          //this.grid[yCoord][xCoord + 1][0] = 1
          //this.grid[yCoord + 1][xCoord - 1][0] = 1
          this.grid[yCoord + 1][xCoord][0] = 1
          //this.grid[yCoord + 1][xCoord + 1][0] = 1
          break;
      }
    }
    console.log(xCoord + "," + yCoord);
  },
  //set up value controllers
  controls() {
    let thisRef = this;
    document.querySelector("canvas").addEventListener('click', function (evt) {
      var mousePos = thisRef.getMousePos(this.canvas, evt);
      var message = 'Mouse position: ' + mousePos.x + ',' + mousePos.y;
      //console.log(message);
      thisRef.clickEffect(mousePos.x, mousePos.y);
    }, false);

    //Constant controls
    document.querySelector("#play").onclick = function (e) {
      thisRef.play();
    };
    document.querySelector("#forward").onclick = function (e) {
      thisRef.forward();
    };

    //Render options
    document.querySelector("#speed").onchange = function (e) {
      thisRef.framesLimit = e.target.value;
      document.querySelector("#speedVal").value = e.target.value;
    };
    document.querySelector("#colorMode").onchange = function (e) {
      thisRef.colorMode = e.target.value;
    };
    document.querySelector("#dispMode").onchange = function (e) {
      if (e.target.value == "aesthetics") {
        thisRef.accurate = false;
        thisRef.gridSetup();
      } else {
        thisRef.accurate = true;
        thisRef.gridSetup();
      }
    };

    //Color options
    document.querySelector("#hue").onchange = function (e) {
      thisRef.hueVal = e.target.value;
      document.querySelector("#hueVal").value = e.target.value;
    };
    document.querySelector("#saturation").onchange = function (e) {
      thisRef.satVal = e.target.value;
      document.querySelector("#saturationVal").value = e.target.value;
    };
    document.querySelector("#bright").onchange = function (e) {
      thisRef.brightVal = e.target.value;
      document.querySelector("#brightVal").value = e.target.value;
    };

    //Grid options
    document.querySelector("#cellSize").onchange = function (e) {
      thisRef.cellSize = e.target.value;
      thisRef.gridSetup();
      document.querySelector("#cellSizeVal").value = e.target.value;
    };
    document.querySelector("#width").onchange = function (e) {
      thisRef.width = e.target.value;
      thisRef.gridSetup();
      document.querySelector("#widthVal").value = e.target.value;
    };
    document.querySelector("#height").onchange = function (e) {
      thisRef.height = e.target.value;
      thisRef.gridSetup();
      document.querySelector("#heightVal").value = e.target.value;
    };

    //Cell options
    document.querySelector("#maxAge").onchange = function (e) {
      thisRef.maxAge = e.target.value;
      document.querySelector("#maxAgeVal").value = e.target.value;
    };
    document.querySelector("#colorRate").onchange = function (e) {
      thisRef.colorRate = e.target.value;
      document.querySelector("#colorRateVal").value = e.target.value;
    };
    document.querySelector("#shape").onchange = function (e) {
      thisRef.shape = e.target.value;
    };
    document.querySelector("#border").onchange = function (e) {
      if (e.target.value == 0) {
        thisRef.border = false;
      } else {
        thisRef.border = true;
        thisRef.lineW = e.target.value;
      }

      document.querySelector("#borderVal").value = e.target.value;
    };

    document.querySelector("#clickMode").onchange = function (e) {
      if (e.target.value == "audio") {
        thisRef.audioClick = true;
      } else {
        thisRef.audioClick = false;
      }
    };

  },
  runAutomata() {
    // loop through every cell
    // look at cell neighbors and count live ones
    // determine next cell state based on neighbor count
    // set temp [y][x] -> new cell state
    this.liveCount = 0;
    //loop through and count live neighbors
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        if (this.grid[y - 1][x - 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y - 1][x][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y - 1][x + 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y][x - 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y][x + 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y + 1][x - 1][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y + 1][x][0] == 1) {
          this.liveCount++;
        }
        if (this.grid[y + 1][x + 1][0] == 1) {
          this.liveCount++;
        }
        //update temp
        if (this.grid[y][x][0] == 1) {
          if (this.liveCount == 1 || this.liveCount == 0) {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
            //playNote(333, .01, .5, 2.5307, 1);
          } else if (this.liveCount == 2 || this.liveCount == 3) {
            this.temp[y][x][0] = 1;
            this.temp[y][x][1]++;
          } else {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
          }
          if (this.grid[y][x][1] >= this.maxAge) {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
            if (this.grid[y][x][3] == 1) {
              let cell = this.grid[y][x]
              this.playNote(cell[4], cell[5], cell[6], cell[7], cell[8]);
            } else {
              //play note on death from old age
              //this.playNote(199, .08, .25, 1.5307, 1);
            }
          }
        } else if (this.grid[y][x][0] == 0) {
          if (this.liveCount == 3) {
            this.temp[y][x][0] = 1;
            this.temp[y][x][1]++;
          } else {
            this.temp[y][x][0] = 0;
            this.temp[y][x][1] = 0;
          }
        }
        this.liveCount = 0;

        this.grid[y][x][10] = (this.grid[y][x][1] * this.colorRate);

      }
    }
    // after for loop swap grid and temp arrays
    let swap = this.grid;
    this.grid = this.temp;
    //swap if conway rules is selected by user
    if (this.accurate) {
      this.temp = swap;
    }
  },
  draw() {
    //BG color, alpha is important
    this.ctx.fillStyle = 'rgba(0, 0, 0, .3)';
    this.ctx.fillRect(0, 0, this.width * this.cellSize, this.height * this.cellSize);
    //this.ctx.fillStyle = 'black';

    this.ctx.strokeStyle = "black";
    this.ctx.lineWidth = this.lineW;

    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        //determine color intensity of cell based on its age
        //change fillStyle based on color mode selected
        switch (this.colorMode) {
          case "pink":
            this.ctx.fillStyle = 'hsl( 280, ' + this.grid[y][x][10] * 3 + "%, " + this.grid[y][x][10] * 1.2 + '%)';
            break;
          case "green":
            this.ctx.fillStyle = 'hsl(89 ,' + this.grid[y][x][10] + "%, " + this.grid[y][x][10] * 0.7 + '%)';
            break;
          case "orange":
            this.ctx.fillStyle = 'hsl( 23, ' + this.grid[y][x][10] + "%, " + this.grid[y][x][10] * 0.5 + '%)';
            break;
          case "B&W":
            this.ctx.fillStyle = 'hsl( 0, 0%, ' + this.grid[y][x][10] + '%)';
            break;
          case "custom":
            this.ctx.fillStyle = 'hsl(' + this.hueVal + ',' +  (this.satVal / 30) * this.grid[y][x][10] + '%,' + (this.brightVal / 30) * this.grid[y][x][10] + '%)';
            break;
          case "rainbow":
            this.ctx.fillStyle = 'hsl(' + this.hueVal + ',' +  (this.satVal / 30) * this.grid[y][x][10] + '%,' + (this.brightVal / 30) * this.grid[y][x][10] + '%)';
            this.hueVal++;
            break;
          case "pulseF":
          case "pulseS":
              this.ctx.fillStyle = 'hsl(' + this.hueVal + ',' +  (this.satVal / 30) * this.grid[y][x][10] + '%,' + (this.brightVal / 30) * this.grid[y][x][10] + '%)';
              break;
          }

        if (this.grid[y][x][0] == 1) {
          if (this.grid[y][x][1] == this.maxAge - 1) {
            this.ctx.fillStyle = "red";
          } else if (this.grid[y][x][3] == 1) {
            this.ctx.fillStyle = 'hsl( 124, 100%, 60%)';
            //console.log(this.grid[y][x]);
          }
          //fill and stroke rects
          this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);


          if (this.border) {
            this.ctx.strokeRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
          }
        }
        //make border
        else if (x == 0 || y == 0 || x == this.width - 1 || y == this.height - 1) {
          this.ctx.fillStyle = "black";
          //this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
        }
      }

      if (this.colorMode == 'pulseF') {
        this.hueVal++;
      } else if (this.colorMode == 'pulseS') {
        this.slowCount++;

        if (this.slowCount > 30) {
          this.hueVal++;
          this.slowCount = 0;
        }

      }
    }
    //run round of cell calculations
    this.runAutomata();
  },
  play() {
    if (this.playBool) {
      this.playBool = false;
    } else {
      this.playBool = true;
    }
    console.log("play");
  },
  forward() {
    this.draw();
  },
  playNote(frequency, attack, decay, cmRatio, index) {
    //let audCtx = new AudioContext();
    // create our primary oscillator
    const carrier = this.audCtx.createOscillator();
    carrier.type = 'sine';
    carrier.frequency.value = frequency;
    // create an oscillator for modulation
    const mod = this.audCtx.createOscillator();
    mod.type = 'sine';
    // The FM synthesis formula states that our modulators
    // frequency = frequency * carrier-to-modulation ratio.
    mod.frequency.value = frequency * cmRatio;
    const modGainNode = this.audCtx.createGain();
    // The FM synthesis formula states that our modulators
    // amplitude = frequency * index
    modGainNode.gain.value = frequency * index;
    mod.connect(modGainNode);
    // plug the gain node into the frequency of
    // our oscillator
    modGainNode.connect(carrier.frequency);
    const envelope = this.audCtx.createGain();
    envelope.gain.linearRampToValueAtTime(1, this.audCtx.currentTime + attack);
    envelope.gain.linearRampToValueAtTime(0, this.audCtx.currentTime + attack + decay);
    carrier.connect(envelope);
    envelope.connect(this.audCtx.destination);
    mod.start(this.audCtx.currentTime);
    carrier.start(this.audCtx.currentTime);
    mod.stop(this.audCtx.currentTime + attack + decay);
    carrier.stop(this.audCtx.currentTime + attack + decay);
    //this.osc.close();
  },
  update() {
    this.animationID = requestAnimationFrame(this.update.bind(this));
    //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    //only draw once threshold is passed
    if (this.playBool) {
      if (this.frames >= this.framesLimit) {
        this.draw();
        this.frames = 0;
      }
      this.frames++;
    } else if (!this.playBool) {}
    //stop tracking fps
    //window.requestAnimationFrame(update);
  }
}
module.exports = app;

},{}]},{},[2]);
