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

var _animatic_Objects = [];
var _animatic_Attributes = [];

//
// These are the major functions.
//

function stopAllAnimation()
{
    _animatic_Objects = [];
    _animatic_Attributes = [];
}

function _animatic_Sequencer()
{
}

/**
 * Animate an attribute of an object to some value.
 *
 *   animate(<object>, <attribute-name>, <to-value>, <how-many-secs>=0.5)
 *
 * For example, to animate the left-position of an object called heading
 * to 300px in 4 seconds, use:
 *
 *   animate(heading.style, "left", 300, 4);
 *
 */
function animate(obj, attrName, targetValue, howManySecs)
{
    var t = howManySecs || 0.25;
    var seq = new _animatic_Sequencer();
    if (obj[attrName] instanceof Array) {
        for (var i = 0; i < obj[attrName].length; i++) {
            var itemObject = new Object();
            itemObject["_object"] = obj;
            itemObject["_attr"] = "" + attrName;
            itemObject["_item_" + i] = obj[attrName][i];
            animatorFn = _animatic_runner(t, obj[attrName][i], targetValue[i], obj, attrName, seq);
            _animatic_animateWithAnimator(itemObject, "_item_" + i, animatorFn);
        }
    } else {
        animatorFn = _animatic_runner(t, obj[attrName], targetValue, obj, attrName, seq);
        _animatic_animateWithAnimator(obj, attrName, animatorFn);
    }
    return seq;
}

function rotate(obj, attrName, rpm)
{
    animatorFn = _animatic_rotator(60.0 / rpm);
    _animatic_animateWithAnimator(obj, attrName, animatorFn);
}

/**
 * Make an object drift across the screen at a constant rate. This
 * function will look to see if the object has "top" and "left"
 * attributes. Otherwise it will create "x" and "y" attributes on the
 * object and then animate them.
 *
 *   drift(<object>, <heading-angle>, <points-per-second>,
 *         [<wrap?> = true],
 *         [<max-y> = screen width], [<max-x> = screen height])
 *
 * For example, to make an object called "contents" drift across
 * the screen diagonally down-and-right at 100 pixels per second, use:
 *
 *   drift(contents.style, 135, 100);
 */
function drift(obj, heading, speedValue, wrapValue, maxXValue, maxYValue)
{
    if (speedValue == 0) {
        return;
    }
    var speed = speedValue || 100;
    var maxX = maxXValue || window.innerWidth;
    var maxY = maxYValue || window.innerHeight;
    var wrap = wrapValue;
    if (wrap == null) {
        wrap = true;
    }
    var attrNameY = "y";
    if (obj.top) {
        attrNameY = "top";
    }
    animatorFn = _animatic_drifterY(speed, obj[attrNameY], heading, wrap, maxY);
    _animatic_animateWithAnimator(obj, attrNameY, animatorFn);
    var attrNameX = "x";
    if (obj.left) {
        attrNameX = "left";
    }
    animatorFn = _animatic_drifterX(speed, obj[attrNameX], heading, wrap, maxX);
    _animatic_animateWithAnimator(obj, attrNameX, animatorFn);
}

/**
 * Stop the animation for a given object/attribute. If the attribute-name
 * is not given, this method will stop the animation of all attributes on
 * the object.
 *
 *   stopAnimation(<object>, [<attribute-name>])
 */
function stopAnimation(obj, attrNameValue)
{
    var attrName = attrNameValue || "";
    for (var i = _animatic_Objects.length - 1; i >= 0; i--) {
        var o = _animatic_Objects[i];
        var a = _animatic_Attributes[i];
        if ((o == obj) && ((a == attrName) || (attrName = ""))) {
            _animatic_Objects.splice(i, 1);
            _animatic_Attributes.splice(i, 1);
        }
    }
}

//
// And these are the rest
//

function _animatic_animateWithAnimator(obj, attrName, animatorFn)
{
    obj["animatic_" + attrName] = animatorFn;
    for (var i = _animatic_Objects.length - 1; i >= 0; i--) {
        var o = _animatic_Objects[i];
        var a = _animatic_Attributes[i];
        if ((o == obj) && (a == attrName)) {
            _animatic_Objects.splice(i, 1);
            _animatic_Attributes.splice(i, 1);
        }
    }
    _animatic_Objects.push(obj);
    _animatic_Attributes.push(attrName);
}

// Now repaint every 10 ms.
setInterval(function()
{
    _animatic_updateAll()
}, 10);

