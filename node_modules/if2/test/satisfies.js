'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require("assert")
    /* NPM */
    
    /* in-package */
    , if2 = require("if2")
    ;

describe('if2.satisfies', () => {
    it('if2.satisfies(fn, ...)', () => {
        let fn = n => typeof n == 'number' && n % 2 == 0;
        assert.strictEqual(8, if2.satisfies(fn, null, true, "2", 7, 8));
        assert.strictEqual(undefined, if2.satisfies(fn, null, true, "2", 7));
    });

    it('if2.satisfies(fn)', () => {
        let fn = n => typeof n == 'number' && n % 2 == 0;
        assert.strictEqual(8, if2.satisfies(fn)(null, true, "2", 7, 8));
        assert.strictEqual(undefined, if2.satisfies(fn)(null, true, "2", 7));
    });
    
});