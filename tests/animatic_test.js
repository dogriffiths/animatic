function equalsWithin2DP(result, expected, msg) {
    equals(Math.round(result * 100), Math.round(expected * 100), msg);
}

module("animatic module");

test("Test test", function() {
    equals(1, 0, "Yes - tests are working");
});
