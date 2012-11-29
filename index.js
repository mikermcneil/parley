var async = require('async');
var _ = require('underscore');

var Parley = module.exports = function () {
	var parley = this;

	// Whether this parley has been called at all yet
	parley.virgin = true;

	// Parse dependencies from arguments
	parley.dependencies = _.toArray(arguments) || [];

	// The execution queue for this parley instance
	parley.xQ = [];

	// Event delegation
	parley.subscribers = [];
	parley.subscribe = function (otherParley,cb) {
		otherParley.subscribers.push(cb);
	},
	parley.signal = function () {
		_.each(parley.subscribers,function (subscriberCb) {
			if (subscriberCb) subscriberCb();
		});
	};

	// A function to receive actual function for flow control
	// and delay execution until the queue is cleared
	var flowControl = function (fn,ctx) {
	
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

			// If this is the first call, and all dependencies are met, go ahead and start the parley
			if (parley.virgin) {
				parley.virgin = false;

				// Wait until all dependencies have finished before shifting the queue initially
				if (parley.dependencies) {
					async.forEach(parley.dependencies, function (item,cb) {
						parley.subscribe(item,cb);
					}, shiftQueue);
				}
				else shiftQueue();
			}
		};


		// Wrapper for actual function call
		// Receives original arugments as parameters
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
			var action = parley.xQ.pop();
			action.fn.apply(action.ctx,action.args);
		}

		// A callback function that is fired when the function is complete
		// At the end of the execution queue, fire a `done()` event, if one exists
		function cb () {
			if (parley.xQ.length > 0) {
				shiftQueue();
			}
			else parley.signal();
		}
	};

	// Save reference to subscribers
	flowControl.subscribers = parley.subscribers;
	return flowControl;
};