if(WebMidi){
  WebMidi
  .enable()
  .then(onEnabled)
  .catch(err => alert(err));
}

function onEnabled() {
  if(WebMidi.outputs){
    let midiOutMenu = document.createElement("optgroup")
    midiOutMenu.setAttribute("label", "MIDI out");
    document.getElementById("instrument").appendChild(midiOutMenu);
    function addMidiOption(e){
      let midiOption = document.createElement("option")
      midiOption.setAttribute("value", e);
      midiOption.textContent = e;
      midiOutMenu.appendChild(midiOption);
    }
    WebMidi.outputs.forEach(output => addMidiOption(output.name));
  }
  //initialize keyboard on load
  if(init_keyboard_onload)
  {
    //hide landing page
    document.getElementById('landing-page').style.display ='none';
    
    document.getElementById("instrument").value = ("instrument" in getData) ? getData.instrument : "organ";
    setTimeout(function(){ goKeyboard(); }, 1500);
  }
  window.addEventListener('beforeunload',(event) =>{
    myOutput.sendAllSoundOff();
  });
}

let myOutput = null;

//check\set preset
var init_keyboard_onload = true;
if(decodeURIComponent(window.location.search) == '')
{
  init_keyboard_onload = false;
}

checkPreset(16);
// fill in form
document.getElementById('settingsForm').onsubmit = goKeyboard;

var getData = new QueryData(location.search, true);
document.getElementById("fundamental").value = ("fundamental" in getData) ? getData.fundamental : 263.09212;
document.getElementById("rSteps").value = ("right" in getData) ? getData.right : 5;
document.getElementById("urSteps").value = ("upright" in getData) ? getData.upright : 2;
document.getElementById("hexSize").value = ("size" in getData) ? getData.size : 50;
document.getElementById("rotation").value = ("rotation" in getData) ? getData.rotation : 343.897886248;
// document.getElementById("instrument").value = ("instrument" in getData) ? getData.instrument : "organ";  //have to move this to onEnabled(), otherwise the value of #instrument will be set to an option that doesn't exist yet
document.getElementById("enum").checked = ("enum" in getData) ? JSON.parse(getData["enum"]) : false;
document.getElementById("equivSteps").value = ("equivSteps" in getData) ? getData.equivSteps : 31;
document.getElementById("spectrum_colors").checked = ("spectrum_colors" in getData) ? JSON.parse(getData.spectrum_colors) : false;
document.getElementById("fundamental_color").value = ("fundamental_color" in getData) ? getData.fundamental_color : '#55ff55';
document.getElementById("no_labels").checked = ("no_labels" in getData) ? JSON.parse(getData.no_labels) : false;


var global_pressed_interval;
var current_text_color = "#000000";

if ("scale" in getData) {
  document.getElementById("scale").value = getData.scale[0];
}

if ("names" in getData) {
  document.getElementById("names").value = getData.names[0];
}

if ("note_colors" in getData) {
  document.getElementById("note_colors").value = getData.note_colors[0];
}

hideRevealNames();
hideRevealColors();
hideRevealEnum();

function hideRevealNames() {
  if (document.getElementById("enum").checked) {
    document.getElementById("equivSteps").style.display = 'block';
    document.getElementById("names").style.display = 'none';
    document.getElementById("numberLabel").style.display = 'block';
    document.getElementById("namesLabel").style.display = 'none';
  } else {
    document.getElementById("equivSteps").style.display = 'none';
    document.getElementById("names").style.display = 'block';
    document.getElementById("numberLabel").style.display = 'none';
    document.getElementById("namesLabel").style.display = 'block';
  }
  changeURL();
}

function hideRevealColors() {
  if (document.getElementById("spectrum_colors").checked) {
    document.getElementById("fundamental_color").style.display = 'block';
    document.getElementById("fundamental_colorLabel").style.display = 'block';
    document.getElementById("note_colors").style.display = 'none';
    document.getElementById("note_colorsLabel").style.display = 'none';

  } else {
    document.getElementById("fundamental_color").style.display = 'none';
    document.getElementById("fundamental_colorLabel").style.display = 'none';
    document.getElementById("note_colors").style.display = 'block';
    document.getElementById("note_colorsLabel").style.display = 'block';
  }

  changeURL();

}

function hideRevealEnum() {
  if (document.getElementById("no_labels").checked) {
    document.getElementById("enum").disabled = true;
    document.getElementById("equivSteps").style.display = 'none';
    document.getElementById("names").style.display = 'none';
    document.getElementById("numberLabel").style.display = 'none';
    document.getElementById("namesLabel").style.display = 'none';
  } else {
    document.getElementById("enum").disabled = false;
    if (!document.getElementById('enum').checked) {
      document.getElementById("namesLabel").style.display = 'block';
      document.getElementById("names").style.display = 'block';
    } else {
      document.getElementById("equivSteps").style.display = 'block';
      document.getElementById("numberLabel").style.display = 'block';
    }
  }
  changeURL();
}

function Point(x, y) {
  this.x = x;
  this.y = y;
}

Point.prototype.equals = function(p) {
  return (this.x == p.x && this.y == p.y);
};

Point.prototype.plus = function(p) {
  var x = this.x + p.x;
  var y = this.y + p.y;
  return (new Point(x, y));
};

Point.prototype.minus = function(p) {
  var x = this.x - p.x;
  var y = this.y - p.y;
  return (new Point(x, y));
};

