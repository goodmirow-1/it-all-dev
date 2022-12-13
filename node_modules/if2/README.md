#   if2
__if2 A,B := if A then A else B__

##	Table Of Contents

*	[Get Started](#get-started)
*	[API](#api)
*	[Examples](#examples)

##	Links

[CHANGE LOG](./CHANGELOG.md)
[Homepage](https://github.com/YounGoat/ecmascript.if2)

##  Get Started

```js   
var if2 = require('if2');

if2(null, 1);
// RETURN 1

if2(true, 2);
// RETURN true

if2(null, undefined, false, 3);
// RETURN 3

if2(null, false, "");
// RETURN undefined
```

##  API

###	Basic

*   __if2__(...)  
	Return the first argument which is *truthy*。  
	Read [Truthy and Falsy: When All is Not Equal in JavaScript](https://developer.mozilla.org/en-US/docs/Glossary/Truthy) for more.

*	__if2.satisfies__( Function *judger*, ... )  
	Return the first remainder argument which satisfies the *judger*.  
	This method may be curried. If only one argument passed, it will return something like function *satisfiesJudger*.

*	__if2.is__( Function *proto*, ... )  
	Return the first remainder argument which is an instance of *proto*.  
	This method may be curried. If only one argument passed, it will return something like function *isInstanceOfProto*.

*	__if2.assignIfHasnot__( Object *foo*, string *propertyName*, ANY *value* )  
	Assign specified property of the object if it has not such property.
	
###	Predefined Methods

For convenience, some frequently-used judger is predfined. The usage of following methods is self-evident.

*	__if2.array__(...)
*	__if2.boolean__(...)
*	__if2.defined__(...)
*	__if2.function__(...)
*	__if2.number__(...)
*	__if2.string__(...)

##	Examples

__if2__ can be used with other type testing library such as [is](https://www.npmjs.com/package/is). E.g.

```javascript
const if2 = require('if2');
const is = require('is');

if2.statisfies(is.even, 1, 3, 4);
// RETURN 4
```