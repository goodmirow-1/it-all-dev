'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require("assert")
    /* NPM */
    
    /* in-package */
    , if2 = require("if2")
    ;

describe('if2.is', () => {
    it('if2.is(fn, ...)', () => {
        assert.equal(1, if2.is(Number, null, true, "99", 9, new Number(1)));
        assert.strictEqual(undefined, if2.is(Number, null, true, "99", 9));
    });

    it('if2.is(fn)', () => {
        assert.equal(1, if2.is(Number)(null, true, "99", 9, new Number(1)));
        assert.strictEqual(undefined, if2.is(Number)(null, true, "99", 9));
    });
});