function changeURL() {
  var url = window.location.pathname + "?";
  // add fundamental, right, upright, size

  url += "fundamental=" + document.getElementById("fundamental").value +
    "&right=" + document.getElementById("rSteps").value +
    "&upright=" + document.getElementById("urSteps").value +
    "&size=" + document.getElementById("hexSize").value +
    "&rotation=" + document.getElementById("rotation").value +
    "&instrument=" + document.getElementById("instrument").value +
    "&enum=" + document.getElementById("enum").checked +
    "&equivSteps=" + document.getElementById("equivSteps").value +
    "&spectrum_colors=" + document.getElementById("spectrum_colors").checked +
    "&fundamental_color=" + document.getElementById("fundamental_color").value +
    "&no_labels=" + document.getElementById("no_labels").checked;

  url += "&scale=";
  url += encodeURIComponent(document.getElementById('scale').value);

  url += "&names=";
  url += encodeURIComponent(document.getElementById('names').value);

  url += "&note_colors=";
  url += encodeURIComponent(document.getElementById('note_colors').value);

  // Find scl file description for the page title

  var scaleLines = document.getElementById('scale').value.split('\n');
  var first = true;
  var foundDescription = false;
  var description = "Terpstra Keyboard WebApp";

  scaleLines.forEach(function(line) {
    if (!(foundDescription) && !(line.match(/^\!/)) && line.match(/[a-zA-Z]+/)) {
      foundDescription = true;
      description = line;
    }
  });

  document.title = description;

  window.history.replaceState({}, '', url);
}

var settings = {};

function parseScale() {
  settings.scale = [];
  var scaleLines = document.getElementById('scale').value.split('\n');
  scaleLines.forEach(function(line) {
    if (line.match(/^[1234567890.\s/]+$/) && !(line.match(/^\s+$/))) {
      if (line.match(/\//)) {
        // ratio
        var nd = line.split('/');
        var ratio = 1200 * Math.log(parseInt(nd[0]) / parseInt(nd[1])) / Math.log(2);
        settings.scale.push(ratio);
      } else {
        if (line.match(/\./))
        // cents
          settings.scale.push(parseFloat(line));
      }
    }
  });
  settings.equivInterval = settings.scale.pop();
  settings.scale.unshift(0);
}

function parseScaleColors() {
  settings.keycolors = [];
  var colorsArray = document.getElementById('note_colors').value.split('\n');
  colorsArray.forEach(function(line) {
    settings.keycolors.push(line);
  });
}

function calculateRotationMatrix(rotation, center) {
  var m = [];

  m[0] = Math.cos(rotation);
  m[1] = Math.sin(rotation);
  m[2] = -m[1];
  m[3] = m[0];
  m[4] = center.x - m[0] * center.x - m[2] * center.y;
  m[5] = center.y - m[1] * center.x - m[3] * center.y;

  return m;
}

function applyMatrixToPoint(m, p) { /*Array, Point*/
  return new Point(
    m[0] * p.x + m[2] * p.y + m[4],
    m[1] * p.x + m[3] * p.y + m[5]
  );
}

function resizeHandler() {
  // Resize Inner and outer coordinates of canvas to preserve aspect ratio

  var newWidth = window.innerWidth;
  var newHeight = window.innerHeight;

  settings.canvas.style.height = newHeight + 'px';
  settings.canvas.style.width = newWidth + 'px';

  settings.canvas.style.marginTop = (-newHeight / 2) + 'px';
  settings.canvas.style.marginLeft = (-newWidth / 2) + 'px';

  settings.canvas.width = newWidth;
  settings.canvas.height = newHeight;

  // Find new centerpoint

  var centerX = newWidth / 2;
  var centerY = newHeight / 2;
  settings.centerpoint = new Point(centerX, centerY);

  // Rotate about it

  if (settings.rotationMatrix) {
    settings.context.restore();
  }
  settings.context.save();

  settings.rotationMatrix = calculateRotationMatrix(-settings.rotation, settings.centerpoint);

  var m = calculateRotationMatrix(settings.rotation, settings.centerpoint);
  settings.context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);

  // Redraw Grid

  drawGrid();
}

function back() {
  // Remove key listener
  window.removeEventListener("keydown", onKeyDown);
  window.removeEventListener("keyup", onKeyUp);
  is_key_event_added = undefined;
  // Stop all active notes
  while (settings.activeHexObjects.length > 0) {
    var coords = settings.activeHexObjects[0].coords;
    settings.activeHexObjects[0].noteOff();
    drawHex(coords, centsToColor(hexCoordsToCents(coords), false));
    settings.activeHexObjects.splice(0, 1);
  }
  if(myOutput){
    myOutput.sendAllSoundOff();
  }
  // UI change
  document.getElementById("keyboard").style.display = "none";
  document.getElementById("backButton").style.display = "none";
  document.getElementById("landing-page").style.display = "block";
  document.body.style.overflow = 'scroll';
}