function _animatic_updateAll()
{
    for (i in _animatic_Objects) {
        var obj = _animatic_Objects[i];
        var attrName = _animatic_Attributes[i];
        var units = _animatic_unitsFor(obj[attrName]);
        var newValue = obj["animatic_" + attrName]();
        newValue = Math.round(newValue * 1000) / 1000;
        if (attrName.match("^_item_")  == "_item_") {
            var origObject = obj["_object"];
            var origAttr = obj["_attr"];
            var origIndex = eval(attrName.substring(6));
            origObject[origAttr][eval(origIndex)] = _animatic_addUnitsTo("" + newValue, units);
        } else {
            obj[attrName] = _animatic_addUnitsTo("" + newValue, units);
        }
    }
}

function _animatic_stripUnits(s)
{
    return ("" + s).replace( /[a-z%]/ig, "");
}

function _animatic_unitsFor(s)
{
    return ("" + s).replace( /[0-9.-]+/ig, "?");
}

function _animatic_addUnitsTo(s, u)
{
    if (u == "?") {
        return eval(s);
    }
    if (u.match(/\?.+\?/)) {
        throw "Animatic cannot animate an attribute with multiple parameters: '" + u + "'";
    }
    return u.replace( /\?/ig, "" + s);
}

function _animatic_now()
{
    return (new Date()).valueOf();
}

//
// The animator factories
//

function _animatic_runner(p, fromValue, toValue, obj, attrName, seq)
{
    var v1 = eval(_animatic_stripUnits(fromValue + ""));
    var v2 = eval(_animatic_stripUnits(toValue + ""));
    var now = _animatic_now();
    var then = now + (p * 1000);
    var seqRun = false;
    function counterClosure() {
        var justNow = _animatic_now();
        if (justNow >= then) {
            stopAnimation(obj, attrName);
            if (!seqRun) {
                seqRun = true;
                if (seq.next) {
                    seq.next();
                }
            }
            return v2;
        }
        var prop = (justNow - now) / (then - now);
        var currently = v1 + (Math.sin(prop * Math.PI / 2) * (v2 - v1));
        return currently;
    }
    return counterClosure;
}

function _animatic_drifterX(speedValue, startXValue, headingValue, wrap, maxXValue)
{
    var speed = speedValue;
    var startX = eval(_animatic_stripUnits(startXValue + ""));
    var heading = eval(_animatic_stripUnits(headingValue + ""));
    var maxX = eval(_animatic_stripUnits(maxXValue + ""));
    var now = _animatic_now();
    function counterClosure() {
        var justNow = _animatic_now();
        var diff = (justNow - now);
        var cx = startX + diff * speed * Math.sin(heading * Math.PI / 180.0) / 1000;
        if (wrap) {
            while (cx < 0) {
                cx = cx + maxX;
            }
            if (cx > maxX) {
                cx = cx % maxX;
//      now = now + ((maxXValue - startX) / speed);
            }
        }
        return cx;
    }
    return counterClosure;
}

function _animatic_drifterY(speedValue, startYValue, headingValue, wrap, maxYValue)
{
    var speed = speedValue;
    var startY = eval(_animatic_stripUnits(startYValue + ""));
    var heading = eval(_animatic_stripUnits(headingValue + ""));
    var maxY = eval(_animatic_stripUnits(maxYValue + ""));
    var now = _animatic_now();
    function counterClosure() {
        var justNow = _animatic_now();
        var diff = (justNow - now);
        var cy = startY - diff * speed * Math.cos(heading * Math.PI / 180.0) / 1000;
        if (wrap) {
            while (cy < 0) {
                cy = cy + maxY;
            }
            if (cy > maxY) {
                cy = cy % maxY;
                now = now + ((maxYValue - startY) / speed);
            }
        }
        return cy;
    }
    return counterClosure;
}

function _animatic_rotator(p)
{
    var now = _animatic_now();
    var then = now + (Math.abs(p) * 1000);
    var sign = (p < 0) ? -1 : 1;
    function counterClosure() {
        var justNow = _animatic_now();
        if (justNow >= then) {
            now = justNow;
            then = now + (Math.abs(p) * 1000);
        }
        var prop = (justNow - now) / (then - now);
        return sign * prop * 360.0;
    }
    return counterClosure;
}

function _animatic_springer(p, min, scale)
{
    var f = _animatic_rotator(p);
    function counterClosure() {
        return scale * (Math.sin(f() * Math.PI / 180.0) + min);
    }
    return counterClosure;
}
