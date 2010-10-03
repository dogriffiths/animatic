function equalsWithin2DP(result, expected, msg) {
    equals(Math.round(result * 100) / 100, Math.round(expected * 100) / 100, msg);
}

var _mock_time = (new Date()).valueOf();
var _mock_time_offset = 0;

function mock_animatic_now()
{
    return _mock_time + _mock_time_offset;
}

module("animatic module");

test("Test simple animation starts at the right value", function() {
    var testObject = new Object();
    testObject.a = 1;
    var myTime = mock_animatic_now();
    _animatic_now = mock_animatic_now;
    animate(testObject, "a", 2);
    _mock_time_offset = 0; // 1/8th of a second
    _animatic_updateAll();
    // Check that the SQRT function animates the .a attribute to 1.29 (between 1 & 2)
    equalsWithin2DP(testObject.animatic_a(), 1, "Generated dynamic attribute function");
    equalsWithin2DP(testObject.a, 1, "Check attribute");
});

test("Test simple animation", function() {
    var testObject = new Object();
    testObject.a = 1;
    var myTime = mock_animatic_now();
    _animatic_now = mock_animatic_now;
    animate(testObject, "a", 2);
    var globalTime = _animatic_now();
    equals(globalTime, myTime, "Checking mock time");
    _mock_time_offset = 125; // 1/8th of a second
    _animatic_updateAll();
    equals(_animatic_now(), myTime + 125, "Checking mock time offset");
    // Check that the SQRT function animates the .a attribute to 1.29 (between 1 & 2)
    equalsWithin2DP(testObject.animatic_a(), 1.29, "Generated dynamic attribute function");
    equalsWithin2DP(testObject.a, 1.29, "Check attribute");
});

test("Test completed animation", function() {
    var testObject = new Object();
    testObject.a = 1;
    _animatic_now = mock_animatic_now;
    animate(testObject, "a", 2);
    _mock_time_offset = 2100; // 2.1 seconds
    _animatic_updateAll();
    equalsWithin2DP(testObject.a, 2, "Animation should have completed");
});

test("Test what happens with a string attribute with units", function() {
    var testObject = new Object();
    testObject.a = "1px";
    _mock_time_offset = 0;
    var myTime = mock_animatic_now();
    _animatic_now = mock_animatic_now;
    animate(testObject, "a", 2);
    var globalTime = _animatic_now();
    equals(globalTime, myTime, "Checking mock time");
    equals(_mock_time, myTime, "Checking initial mock time");
    _mock_time_offset = 125; // 1/8th second
    _animatic_updateAll();
    equals(_animatic_now(), myTime + 125, "Checking mock time offset");
document.title = testObject.a;
    equals(testObject.animatic_a(), 1.2928932188134525, "Animation should have completed");
    equals(testObject.a, "1.2928932188134525px", "Animation should have completed");
});






