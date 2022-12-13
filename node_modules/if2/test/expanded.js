'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    , assert = require("assert")
    /* NPM */
    
    /* in-package */
    , if2 = require("if2")
    ;

describe('if2.*', () => {
    it('if2.array', () => {
        assert.strictEqual(2, if2.array(null, true, [1,2], "99", {}, o => 0, 1).length);
        assert.strictEqual(undefined, if2.array(null, true, "99", {}, o => 0, 1));
    });

    it('if2.number', () => {
        assert.strictEqual(1, if2.number(null, true, "99", {}, o => 0, 1));
        assert.strictEqual(undefined, if2.number(null, true, "99", {}, o => 0));
    });

    it('if2.string', () => {
        assert.strictEqual("99", if2.string(null, true, "99", {}, o => 0, 1));
        assert.strictEqual(undefined, if2.string(null, true, {}, o => 0, 1));
    });

    it('if2.boolean', () => {
        assert.strictEqual(false, if2.boolean(null, false, "99", {}, o => 0, 1));
        assert.strictEqual(undefined, if2.boolean(null, "99", {}, o => 0, 1));
    });

    it('if2.function', () => {
        let fn = o => 0;
        assert.strictEqual(fn, if2.function(null, true, "99", {}, fn, 1));
        assert.strictEqual(undefined, if2.function(null, true, "99", {}, 1));
    });

    it('if2.defined', () => {
        let foo = { n: 1 };
        assert.strictEqual(1, if2.defined(foo.a, foo.b, foo.n, foo.c));
        assert.strictEqual(undefined, if2.defined(foo.a, foo.b, foo.c));
    });
});