function goKeyboard() {

  changeURL();

  // Set up screen

  document.getElementById("landing-page").style.display = "none";
  document.getElementById("keyboard").style.display = "block";
  document.body.style.overflow = 'hidden';
  document.getElementById("backButton").style.display = "block";

  // set up settings constants

  settings.fundamental = document.getElementById("fundamental").value;
  settings.rSteps = document.getElementById("rSteps").value;
  settings.urSteps = parseFloat(settings.rSteps) - parseFloat(document.getElementById("urSteps").value); // Adjust to different coordinate system
  settings.hexSize = document.getElementById("hexSize").value;
  settings.rotation = (document.getElementById("rotation").value * 2 * Math.PI) / 360;
  parseScale();
  parseScaleColors();
  settings.names = document.getElementById('names').value.split('\n');
  settings["enum"] = document.getElementById('enum').checked;
  settings.equivSteps = parseInt(document.getElementById('equivSteps').value);

  settings.canvas = document.getElementById('keyboard');
  settings.context = settings.canvas.getContext('2d');

  settings.hexHeight = settings.hexSize * 2;
  settings.hexVert = settings.hexHeight * 3 / 4;
  settings.hexWidth = Math.sqrt(3) / 2 * settings.hexHeight;

  settings.no_labels = document.getElementById('no_labels').checked;
  settings.spectrum_colors = document.getElementById('spectrum_colors').checked;
  settings.fundamental_color = document.getElementById('fundamental_color').value;

  // Set up resize handler

  window.addEventListener('resize', resizeHandler, false);
  window.addEventListener('orientationchange', resizeHandler, false);

  //... and give it an initial call

  resizeHandler();

  // Set up synth

  settings.sampleBuffer = [undefined, undefined, undefined];
  var instrumentOption = document.getElementById("instrument").selectedIndex;
  var instruments = [{
      fileName: "piano",
      fade: 0.1
    }, {
      fileName: "harpsichord",
      fade: 0.2
    }, {
      fileName: "rhodes",
      fade: 0.1
    }, {
      fileName: "harp",
      fade: 0.2
    }, {
      fileName: "choir",
      fade: 0.5
    }, {
      fileName: "strings",
      fade: 0.9
    }, {
      fileName: "sawtooth",
      fade: 0.2
    }, {
      fileName: "gayageum",
      fade: 1
    }, {
      fileName: "qanun",
      fade: 1
    }, {
      fileName: "organ",
      fade: 0.1
    }, {
      fileName: "organleslie",
      fade: 0.1
    }, {
      fileName: "marimba",
      fade: 0.1
    }, {
      fileName: "musicbox",
      fade: 0.1
    }, {
      fileName: "WMRI3LST",
      fade: 0.1
    }, {
      fileName: "WMRI5LST",
      fade: 0.1
    }, {
      fileName: "WMRI5Lpike",
      fade: 0.1
    }, {
      fileName: "WMRI7LST",
      fade: 0.1
    }, {
      fileName: "WMRI11LST",
      fade: 0.1
    }, {
      fileName: "WMRI13LST",
      fade: 0.1
    }, {
      fileName: "WMRInLST",
      fade: 0.1
    }, {
      fileName: "WMRIByzantineST",
      fade: 0.1
    }, {
      fileName: "WMRI-in6-har7-",
      fade: 0.1
    }, {
      fileName: "WMRI-in7-har6-",
      fade: 0.1
    }

  ];

  //console.log(instruments[instrumentOption]);

  if(document.querySelector('#instrument option:checked').parentElement.label == 'MIDI out'){
    myOutput = WebMidi.getOutputByName(document.querySelector('#instrument option:checked').textContent);
    myOutput.sendAllSoundOff();
  }else {
    myOutput = null;
    loadSample(instruments[instrumentOption].fileName, 0);
    settings.sampleFadeout = instruments[instrumentOption].fade;
  }

  // Set up keyboard, touch and mouse event handlers

  settings.sustain = false;
  settings.sustainedNotes = [];
  //settings.canvas.addEventListener("keydown", onKeyDown, false); // Firefox isn't firing :(
  //settings.canvas.addEventListener("keyup", onKeyUp, false);

  if (typeof(is_key_event_added) == 'undefined') {
    is_key_event_added = 1;
    settings.pressedKeys = [];
    settings.keyCodeToCoords = {
      49 : new Point(-5, -2), // 1
      50 : new Point(-4, -2), // 2
      51 : new Point(-3, -2), // 3
      52 : new Point(-2, -2), // 4
      53 : new Point(-1, -2), // 5
      54 : new Point(0, -2), // 6
      55 : new Point(1, -2), // 7
      56 : new Point(2, -2), // 8
      57 : new Point(3, -2), // 9
      48 : new Point(4, -2), // 0
      189 : new Point(5, -2), // -
      187 : new Point(6, -2), // =

      81 : new Point(-5, -1), // Q
      87 : new Point(-4, -1), // W
      69 : new Point(-3, -1), // E
      82 : new Point(-2, -1), // R
      84 : new Point(-1, -1), // T
      89 : new Point(0, -1), // Y
      85 : new Point(1, -1), // U
      73 : new Point(2, -1), // I
      79 : new Point(3, -1), // O
      80 : new Point(4, -1), // P
      219 : new Point(5, -1), // [
      221 : new Point(6, -1), // ]

      65 : new Point(-5, 0), // A
      83 : new Point(-4, 0), // S
      68 : new Point(-3, 0), // D
      70 : new Point(-2, 0), // F
      71 : new Point(-1, 0), // G
      72 : new Point(0, 0), // H
      74 : new Point(1, 0), // J
      75 : new Point(2, 0), // K
      76 : new Point(3, 0), // L
      186 : new Point(4, 0), // ;
      222 : new Point(5, 0), // '

      90 : new Point(-5, 1), // Z
      88 : new Point(-4, 1), // X
      67 : new Point(-3, 1), // C
      86 : new Point(-2, 1), // V
      66 : new Point(-1, 1), // B
      78 : new Point(0, 1), // N
      77 : new Point(1, 1), // M
      188 : new Point(2, 1), // ,
      190 : new Point(3, 1), // .
      191 : new Point(4, 1), // /
    };
    window.addEventListener("keydown", onKeyDown, false);
    window.addEventListener("keyup", onKeyUp, false);
  }

  //iPad Shake to toggle sustain
  if (typeof window.DeviceMotionEvent != 'undefined') {
    var lastShakeCheck = 0;
    var lastShakeCount = 0;

    // Shake sensitivity (a lower number is more)
    var sensitivity = 5;

    // Position variables
    var x1 = 0,
      y1 = 0,
      z1 = 0,
      x2 = 0,
      y2 = 0,
      z2 = 0;

    // Listen to motion events and update the position
    window.addEventListener('devicemotion', function(e) {
      x1 = e.accelerationIncludingGravity.x;
      y1 = e.accelerationIncludingGravity.y;
      z1 = e.accelerationIncludingGravity.z;
    }, false);

    // Periodically check the position and fire
    // if the change is greater than the sensitivity
    setInterval(function() {
      lastShakeCheck++;
      var change = Math.abs(x1 - x2 + y1 - y2 + z1 - z2);

      if (change > sensitivity) {

        if (lastShakeCheck - lastShakeCount >= 3) {
          lastShakeCount = lastShakeCheck;

          if (settings.sustain == true) {
            settings.sustain = false;
            for (var note = 0; note < settings.sustainedNotes.length; note++) {
              settings.sustainedNotes[note].noteOff();
            }
            settings.sustainedNotes = [];
            tempAlert('Sustain Off', 900);
          } else {
            settings.sustain = true;
            tempAlert('Sustain On', 900);
          }
        }
      }

      // Update new position
      x2 = x1;
      y2 = y1;
      z2 = z1;
    }, 300);
  }

  //

  settings.activeHexObjects = [];
  settings.isTouchDown = false;
  settings.canvas.addEventListener("touchstart", handleTouch, false);
  settings.canvas.addEventListener("touchend", handleTouch, false);
  settings.canvas.addEventListener("touchmove", handleTouch, false);

  settings.isMouseDown = false;
  settings.canvas.addEventListener("mousedown", function(e) {
    if (settings.pressedKeys.length != 0 || settings.isTouchDown) {
      return;
    }
    settings.isMouseDown = true;
    settings.canvas.addEventListener("mousemove", mouseActive, false);
    mouseActive(e);
  }, false);

  settings.canvas.addEventListener("mouseup", function(e) {
    settings.isMouseDown = false;
    if (settings.pressedKeys.length != 0 || settings.isTouchDown) {
      return;
    }
    settings.canvas.removeEventListener("mousemove", mouseActive);
    if (settings.activeHexObjects.length > 0) {
      var coords = settings.activeHexObjects[0].coords;
      settings.activeHexObjects[0].noteOff();
      drawHex(coords, centsToColor(hexCoordsToCents(coords), false));
      settings.activeHexObjects.pop();
    }
  }, false);
  return false;
}

