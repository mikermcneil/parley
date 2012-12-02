// Dependencies
var async = require('async');
var _ = require('underscore');
var parley = require('./index.js');

function runTests() {

	function z(str, cb) {
		console.log(str);
		setTimeout(function() {
			cb(null, str);
		}, 1000);
	}

	function zzz($$promise, cb) {
		console.log("Got result:", $$promise.data);
		cb();
	}

	// Define deferred parley objects
	var $$ = new parley();
	var $$1 = new parley();
	var $$2 = new parley($$, $$1);

	//////////////////////////////////////////////////////////////////////
	// Basic usage
	//////////////////////////////////////////////////////////////////////
	// $$ (z) ('test');					// z('test')
	// $$ (z) ('2');						// z(2)
	// var $$result = $$ (z) ('3');		// result = {data: z(3)}
	// $$1 (z) ('some other chain');		// z('some other chain')
	// $$1 (z) ('some other chain #2');	// z('some other chain #2')
	// $$2 (zzz) ($$result);				// zzz(result)

	//////////////////////////////////////////////////////////////////////
	// Testing Parley.log
	//////////////////////////////////////////////////////////////////////
	var $$User = $$(User);
	// var $$log = $$(parley.log);
	// $$log($$User.find(3)); // This will return a data object
	// $$log($$User.find("Johnny")); // This will return an error

	
	//////////////////////////////////////////////////////////////////////
	// Real world use case
	//////////////////////////////////////////////////////////////////////
	var def = {
		name: 'johnny'
	};
	var cb = function(err, data, cb) {
			console.log("\n\n***\nOperation complete!");
			if (err) console.warn(err);
			else console.log(data);
			console.log("***\n");
		};
	var user = $$User.find(3);
	$$(cb)(user);
}


// Define User object for real world use case above
var User = { 
	// Random other parameters will remain untouched
	a: 1,
	b: "g248",
	c: "g8q234",

	// Mock find function
	find: function(criteria, cb) {
		setTimeout(function() {
			if(_.isObject(criteria) || _.isFinite(criteria)) {
				var result = criteria === 3 ? {
					name: "Martin"
				} : null;
				cb(null, result);
			} else cb("Invalid criteria parameter (" + criteria + ") passed to User.find.");
		}, 150);
	},
	create: function(definition, cb) {
		setTimeout(function() {
			if(_.isObject(definition)) {
				cb(null, definition);
			} else cb("Invalid definition parameter (" + definition + ") passed to User.create.");
		}, 150);
	}
};



runTests();


// BEST
// var user = User.findOrCreate(id,criteria).done(cb);
// function findOrCreate(criteria,exit) {
// 	User.find(id,function (err,data) {
// 		if (err) return exit(err);
// 		if (data) return exit(null,data);
// 		User.create(def,function (err,data) {
// 			if (err) return exit(err);
// 			return exit(null,data);
// 		});
// 	});
// }
// WEIRD
// var user = $$User.find(id);
// $$(function (err,data,cb) {
// 	console.log("******* FIND COMPLETE   err:",err, "   data:  ",data, "cb:",cb);
// 	if (err) cb(err);
// 	else if (data) cb(err,data);
// 	else {
// 		var createdUser = $$User.create(def);
// 		$$(function (err,data) {
// 			console.log("-------> create complete",err,data);
// 			if (err) cb(err);
// 			else cb(err,data);
// 		}) (createdUser);
// 	}
// }) (user);
// Hypothetical solution:
// $$.hasError(user).then(cb)('Error finding user.');
// $$.isNotNull(user).then(cb)(user);
// $$User.create(def);
// $$.hasError(user).then(cb)('Error creating user.');

// $$.hasError(user).then(cb);
// $$.isNull(user).then(cb);
// $$(function(err,data,cb) {
// 	if (err) callback(err,data);
// 	else callback(null,data);
// }) (user);
// $$.onError(user).then(cb);
// $$.ifEqual(user,null).then(cb);

// $$User.create(def);
// $$.callback(cb)(user);			// Convert classic (err,data) callback so that it's parley-callback compatible
// $$(cb)(user);
// $$.breakIf(user,null);
// $$.ifError(user).stop();

// $$(function ($$r,cb) {
// 	if ($$r.) {
// 	}
// })(val);



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