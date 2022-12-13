'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require("assert")
    /* NPM */
    
    /* in-package */
    , if2 = require("if2")
    ;

describe('if2', () => {
   
    it('false, true', () => {
        assert.strictEqual(true, if2(false, true));
    });

    it('false, 1', () => {
        assert.strictEqual(1, if2(false, 1));
    });

    it('true, false', () => {
        assert.strictEqual(true, if2(true, false));
    });

    it('false, null, undefined, 1', () => {
        assert.strictEqual(1, if2(false, null, undefined, 1));
    });

    it('"", true', () => {
        assert.strictEqual(true, if2("", true));
    });

    it('false, undefined, null, 0', () => {
        assert.strictEqual(undefined, if2(false, undefined, null, 0));
    });
});