function onKeyDown(e) {
  if (e.keyCode == 32) { // Spacebar
    settings.sustain = true;
  } else if (!settings.isMouseDown && !settings.isTouchDown
      && (e.keyCode in settings.keyCodeToCoords)
      && settings.pressedKeys.indexOf(e.keyCode) == -1) {
    settings.pressedKeys.push(e.keyCode);
    var coords = settings.keyCodeToCoords[e.keyCode];
    var hex = new ActiveHex(coords);
    settings.activeHexObjects.push(hex);
    var cents = hexCoordsToCents(coords);
    drawHex(coords, centsToColor(cents, true));
    hex.noteOn(cents);
  }
}

function onKeyUp(e) {
  if (e.keyCode == 32) { // Spacebar
    settings.sustain = false;
    for (var note = 0; note < settings.sustainedNotes.length; note++) {
      settings.sustainedNotes[note].noteOff();
    }
    settings.sustainedNotes = [];
  } else if (!settings.isMouseDown && !settings.isTouchDown
      && (e.keyCode in settings.keyCodeToCoords)) {
    var keyIndex = settings.pressedKeys.indexOf(e.keyCode);
    if (keyIndex != -1) {
      settings.pressedKeys.splice(keyIndex, 1);
      var coords = settings.keyCodeToCoords[e.keyCode];
      drawHex(coords, centsToColor(hexCoordsToCents(coords), false));
      var hexIndex = settings.activeHexObjects.findIndex(function(hex) {
        return coords.equals(hex.coords);
      });
      if (hexIndex != -1) {
        settings.activeHexObjects[hexIndex].noteOff();
        settings.activeHexObjects.splice(hexIndex, 1);
      }
    }
  }
}

function mouseActive(e) {
  var coords = getPointerPosition(e);

  coords = getHexCoordsAt(coords);

  if (settings.activeHexObjects.length == 0) {
    settings.activeHexObjects[0] = new ActiveHex(coords);
    var cents = hexCoordsToCents(coords);
    settings.activeHexObjects[0].noteOn(cents);
    drawHex(coords, centsToColor(cents, true));
  } else {
    if (!(coords.equals(settings.activeHexObjects[0].coords))) {
      settings.activeHexObjects[0].noteOff();
      drawHex(settings.activeHexObjects[0].coords,
          centsToColor(hexCoordsToCents(settings.activeHexObjects[0].coords, false)));

      settings.activeHexObjects[0] = new ActiveHex(coords);
      var cents = hexCoordsToCents(coords);
      settings.activeHexObjects[0].noteOn(cents);
      drawHex(coords, centsToColor(cents, true));
    }
  }
}

function getPointerPosition(e) {
  var parentPosition = getPosition(e.currentTarget);
  var xPosition = e.clientX - parentPosition.x;
  var yPosition = e.clientY - parentPosition.y;
  return new Point(xPosition, yPosition);
}

function getPosition(element) {
  var xPosition = 0;
  var yPosition = 0;

  while (element) {
    xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
    yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
    element = element.offsetParent;
  }
  return {
    x: xPosition,
    y: yPosition
  };
}

