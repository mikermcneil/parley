// Dependencies
var async = require('async');
var _ = require('underscore');
var parley = require('./index.js');


// Thought:
//////////////////////////////////////////////////////////////////////
//
// instead of a callback function, execute a generator function that
// returns an incrementing id and pass in the result.
// This serializes function calls by providing a unique sequence.
// 
// A __getter__ on globals[] could be used as well to make the syntax even more concise.
//

function z  (str,cb) {
	console.log(str);
	setTimeout(function () {
		cb (null,str);
	},1000);
}

function zzz ($$promise,cb) {
	console.log("Got result:",$$promise.data);
	cb();
}

// Define deferred parley objects
var $$ = new parley();
var $$1 = new parley();
var $$2 = new parley($$,$$1);

//////////////////////////////////////////////////////////////////////
// Basic usage
//////////////////////////////////////////////////////////////////////
$$ (z) ('test');					// z('test')
$$ (z) ('2');						// z(2)
var $$result = $$ (z) ('3');		// result = {data: z(3)}
$$1 (z) ('some other chain');		// z('some other chain')
$$1 (z) ('some other chain #2');	// z('some other chain #2')
$$2 (zzz) ($$result);				// zzz(result)

//////////////////////////////////////////////////////////////////////
// Aggregate usage
//////////////////////////////////////////////////////////////////////
var User = {						// Define User object
	a:1, b: "g248", c: "g8q234",

	// Mock find function
	find: function (criteria,cb) {
		if ( _.isObject(criteria) || _.isFinite(criteria) ) {
			cb(null, {
				name: 'Johnny'
			});
		}
		else cb("Invalid criteria parameter ("+criteria+") passed to User.find.");
	}
};

var $$User = $$(User);
var $$log = $$(parley.log);

$$log( $$User.find(3) );			// This will return a data object
$$log( $$User.find("Johnny") );		// This will return an error










// var result = $$(User).find(3);
// $$(function (result,cb) {
// 	console.log(result.error);
// 	console.log(result.data);
// 	cb();
// }) (result);

// $connect$ ( function (x,cb) {
// 	console.log(" Do more " + x + " stuff!");
// 	setTimeout(cb,100);
// }) ("111111111111");

// $other$ ( function (x,cb) {
// 	console.log(" Do more " + x + " stuff!");
// 	setTimeout(cb,200);
// }) ("22222222222");

// var $_result = $connect$ ( function (x,cb) {
// 	console.log(" Do more " + x + " stuff!");
// 	setTimeout(function (){
// 		cb(null,"some data");
// 	},500);
// }) ("33333333333");

// var $next$ = new parley ($connect$, $other$);
// $next$ (function ($$,cb) {
// 	if ($$.error) throw $$.error;
// 	console.log("DATA:",$$.data);
// 	cb();
// }) ($_result);