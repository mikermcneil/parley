/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var bluebird = require('bluebird');
var Deferred = require('./private/Deferred');



/**
 * parley()
 *
 * Build a deferred object that supports Node-style callbacks and promises.
 * > See README.md for more details.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param {Function} handleExec
 *        The `handleExec` function to call (either immediately or when the Deferred
 *        is executed, depending on whether an explicit cb was provided)
 *
 * @param {Function?} explicitCbMaybe
 *        An optional parameter that, if specified, is passed directly as the incoming
 *        `done` argument to your "handleExec" handler function (i.e. _its_ callback).
 *        Otherwise, if it is omitted, then handleExec receives an internally-generated
 *        callback (from parley) as its `done` argument.  When called, this implicit `done`
 *        will appropriately dispatch with the deferred object.  Finally, note that if an
 *        explicit callback is provided, parley will return undefined instead of returning
 *        a Deferred.
 *        > The nice thing about this is that it allows implementor code that provides this
 *        > feature to avoid manually duplicating the branching logic (i.e. the code that
 *        > checks to see if an explicit cb was provided, and if not, returns a new Deferred)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns {Deferred}
 * @throws {Error} If there are unexpected usage problems with how parley() itself is called
 */

module.exports = function parley(handleExec, explicitCbMaybe){

  // A few (very carefully picked) sanity checks for implementors.
  //
  // > Note that we deliberately use `typeof` instead of _.isFunction() for performance.
  if (!handleExec) {
    throw new Error('Consistency violation: Must specify a first argument when calling parley() -- please provide a `handleExec` function or a dictionary of options');
  }
  if (typeof handleExec !== 'function') {
    throw new Error('Consistency violation: First argument to parley() should be a function.  But instead, got: '+util.inspect(handleExec, {depth:2})+'');
  }

  //==========================================================================================
  // ALL OTHER **IMPLEMENTOR** USAGE CHECKS WERE REMOVED FOR PERFORMANCE REASONS.
  //
  // > Check out this commit for the original code:
  // > https://github.com/mikermcneil/parley/commit/e7ec7e445e2a502b9fcb57bc746c7b9714d3cf16
  // >
  // > Also note we still do a few (very carefully picked) validations for things that could
  // > affect end users of parley-implementing functions -- i.e. code that calls .exec() twice,
  // > etc.  That's all handled elsewhere (where the exec() method is defined.)
  //==========================================================================================



  //  ██╗  ██╗ █████╗ ███╗   ██╗██████╗ ██╗     ███████╗
  //  ██║  ██║██╔══██╗████╗  ██║██╔══██╗██║     ██╔════╝
  //  ███████║███████║██╔██╗ ██║██║  ██║██║     █████╗
  //  ██╔══██║██╔══██║██║╚██╗██║██║  ██║██║     ██╔══╝
  //  ██║  ██║██║  ██║██║ ╚████║██████╔╝███████╗███████╗
  //  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚══════╝
  //
  //  ███████╗██╗  ██╗██████╗ ██╗     ██╗ ██████╗██╗████████╗     ██████╗██████╗
  //  ██╔════╝╚██╗██╔╝██╔══██╗██║     ██║██╔════╝██║╚══██╔══╝    ██╔════╝██╔══██╗
  //  █████╗   ╚███╔╝ ██████╔╝██║     ██║██║     ██║   ██║       ██║     ██████╔╝
  //  ██╔══╝   ██╔██╗ ██╔═══╝ ██║     ██║██║     ██║   ██║       ██║     ██╔══██╗
  //  ███████╗██╔╝ ██╗██║     ███████╗██║╚██████╗██║   ██║       ╚██████╗██████╔╝
  //  ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝╚═╝ ╚═════╝╚═╝   ╚═╝        ╚═════╝╚═════╝
  //
  //  ╦╔═╗  ┌─┐┬─┐┌─┐┬  ┬┬┌┬┐┌─┐┌┬┐
  //  ║╠╣   ├─┘├┬┘│ │└┐┌┘│ ││├┤  ││
  //  ╩╚    ┴  ┴└─└─┘ └┘ ┴─┴┘└─┘─┴┘
  // If explicitCb provided, run the handleExec logic, then call the explicit callback.
  //
  // > All of the additional checks from below (e.g. try/catch) are NOT performed
  // > in the situation where an explicit callback was provided.  This is to allow
  // > for userland code to squeeze better performance out of particular method calls
  // > by simply passing through the callback directly.
  // > (As a bonus, it also avoids duplicating the code below in this file.)
  if (explicitCbMaybe) {

    handleExec(explicitCbMaybe);

    //  ██████╗ ███████╗████████╗██╗   ██╗██████╗ ███╗   ██╗
    //  ██╔══██╗██╔════╝╚══██╔══╝██║   ██║██╔══██╗████╗  ██║
    //  ██████╔╝█████╗     ██║   ██║   ██║██████╔╝██╔██╗ ██║
    //  ██╔══██╗██╔══╝     ██║   ██║   ██║██╔══██╗██║╚██╗██║
    //  ██║  ██║███████╗   ██║   ╚██████╔╝██║  ██║██║ ╚████║
    //  ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝
    //
    //  ██╗   ██╗███╗   ██╗██████╗ ███████╗███████╗██╗███╗   ██╗███████╗██████╗
    //  ██║   ██║████╗  ██║██╔══██╗██╔════╝██╔════╝██║████╗  ██║██╔════╝██╔══██╗
    //  ██║   ██║██╔██╗ ██║██║  ██║█████╗  █████╗  ██║██╔██╗ ██║█████╗  ██║  ██║
    //  ██║   ██║██║╚██╗██║██║  ██║██╔══╝  ██╔══╝  ██║██║╚██╗██║██╔══╝  ██║  ██║
    //  ╚██████╔╝██║ ╚████║██████╔╝███████╗██║     ██║██║ ╚████║███████╗██████╔╝
    //   ╚═════╝ ╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝╚══════╝╚═════╝
    //
    return;

  }//-•

  // Otherwise, no explicit callback was provided- so we'll build & return a Deferred...


  //   ██████╗ ████████╗██╗  ██╗███████╗██████╗ ██╗    ██╗██╗███████╗███████╗
  //  ██╔═══██╗╚══██╔══╝██║  ██║██╔════╝██╔══██╗██║    ██║██║██╔════╝██╔════╝██╗
  //  ██║   ██║   ██║   ███████║█████╗  ██████╔╝██║ █╗ ██║██║███████╗█████╗  ╚═╝
  //  ██║   ██║   ██║   ██╔══██║██╔══╝  ██╔══██╗██║███╗██║██║╚════██║██╔══╝  ██╗
  //  ╚██████╔╝   ██║   ██║  ██║███████╗██║  ██║╚███╔███╔╝██║███████║███████╗╚═╝
  //   ╚═════╝    ╚═╝   ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝ ╚══╝╚══╝ ╚═╝╚══════╝╚══════╝
  //
  //  ██████╗ ██╗   ██╗██╗██╗     ██████╗
  //  ██╔══██╗██║   ██║██║██║     ██╔══██╗
  //  ██████╔╝██║   ██║██║██║     ██║  ██║
  //  ██╔══██╗██║   ██║██║██║     ██║  ██║
  //  ██████╔╝╚██████╔╝██║███████╗██████╔╝
  //  ╚═════╝  ╚═════╝ ╚═╝╚══════╝╚═════╝
  //
  //  ██████╗ ███████╗███████╗███████╗██████╗ ██████╗ ███████╗██████╗
  //  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
  //  ██║  ██║█████╗  █████╗  █████╗  ██████╔╝██████╔╝█████╗  ██║  ██║
  //  ██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗██╔══██╗██╔══╝  ██║  ██║
  //  ██████╔╝███████╗██║     ███████╗██║  ██║██║  ██║███████╗██████╔╝
  //  ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝
  //
  // Build deferred object.
  //
  // > For more info & benchmarks, see:
  // > https://github.com/mikermcneil/parley/commit/5996651c4b15c7850b5eb2e4dc038e8202414553#commitcomment-20256030
  // >
  // > And also `baseline.benchmark.js` in this repo.
  // >
  // > But then also see:
  // > https://github.com/mikermcneil/parley/commit/023dc9396bdfcd02290624ca23cb2d005037f398
  // >
  // > (Basically, it keeps going back and forth between this and closures, but after a lot
  // > of experimentation, the prototypal approach seems better for overall performance.)
  var π = new Deferred(handleExec);

  // EXPERIMENTAL:
  // Dynamically attach additional methods.
  var moreMethods = { pretend: function(x,y){ console.log(x,y); return 4; } };
  if (moreMethods) {

    var methodFn;
    for (var methodName in moreMethods) {
      methodFn = moreMethods[methodName];
      if (_.has(π, methodName)) {
        throw new Error('Cannot override built-in method, `.'+methodName+'()`.');
      }
      π[methodName] = methodFn;
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Even with no contents, the following _.each() loop actually hurts the
    // performance of "just_build" benchmark by 93% (~13x as slow).  Granted, it was
    // very fast to begin with... but compare with the above code (for loop) which,
    // with no contents, only hurts performance by 25% ~(1.3x as slow).
    // ```
    // _.each(moreMethods, function (methodFn, methodName){ });
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  }//>-

  //  ██████╗ ███████╗████████╗██╗   ██╗██████╗ ███╗   ██╗
  //  ██╔══██╗██╔════╝╚══██╔══╝██║   ██║██╔══██╗████╗  ██║
  //  ██████╔╝█████╗     ██║   ██║   ██║██████╔╝██╔██╗ ██║
  //  ██╔══██╗██╔══╝     ██║   ██║   ██║██╔══██╗██║╚██╗██║
  //  ██║  ██║███████╗   ██║   ╚██████╔╝██║  ██║██║ ╚████║
  //  ╚═╝  ╚═╝╚══════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═══╝
  //
  //  ██████╗ ███████╗███████╗███████╗██████╗ ██████╗ ███████╗██████╗
  //  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝██╔══██╗
  //  ██║  ██║█████╗  █████╗  █████╗  ██████╔╝██████╔╝█████╗  ██║  ██║
  //  ██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗██╔══██╗██╔══╝  ██║  ██║
  //  ██████╔╝███████╗██║     ███████╗██║  ██║██║  ██║███████╗██████╔╝
  //  ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═════╝
  //
  // Return deferred object
  return π;

};