function handleTouch(e) {
  e.preventDefault();
  if (settings.pressedKeys.length != 0 || settings.isMouseDown) {
    settings.isTouchDown = false;
    return;
  }
  settings.isTouchDown = e.targetTouches.length != 0;

  for (var i = 0; i < settings.activeHexObjects.length; i++) {
    settings.activeHexObjects[i].release = true;
  }

  for (var i = 0; i < e.targetTouches.length; i++) {
    var coords = getHexCoordsAt(new Point(e.targetTouches[i].pageX - settings.canvas.offsetLeft,
        e.targetTouches[i].pageY - settings.canvas.offsetTop));
    var found = false;

    for (var j = 0; j < settings.activeHexObjects.length; j++) {
      if (coords.equals(settings.activeHexObjects[j].coords)) {
        settings.activeHexObjects[j].release = false;
        found = true;
      }
    }
    if (!(found)) {
      var newHex = new ActiveHex(coords);
      var cents = hexCoordsToCents(coords);
      newHex.noteOn(cents);
      var c = centsToColor(cents, true);
      drawHex(coords, c);
      settings.activeHexObjects.push(newHex);
    }
  }

  for (var i = settings.activeHexObjects.length - 1; i >= 0; i--) {
    if (settings.activeHexObjects[i].release) {
      settings.activeHexObjects[i].noteOff();
      var coords = settings.activeHexObjects[i].coords;
      var c = centsToColor(hexCoordsToCents(coords), false);
      drawHex(coords, c);
      settings.activeHexObjects.splice(i, 1);
    }
  }
}

function drawGrid() {
  var max = (settings.centerpoint.x > settings.centerpoint.y) ?
      settings.centerpoint.x / settings.hexSize :
      settings.centerpoint.y / settings.hexSize;
  max = Math.floor(max);
  for (var r = -max; r < max; r++) {
    for (var ur = -max; ur < max; ur++) {
      var coords = new Point(r, ur);
      var c = centsToColor(hexCoordsToCents(coords), false);
      drawHex(coords, c);
    }
  }
}

function hexCoordsToScreen(hex) { /* Point */
  var screenX = settings.centerpoint.x + hex.x * settings.hexWidth + hex.y * settings.hexWidth / 2;
  var screenY = settings.centerpoint.y + hex.y * settings.hexVert;
  return (new Point(screenX, screenY));
}

function drawHex(p, c) { /* Point, color */

  var hexCenter = hexCoordsToScreen(p);

  // Calculate hex vertices

  var x = [];
  var y = [];
  for (var i = 0; i < 6; i++) {
    var angle = 2 * Math.PI / 6 * (i + 0.5);
    x[i] = hexCenter.x + settings.hexSize * Math.cos(angle);
    y[i] = hexCenter.y + settings.hexSize * Math.sin(angle);
  }

  // Draw filled hex

  settings.context.beginPath();
  settings.context.moveTo(x[0], y[0]);
  for (var i = 1; i < 6; i++) {
    settings.context.lineTo(x[i], y[i]);
  }
  settings.context.closePath();
  settings.context.fillStyle = c;
  settings.context.fill();

  // Save context and create a hex shaped clip

  settings.context.save();
  settings.context.beginPath();
  settings.context.moveTo(x[0], y[0]);
  for (var i = 1; i < 6; i++) {
    settings.context.lineTo(x[i], y[i]);
  }
  settings.context.closePath();
  settings.context.clip();

  // Calculate hex vertices outside clipped path

  var x2 = [];
  var y2 = [];
  for (var i = 0; i < 6; i++) {
    var angle = 2 * Math.PI / 6 * (i + 0.5);
    x2[i] = hexCenter.x + (parseFloat(settings.hexSize) + 3) * Math.cos(angle);
    y2[i] = hexCenter.y + (parseFloat(settings.hexSize) + 3) * Math.sin(angle);
  }

  // Draw shadowed stroke outside clip to create pseudo-3d effect

  settings.context.beginPath();
  settings.context.moveTo(x2[0], y2[0]);
  for (var i = 1; i < 6; i++) {
    settings.context.lineTo(x2[i], y2[i]);
  }
  settings.context.closePath();
  settings.context.strokeStyle = 'black';
  settings.context.lineWidth = 5;
  settings.context.shadowBlur = 15;
  settings.context.shadowColor = 'black';
  settings.context.shadowOffsetX = 0;
  settings.context.shadowOffsetY = 0;
  settings.context.stroke();
  settings.context.restore();

  // Add a clean stroke around hex

  settings.context.beginPath();
  settings.context.moveTo(x[0], y[0]);
  for (var i = 1; i < 6; i++) {
    settings.context.lineTo(x[i], y[i]);
  }
  settings.context.closePath();
  settings.context.lineWidth = 2;
  settings.context.lineJoin = 'round';
  settings.context.strokeStyle = 'black';
  settings.context.stroke();

  // Add note name and equivalence interval multiple

  settings.context.save();
  settings.context.translate(hexCenter.x, hexCenter.y);
  settings.context.rotate(-settings.rotation);
  // hexcoords = p and screenCoords = hexCenter

  //settings.context.fillStyle = "black"; //bdl_04062016
  settings.context.fillStyle = getContrastYIQ(current_text_color);
  settings.context.font = "22pt Arial";
  settings.context.textAlign = "center";
  settings.context.textBaseline = "middle";

  var note = p.x * settings.rSteps + p.y * settings.urSteps;
  var equivSteps = settings["enum"] ? parseInt(settings.equivSteps) : settings.scale.length;
  var equivMultiple = Math.floor(note / equivSteps);
  var reducedNote = note % equivSteps;
  if (reducedNote < 0) {
    reducedNote = equivSteps + reducedNote;
  }

  if (!settings.no_labels) {
    var name = settings["enum"] ? "" + reducedNote : settings.names[reducedNote];
    if (name) {
      settings.context.save();
      var scaleFactor = name.length > 3 ? 3 / name.length : 1;
      scaleFactor *= settings.hexSize / 50;
      settings.context.scale(scaleFactor, scaleFactor);
      settings.context.fillText(name, 0, 0);
      settings.context.restore();
    }

    var scaleFactor = settings.hexSize / 50;
    settings.context.scale(scaleFactor, scaleFactor);
    settings.context.translate(10, -25);
    settings.context.fillStyle = "white";
    settings.context.font = "12pt Arial";
    settings.context.textAlign = "center";
    settings.context.textBaseline = "middle";
    settings.context.fillText(equivMultiple, 0, 0);
  }

  settings.context.restore();
}

