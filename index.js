var _ = require('underscore');

var Parley = module.exports = function () {
	var parley = this;
	var virgin = 1;

	// The execution queue for this parley instance
	parley.xQ = [];

	// A function to receive actual function for flow control
	// and delay execution until the queue is cleared
	// *** flowControl = $$$()
	return function flowControl (fn,ctx) {
	
		// A function which receives and assigns arguments for the current fn
		// It will also kick off the next function if necessary
		return function receiveArgumentsAndShift () {

			// Unshift runFunction to execution queue
			var args = _.toArray(arguments);
			parley.xQ.unshift({
				fn: runFunction,
				args: args,
				ctx: ctx
			});

			// If this is the first call, go ahead and shift the exec queue
			if (virgin) {
				virgin = 0;
				shiftQueue();	
			}
		};

		// Wrapper for actual function call
		// Receives original arugments as parameters
		// *** runFunction = flowControl()
		function runFunction () {

			// Add callback as final argument
			var args = _.toArray(arguments);
			args.push(cb);

			// Run function in proper context w/ proper arguments
			// (if ctx is null, the fn will run in the global execution context)
			fn.apply(ctx,args);
		}

		// Shift the execution queue
		function shiftQueue () {
			var action = parley.xQ.shift();
			action.fn.apply(action.ctx,action.args);
		}

		// A callback function that is fired when the function is complete
		function cb () {
			if (parley.xQ.length > 0) {
				shiftQueue();
			}
		}
	};
};

// Thought:
//////////////////////////////////////////////////////////////////////
//
// instead of a callback function, execute a generator function that
// returns an incrementing id and pass in the result.
// This serializes function calls by providing a unique sequence.
// 
// A __getter__ on globals[] could be used as well to make the syntax even more concise.
//