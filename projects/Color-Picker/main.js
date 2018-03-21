window.onload = function() {
'use strict'
    //let prevColor = '';
    let place = 1;
    let colorNum = 1;
    let colors = [];
    let savedColors = [];
    let currColor = '';
    let rgbVal = '';
  
    let body;
    let palette;
    let swatch;
    let colorLabel;

    let init = function () {
      body = document.querySelector('body');
      $("#currColor h1").fadeIn("slow");
      colorLabel = document.getElementById('currColor');

      palette = document.getElementById('paletteHolder');
      swatch = document.getElementById('');
      
      //intro();
      controls();
      controlBar();
      getColor();
      setColor();
    }
    
    let intro = function() {
      
    }
    
    let controlBar = function() {
      $("#hideSwatch").click(function() {
        $("#paletteHolder").slideToggle( "slow", function() {
          // Animation complete.
        });
      });
      
      $("#newColor").click(function() {
        keyPress(32);
      });
      
      $("#tint").click(function() {
        keyPress(115);
      });
      
      $("#lighten").click(function() {
        keyPress(119);
      });
    }

    let controls = function () {
      
      body.onkeypress = function (e) {
        keyPress(e.keyCode);
        //console.log(e.keyCode);
      }

      let swatches = document.getElementsByClassName('paletteBtn');

      for (let i = 0; i < swatches.length; i++) {
        swatches.item(i).onclick = function (e) {
          //deleteSwatch(i);
          copyToClipboard(i);
        }
      }
    }

    //handle key controls
    let keyPress = function (keyCode) {

      switch (keyCode) {
        //Space : new color
        case 32:
          if (place < colors.length) {
            place = colors.length;
          }
          getColor();

          //console.log("space");
          break;
          // Left: Move back
        case 97:
          if (place > 1) {
            place--;
            setColor();
          }

          //console.log("back");
          break;
          //Right: Move forward
        case 100:
          if (place < colors.length - 1) {
            place++;
            setColor();
          }
          break;
        case 115:
          tint();
          //place++;
          break;
        case 119:
          lighten();
          //place++;
          break;
        case 102:
          saveColor();
          break;
      }

      setColor();

      //console.log(place);
    }

    //add current color to saved array and update palette
    let saveColor = function () {
      if (colors[place][3] != 's') {
        savedColors.push(colors[place]);
        updatePalette();
      }

      colors[place][3] = 's';
      //console.log('saveColor ran');
    }

    //redraw saved colors
    let updatePalette = function () {
      palette.innerHTML = '';
      
      for (let i = 0; i < savedColors.length; i++) {
        let rgbVal = "rgb(" + savedColors[i][0] + "," + savedColors[i][1] + "," + savedColors[i][2] + ")";
        palette.innerHTML += "<button class='paletteBtn' title='" + rgbVal + "' style='background-color:" + rgbVal + ";'> </button>"
      }

      controls();
    }

    //delete swatch based on array place passed in
    let deleteSwatch = function (place) {
      savedColors.splice(place, 1);
      updatePalette();
      console.log(colors);
    }
    
    let copyToClipboard = function(element) {
      var $temp = $("<input>");
      $("body").append($temp);
      $temp.val($(element).prop('title')).select();
      console.log("copied" + $(element).prop("title"));
      document.execCommand("copy");
      $temp.remove();
      
      
    }

    //generate random color
    let getColor = function () {
      let redVal = randomInt(0, 255);
      let greenVal = randomInt(0, 255);
      let blueVal = randomInt(0, 255);

      currColor = 'rgb(' + redVal + ',' + greenVal + ',' + blueVal + ')';

      colors[place] = [redVal, greenVal, blueVal];
      //setColor();

      colorNum++;

      console.log(colors);
    }

    //darken color by 20%
    let tint = function () {
      
      let red = colors[place][0];
      let green = colors[place][1];
      let blue = colors[place][2];

      if (red >= 255) {
        red = 255;
      }

      if (blue >= 255) {
        blue = 255;
      }

      if (green >= 255) {
        green = 255;
      }

      if (red <= 255) {
        red = Math.round(red * .8);
      }

      if (green <= 255) {
        green = Math.round(green * .8);
      }

      if (blue <= 255) {
        blue = Math.round(blue * .8);
      }

      colors[place][0] = red;
      colors[place][1] = green;
      colors[place][2] = blue;

      //setColor();
    }

    //lighten by 20%
    let lighten = function () {
      let red = colors[place][0];
      let green = colors[place][1];
      let blue = colors[place][2];

      if (red < 255) {
        red = Math.round(red / .8);
      }

      if (green < 255) {
        green = Math.round(green / .8);
      }

      if (blue < 255) {
        blue = Math.round(blue / .8);
      }

      colors[place][0] = red;
      colors[place][1] = green;
      colors[place][2] = blue;

      //setColor();
    }

    //set bg color and reset label with current color
    let setColor = function () {
      let redVal = colors[place][0];
      let greenVal = colors[place][1];
      let blueVal = colors[place][2];

      body.style.backgroundColor = 'rgb(' + redVal + ',' + greenVal + ',' + blueVal + ')';
      colorLabel.innerHTML = 'rgb(' + redVal + ',' + greenVal + ',' + blueVal + ')';
    }

    //generate random int
    let randomInt = function (min, max) {
      return Math.floor(Math.random() * (max - min + 1) + min);
    }

    init();
}