function centsToColor(cents, pressed) {
  var returnColor;
  if (!settings.spectrum_colors) {
    if (typeof(settings.keycolors[global_pressed_interval]) === 'undefined') {
      returnColor = "#EDEDE4";
    } else {
      returnColor = settings.keycolors[global_pressed_interval];
    }

    var oldColor = returnColor;

    //convert color name to hex
    returnColor = nameToHex(returnColor);

    current_text_color = returnColor;

    //convert the hex to rgb
    returnColor = hex2rgb(returnColor);

    //darken for pressed key
    if (pressed) {
      returnColor[0] -= 90;
      returnColor[1] -= 90;
    }

    return rgb(returnColor[0], returnColor[1], returnColor[2]);

  }

  var fcolor = hex2rgb("#" + settings.fundamental_color);
  fcolor = rgb2hsv(fcolor[0], fcolor[1], fcolor[2]);

  var h = fcolor.h / 360;
  var s = fcolor.s / 100;
  var v = fcolor.v / 100;
  //var h = 145/360; // green
  var reduced = (cents / 1200) % 1;
  if (reduced < 0) reduced += 1;
  h = (reduced + h) % 1;

  v = (pressed) ? v - (v / 2) : v;

  returnColor = HSVtoRGB(h, s, v);

  //setup text color
  var tcolor = HSVtoRGB2(h, s, v);
  current_text_color = rgbToHex(tcolor.red, tcolor.green, tcolor.blue);
  return returnColor;
}

function roundTowardZero(val) {
  if (val < 0) {
    return Math.ceil(val);
  }
  return Math.floor(val);
}

function hexCoordsToCents(coords) {
  var distance = coords.x * settings.rSteps + coords.y * settings.urSteps;
  var octs = roundTowardZero(distance / settings.scale.length);
  var reducedSteps = distance % settings.scale.length;
  if (reducedSteps < 0) {
    reducedSteps += settings.scale.length;
    octs -= 1;
  }
  var cents = octs * settings.equivInterval + settings.scale[reducedSteps];
  global_pressed_interval = reducedSteps;
  return cents;
}

function getHexCoordsAt(coords) {
  coords = applyMatrixToPoint(settings.rotationMatrix, coords);
  var x = coords.x - settings.centerpoint.x;
  var y = coords.y - settings.centerpoint.y;

  var q = (x * Math.sqrt(3) / 3 - y / 3) / settings.hexSize;
  var r = y * 2 / 3 / settings.hexSize;

  q = Math.round(q);
  r = Math.round(r);

  var guess = hexCoordsToScreen(new Point(q, r));

  // This gets an approximation; now check neighbours for minimum distance

  var minimum = 100000;
  var closestHex = new Point(q, r);
  for (var qOffset = -1; qOffset < 2; qOffset++) {
    for (var rOffset = -1; rOffset < 2; rOffset++) {
      var neighbour = new Point(q + qOffset, r + rOffset);
      var diff = hexCoordsToScreen(neighbour).minus(coords);
      var distance = diff.x * diff.x + diff.y * diff.y;
      if (distance < minimum) {
        minimum = distance;
        closestHex = neighbour;
      }
    }
  }

  return (closestHex);
}

function rgb(r, g, b) {
  return "rgb(" + r + "," + g + "," + b + ")";
}

function HSVtoRGB(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }
  return rgb(Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255));
}

function HSVtoRGB2(h, s, v) {
  var r, g, b, i, f, p, q, t;
  i = Math.floor(h * 6);
  f = h * 6 - i;
  p = v * (1 - s);
  q = v * (1 - f * s);
  t = v * (1 - (1 - f) * s);
  switch (i % 6) {
    case 0:
      r = v; g = t; b = p;
      break;
    case 1:
      r = q; g = v; b = p;
      break;
    case 2:
      r = p; g = v; b = t;
      break;
    case 3:
      r = p; g = q; b = v;
      break;
    case 4:
      r = t; g = p; b = v;
      break;
    case 5:
      r = v; g = p; b = q;
      break;
  }

  return {
    red: Math.floor(r * 255),
    green: Math.floor(g * 255),
    blue: Math.floor(b * 255)
  };
}

function getMidiFromCoords(e){
  let midinote = new Note(
    60  //  hardcoded C4
    + e.coords.x*settings.rSteps
    + e.coords.y*settings.urSteps
  );
  return midinote;
}

function ActiveHex(coords) {
  this.coords = coords;
  this.release = false;
  this.freq = 440;
}

