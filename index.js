(function() {
	var async = require('async');
	var _ = require('underscore');

	var Parley = module.exports = function() {
		var parley = this;

		// Whether this parley has been called at all yet
		parley.virgin = true;

		// Parse dependencies from arguments
		parley.dependencies = _.toArray(arguments) || [];

		// The execution queue for this parley instance
		parley.xQ = [];

		// The discard stack
		parley.dStack = [];

		// Event delegation
		parley.subscribers = [];
		parley.subscribe = function(otherParley, cb) {
			otherParley.subscribers.push(cb);
		}, parley.signal = function(err, data) {
			_.each(parley.subscribers, function(subscriberCb) {
				if(subscriberCb) subscriberCb(err, data);
			});
		};

		// A function to receive actual function for flow control
		// and delay execution until the queue is cleared
		var flowControl = function(fn, ctx) {
			var isObject = _.isObject(fn);
			var isFn = _.isFunction(fn);

			// If the function is actually an object, return a copy of the object 
			// with all of its functions transformed into deferred functions
			if (isObject && !isFn) {
				var obj = _.clone(fn);
				for (var key in obj) {
					var value = obj[key];
					if (_.isFunction(value)) {
						obj[key] = receiveArgumentsAndShift(parley,value,ctx);
					}
				}
				return obj;
			}
			// If this is a normal function, 
			else if (isFn) {
				return receiveArgumentsAndShift(parley,fn,ctx);
			}
			else {
				throw new Error ("parley received an invalid object as a parameter.");
			}
		};

		// Save reference to subscribers
		flowControl.subscribers = parley.subscribers;
		return flowControl;
	};




	// A function which receives and assigns arguments for the current fn
	// It will also kick off the next function if necessary
	function receiveArgumentsAndShift(parley,fn,ctx) {
		return function () {
			// Append runFunction to execution queue
			var actionObject = {
				fn: runFunction,
				args: _.toArray(arguments),
				ctx: ctx,
				error: null,
				data: null
			};
			parley.xQ.unshift(actionObject);

			// If this is the first call, and all dependencies are met, go ahead and start the parley
			if(parley.virgin) {
				parley.virgin = false;

				// Wait until all dependencies have finished before shifting the queue initially
				if(parley.dependencies) {
					async.forEach(parley.dependencies, function(item, cb) {
						parley.subscribe(item, cb);
					}, shiftQueue);
				} else shiftQueue();
			}

			// Return the action objet
			return actionObject;
		};

		// A callback function that is fired when the function is complete
		// After each call, peek at execution queue and save error and result data
		// At the end of the execution queue, fire a `done()` event, if one exists
		function cb(err, data) {
			var lastAction = peek(parley.dStack);
			lastAction.error = err;
			lastAction.data = data;

			if(parley.xQ.length > 0) {
				shiftQueue();
			} else parley.signal(err, data);
		}

		// Shift an action out of the execution queue and onto the discard stack
		function shiftQueue() {
			var action = parley.xQ.pop();
			parley.dStack.push(action);
			action.fn.apply(action.ctx, action.args);
		}

		// Wrapper for actual function call
		// Receives original arugments as parameters
		function runFunction () {
			// Add callback as final argument
			var args = _.toArray(arguments);
			args.push(cb);

			// Run function in proper context w/ proper arguments
			// (if ctx is null, the fn will run in the global execution context)
			fn.apply(ctx, args);
		}
	}

	// Peek at upcoming item in queue
	function peek(arr) {
		return arr[arr.length - 1];
	}

	// Add deferred log function for logging parley result objects
	Parley.log = function () {
		var args = _.toArray(arguments);
		if (args.length < 2 || !_.isFunction(args[1]) || !_.isObject(args[0])) {
			throw new Error("Invalid arguments passed to Parley.log: ",args);
		}

		// Parse arguments
		var cb = args.pop();
		var result = args.shift();

		// Write error or data and trigger callback
		if (result.error) console.error(result.error);
		else console.log(result.data);
		cb(result.err,result.data);
	};

})();