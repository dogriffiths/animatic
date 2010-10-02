/**
 * Copyright (c) 2010 David Griffiths, http://code.google.com/p/animatic/
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

var animatic_Objects = [];
var animatic_Attributes = [];

function animate(obj, attrName, targetValue, howManySecs, animatorToUse) {
  var animator = animatorToUse || runner;
  var t = howManySecs || 0.25;
  animatorFn = animator(t, obj[attrName], targetValue);
  animateWithAnimator(obj, attrName, animatorFn);
}

function drift(obj, heading, speedValue, maxXValue, maxYValue) {
  var speed = speedValue || 100;
  var maxX = maxXValue || window.innerWidth;
  var maxY = maxYValue || window.innerHeight;
  var attrNameY = "y";
  if (obj.top) {
    attrNameY = "top";
  }
  animatorFn = drifterY(speed, obj[attrNameY], heading, maxY);
  animateWithAnimator(obj, attrNameY, animatorFn);
  var attrNameX = "x";
  if (obj.left) {
    attrNameX = "left";
  }
  animatorFn = drifterX(speed, obj[attrNameX], heading, maxX);
  animateWithAnimator(obj, attrNameX, animatorFn);
}

function animateWithAnimator(obj, attrName, animatorFn) {
  obj["animatic_" + attrName] = animatorFn;
  for (var i = animatic_Objects.length - 1; i >= 0; i--) {
    var o = animatic_Objects[i];
    var a = animatic_Attributes[i];
    if ((o == obj) && (a == attrName)) {
      animatic_Objects.splice(i, 1);
      animatic_Attributes.splice(i, 1);
    }
  }
  animatic_Objects.push(obj);
  animatic_Attributes.push(attrName);
}

// Now repaint every 10 ms.
setInterval(function() { updateAll() }, 10);

function updateAll() {
  for (i in animatic_Objects) {
    var obj = animatic_Objects[i];
    var attrName = animatic_Attributes[i];
    var units = unitsFor(obj[attrName]);
    obj[attrName] = "" + obj["animatic_" + attrName]() + units;
  }
}

function stripUnits(s) {
    return s.replace(/[a-z%]/ig, "");
}
 
function unitsFor(s) {
    return s.replace(/[0-9.]/ig, "");
}
 
function runner(p, fromValue, toValue) {
  var v1 = eval(stripUnits(fromValue + ""));
  var v2 = eval(stripUnits(toValue + ""));
  var now = (new Date()).valueOf();
  var then = now + (p * 1000);
  function counterClosure() {
	var justNow = (new Date()).valueOf();
	if (justNow >= then) {
	  return v2;
	}
	var prop = (justNow - now) / (then - now);
	var currently = v1 + ((1-Math.sqrt(1-prop)) * (v2 - v1));
	return currently
  }
  return counterClosure;
}

function drifterX(speedValue, startXValue, headingValue, maxXValue) {
  var speed = speedValue;
  var startX = eval(stripUnits(startXValue + ""));
  var heading = eval(stripUnits(headingValue + ""));
  var maxX = eval(stripUnits(maxXValue + ""));
  var now = (new Date()).valueOf();
  function counterClosure() {
	var justNow = (new Date()).valueOf();
        var diff = (justNow - now);
        var cx = startX + diff * speed * Math.sin(heading * Math.PI / 180.0) / 1000;
        while (cx < 0) {
          cx = cx + maxX;
        }
        if (cx > maxX) {
          cx = cx % maxX;
        //   now = now + ((maxXValue - startX) / speed);
        }
document.title = "diff = " + (diff * speed * Math.sin(heading * Math.PI / 180.0) / 100) + " and cx = " + cx;
	return cx
  }
  return counterClosure;
}

function drifterY(speedValue, startYValue, headingValue, maxYValue) {
  var speed = speedValue;
  var startY = eval(stripUnits(startYValue + ""));
  var heading = eval(stripUnits(headingValue + ""));
  var maxY = eval(stripUnits(maxYValue + ""));
  var now = (new Date()).valueOf();
  function counterClosure() {
	var justNow = (new Date()).valueOf();
        var diff = (justNow - now);
        var cy = startY - diff * speed * Math.cos(heading * Math.PI / 180.0) / 1000;
        while (cy < 0) {
          cy = cy + maxY;
        }
        if (cy > maxY) {
          cy = cy % maxY;
          now = now + ((maxYValue - startY) / speed);
        }
	return cy
  }
  return counterClosure;
}

function rotator(p) {
  var now = (new Date()).valueOf();
  var then = now + (p * 1000);
  function counterClosure() {
	var justNow = (new Date()).valueOf();
	if (justNow >= then) {
	  now = justNow;
	  then = now + (p * 1000);
	}
	var prop = (justNow - now) / (then - now);
	return prop * 360.0;
  }
  return counterClosure;
}

function springer(p, min, scale) {
  var f = rotator(p);
  function counterClosure() {
	return scale * (Math.sin(f() * Math.PI / 180.0) + min);
  }
  return counterClosure;
}