ActiveHex.prototype.noteOn = function(cents, channel = 1) {
  if(myOutput){
    myOutput.playNote(getMidiFromCoords(this), [channel]);
    return;
  }
  var freq = settings.fundamental * Math.pow(2, cents / 1200);
  var source = settings.audioContext.createBufferSource(); // creates a sound source
  // Choose sample
  var sampleFreq = 110;
  var sampleNumber = 0;
  if (freq > 155) {
    if (freq > 311) {
      if (freq > 622) {
        sampleFreq = 880;
        sampleNumber = 3;
      } else {
        sampleFreq = 440;
        sampleNumber = 2;
      }
    } else {
      sampleFreq = 220;
      sampleNumber = 1;
    }
  }

  if (!(settings.sampleBuffer[sampleNumber])) return; // Sample not yet loaded

  source.buffer = settings.sampleBuffer[sampleNumber]; // tell the source which sound to play
  source.playbackRate.value = freq / sampleFreq;
  // Create a gain node.
  var gainNode = settings.audioContext.createGain();
  // Connect the source to the gain node.
  source.connect(gainNode);
  // Connect the gain node to the destination.
  gainNode.connect(settings.audioContext.destination);
  source.connect(gainNode); // connect the source to the context's destination (the speakers)
  gainNode.gain.value = 0.3;
  source.start(0); // play the source now
  this.source = source;
  this.gainNode = gainNode;
};

ActiveHex.prototype.noteOff = function(channel = 1) {
  if (settings.sustain) {
    settings.sustainedNotes.push(this);
  } else {
    if(myOutput){
      myOutput.stopNote(getMidiFromCoords(this), [channel]);
      return;
    }
    var fadeout = settings.audioContext.currentTime + settings.sampleFadeout;
    if (this.gainNode) {
      this.gainNode.gain.setTargetAtTime(0, settings.audioContext.currentTime,
          settings.sampleFadeout);
    }
    if (this.source) {
      // This is a terrible fudge. Please forgive me - it's late, I'm tired, I
      // have a deadline, I've got other shit to do
      this.source.stop(fadeout + 4);
    }
  }
};

window.addEventListener('load', init, false);

function init() {
  try {
    // Fix up for prefixing
    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    settings.audioContext = new AudioContext();
  } catch (e) {
    alert('Web Audio API is not supported in this browser');
  }
}

