'use strict';

const MODULE_REQUIRE = 1
    /* built-in */
    
    /* NPM */
    
    /* in-package */
    ;

/**
 * Return the first argument which satisfy the judger.
 * @param  {Function} judger 
 */
function if2_satisfies(judger /*, value, ... */) {
    var ret;
    for (var i = 1; i < arguments.length; i++) {
        if (judger(arguments[i])) {
            ret = arguments[i];
            break;
        }
    }
    return ret;
}

function papply(judger) {
    return function() {
        var args = Array.from(arguments);
        args.unshift(judger);
        return if2_satisfies.apply(null, args);
    };
}

/**
 * Return the first argument which test true.
 * Return `undefined` if no argument matched.
 */
let if2 = papply(foo => foo);

/**
 * Return the first argument which is an
 * Return `undefined` if no argument matched.
 */
if2.array = papply(foo => foo instanceof Array);

/**
 * Return the first argument which is of type "number".
 * Return `undefined` if no argument matched.
 */
if2.number = papply(foo => typeof foo == 'number');

/**
 * Return the first argument which is of type "boolean".
 * Return `undefined` if no argument matched.
 */
if2.boolean = papply(foo => typeof foo == 'boolean');

/**
 * Return the first argument which is of type "string".
 * Return `undefined` if no argument matched.
 */
if2.string = papply(foo => typeof foo == 'string');

/**
 * Return the first argument which is of type "function".
 * Return `undefined` if no argument matched.
 */
if2.function = papply(foo => typeof foo == 'function');

/**
 * Return the first argument which is NOT of type "undefined".
 * Return `undefined` if no argument matched.
 */
if2.defined = papply(foo => typeof foo != 'undefined');

/**
 * Return the first remainder argument which satisfies the judger (the first argument).
 * Return `undefined` if no argument matched.
 * This function may be curried.
 */
if2.satisfies = function(fn) {
    return (arguments.length == 1) ? papply(fn) : if2_satisfies.apply(null, arguments);
};

/**
 * Return the first remainder argument which is instance of proto (the first argument).
 * Return `undefined` if no argument matched.
 * This function may be curried.
 */
if2.is = function(proto) {
    if (arguments.length == 1) {
        return papply(foo => foo instanceof proto);
    }
    else {
        let args = Array.from(arguments);
        args[0] = foo => foo instanceof proto;
        return if2_satisfies.apply(null, args);
    }
};

/**
 * Append key-value couple to the object if it does not has such property。
 * @param  {Object} foo
 * @param  {string} keyname
 * @param  {*}      value
 */
if2.assignIfHasnot = (foo, keyname, value) => {
    if (!foo.hasOwnProperty(keyname)) {
        foo[keyname] = value;
    }
};

module.exports = if2;