function loadSample(name, iteration) {
  // It seems audioContext doesn't cope with simultaneous decodeAudioData calls ):

  var sampleFreqs = ["110", "220", "440", "880"];
  //for (var i = 0; i < 4; ++i) {
  var request = new XMLHttpRequest();
  var url = 'sounds/' + name + sampleFreqs[iteration] + '.mp3';
  //console.log(iteration);
  request.open('GET', url, true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {
    settings.audioContext.decodeAudioData(request.response, function(buffer) {
      settings.sampleBuffer[iteration] = buffer;
      if (iteration < 3) loadSample(name, iteration + 1);
    }, onLoadError);
  };
  request.send();
  //}
}

function onLoadError(e) {
  alert("Couldn't load sample");
}



function tempAlert(msg, duration) {
  var el = document.createElement("div");
  el.setAttribute("style", "position:absolute;top:40%;left:20%;background-color:white; font-size:25px;");
  el.innerHTML = msg;
  setTimeout(function() {
    el.parentNode.removeChild(el);
  }, duration);
  document.body.appendChild(el);
}


function nameToHex(colour) {
  var colours = {
    "aliceblue": "#f0f8ff",
    "antiquewhite": "#faebd7",
    "aqua": "#00ffff",
    "aquamarine": "#7fffd4",
    "azure": "#f0ffff",
    "beige": "#f5f5dc",
    "bisque": "#ffe4c4",
    "black": "#000000",
    "blanchedalmond": "#ffebcd",
    "blue": "#0000ff",
    "blueviolet": "#8a2be2",
    "brown": "#a52a2a",
    "burlywood": "#deb887",
    "cadetblue": "#5f9ea0",
    "chartreuse": "#7fff00",
    "chocolate": "#d2691e",
    "coral": "#ff7f50",
    "cornflowerblue": "#6495ed",
    "cornsilk": "#fff8dc",
    "crimson": "#dc143c",
    "cyan": "#00ffff",
    "darkblue": "#00008b",
    "darkcyan": "#008b8b",
    "darkgoldenrod": "#b8860b",
    "darkgray": "#a9a9a9",
    "darkgreen": "#006400",
    "darkkhaki": "#bdb76b",
    "darkmagenta": "#8b008b",
    "darkolivegreen": "#556b2f",
    "darkorange": "#ff8c00",
    "darkorchid": "#9932cc",
    "darkred": "#8b0000",
    "darksalmon": "#e9967a",
    "darkseagreen": "#8fbc8f",
    "darkslateblue": "#483d8b",
    "darkslategray": "#2f4f4f",
    "darkturquoise": "#00ced1",
    "darkviolet": "#9400d3",
    "deeppink": "#ff1493",
    "deepskyblue": "#00bfff",
    "dimgray": "#696969",
    "dodgerblue": "#1e90ff",
    "firebrick": "#b22222",
    "floralwhite": "#fffaf0",
    "forestgreen": "#228b22",
    "fuchsia": "#ff00ff",
    "gainsboro": "#dcdcdc",
    "ghostwhite": "#f8f8ff",
    "gold": "#ffd700",
    "goldenrod": "#daa520",
    "gray": "#808080",
    "green": "#008000",
    "greenyellow": "#adff2f",
    "honeydew": "#f0fff0",
    "hotpink": "#ff69b4",
    "indianred": "#cd5c5c",
    "indigo": "#4b0082",
    "ivory": "#fffff0",
    "khaki": "#f0e68c",
    "lavender": "#e6e6fa",
    "lavenderblush": "#fff0f5",
    "lawngreen": "#7cfc00",
    "lemonchiffon": "#fffacd",
    "lightblue": "#add8e6",
    "lightcoral": "#f08080",
    "lightcyan": "#e0ffff",
    "lightgoldenrodyellow": "#fafad2",
    "lightgrey": "#d3d3d3",
    "lightgreen": "#90ee90",
    "lightpink": "#ffb6c1",
    "lightsalmon": "#ffa07a",
    "lightseagreen": "#20b2aa",
    "lightskyblue": "#87cefa",
    "lightslategray": "#778899",
    "lightsteelblue": "#b0c4de",
    "lightyellow": "#ffffe0",
    "lime": "#00ff00",
    "limegreen": "#32cd32",
    "linen": "#faf0e6",
    "magenta": "#ff00ff",
    "maroon": "#800000",
    "mediumaquamarine": "#66cdaa",
    "mediumblue": "#0000cd",
    "mediumorchid": "#ba55d3",
    "mediumpurple": "#9370d8",
    "mediumseagreen": "#3cb371",
    "mediumslateblue": "#7b68ee",
    "mediumspringgreen": "#00fa9a",
    "mediumturquoise": "#48d1cc",
    "mediumvioletred": "#c71585",
    "midnightblue": "#191970",
    "mintcream": "#f5fffa",
    "mistyrose": "#ffe4e1",
    "moccasin": "#ffe4b5",
    "navajowhite": "#ffdead",
    "navy": "#000080",
    "oldlace": "#fdf5e6",
    "olive": "#808000",
    "olivedrab": "#6b8e23",
    "orange": "#ffa500",
    "orangered": "#ff4500",
    "orchid": "#da70d6",
    "palegoldenrod": "#eee8aa",
    "palegreen": "#98fb98",
    "paleturquoise": "#afeeee",
    "palevioletred": "#d87093",
    "papayawhip": "#ffefd5",
    "peachpuff": "#ffdab9",
    "peru": "#cd853f",
    "pink": "#ffc0cb",
    "plum": "#dda0dd",
    "powderblue": "#b0e0e6",
    "purple": "#800080",
    "red": "#ff0000",
    "rosybrown": "#bc8f8f",
    "royalblue": "#4169e1",
    "saddlebrown": "#8b4513",
    "salmon": "#fa8072",
    "sandybrown": "#f4a460",
    "seagreen": "#2e8b57",
    "seashell": "#fff5ee",
    "sienna": "#a0522d",
    "silver": "#c0c0c0",
    "skyblue": "#87ceeb",
    "slateblue": "#6a5acd",
    "slategray": "#708090",
    "snow": "#fffafa",
    "springgreen": "#00ff7f",
    "steelblue": "#4682b4",
    "tan": "#d2b48c",
    "teal": "#008080",
    "thistle": "#d8bfd8",
    "tomato": "#ff6347",
    "turquoise": "#40e0d0",
    "violet": "#ee82ee",
    "wheat": "#f5deb3",
    "white": "#ffffff",
    "whitesmoke": "#f5f5f5",
    "yellow": "#ffff00",
    "yellowgreen": "#9acd32"
  };

  if (typeof colours[colour.toLowerCase()] != 'undefined') {
    return colours[colour.toLowerCase()];
  } else if (colour.indexOf("#") == 0) {
    return colour;
  } else if (colour.length == 6 && colour.indexOf("#") == -1) {
    return "#" + colour;
  }


  return "#EDEDE4"; //default button color!

}

function hex2rgb(col) {
  var r, g, b;
  if (col.charAt(0) == '#') {
    col = col.substr(1);
  }
  r = col.charAt(0) + col.charAt(1);
  g = col.charAt(2) + col.charAt(3);
  b = col.charAt(4) + col.charAt(5);
  r = parseInt(r, 16);
  g = parseInt(g, 16);
  b = parseInt(b, 16);
  return [r, g, b];
}

function rgb2hsv(r1, g1, b1) {
  var rr, gg, bb,
    r = arguments[0] / 255,
    g = arguments[1] / 255,
    b = arguments[2] / 255,
    h, s,
    v = Math.max(r, g, b),
    diff = v - Math.min(r, g, b),
    diffc = function(c) {
      return (v - c) / 6 / diff + 1 / 2;
    };

  if (diff == 0) {
    h = s = 0;
  } else {
    s = diff / v;
    rr = diffc(r);
    gg = diffc(g);
    bb = diffc(b);

    if (r === v) {
      h = bb - gg;
    } else if (g === v) {
      h = (1 / 3) + rr - bb;
    } else if (b === v) {
      h = (2 / 3) + gg - rr;
    }
    if (h < 0) {
      h += 1;
    } else if (h > 1) {
      h -= 1;
    }
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100)
  };
}

function getContrastYIQ(hexcolor) {
  hexcolor = hexcolor.replace("#", "");
  var r = parseInt(hexcolor.substr(0, 2), 16);
  var g = parseInt(hexcolor.substr(2, 2), 16);
  var b = parseInt(hexcolor.substr(4, 2), 16);
  var yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  return (yiq >= 128) ? 'black' : 'white';
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}


function checkPreset(init) {
  var mselect = document.getElementById('quicklinks');
  var url_str = window.location.href;

  //first check for .htm as end of url and set the default preset (31ET)
  if (url_str.substr(url_str.length - 4) == '.htm') {
    mselect.value = mselect.options[init].value;
  }
  for (var i = 0; i < mselect.length; i++) {
    if (url_str.indexOf(mselect.options[i].value) != -1) {
      //this is the correct preset
      mselect.value = mselect.options[i].value;
    }
  }
}

function noPreset() {
  ms = document.getElementById('quicklinks');
  ms.value = ms.options[0].value;
}


if(!WebMidi){
  //initialize keyboard on load
  if(init_keyboard_onload)
  {
    //hide landing page
    document.getElementById('landing-page').style.display ='none';

    document.getElementById("instrument").value = ("instrument" in getData) ? getData.instrument : "organ";
    setTimeout(function(){ goKeyboard(); }, 1500);
  }
}