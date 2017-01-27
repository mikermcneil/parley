/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
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
 *
 * @param {Dictionary?} customMethods
 *        An optional dictionary of custom functions that, if specified, will be used to extend
 *        the Deferred object.  It omitted, then only the default methods like `.exec()` will
 *        exist.
 *        > e.g.
 *        > ```
 *        > {
 *        >   where: function (whereClause) {
 *        >     this._criteria = this._criteria || {};
 *        >     this._criteria.where = whereClause;
 *        >     return this;
 *        >   },
 *        >   foo: function(){...},
 *        >   bar: function(){...},
 *        >   ...
 *        > }
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns {Deferred}
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @throws {Error} If there are unexpected usage problems with how parley() itself is called
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

module.exports = function parley(handleExec, explicitCbMaybe, customMethods){

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

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: Add support for omens to improve the quality of the Error stack.
  // (prbly only for the deferred object though, not explicit cb usage)
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

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


  //  ┌─┐┌┬┐┌┬┐┌─┐┌─┐┬ ┬  ╔═╗╦ ╦╔═╗╔╦╗╔═╗╔╦╗  ╔╦╗╔═╗╔╦╗╦ ╦╔═╗╔╦╗╔═╗
  //  ├─┤ │  │ ├─┤│  ├─┤  ║  ║ ║╚═╗ ║ ║ ║║║║  ║║║║╣  ║ ╠═╣║ ║ ║║╚═╗
  //  ┴ ┴ ┴  ┴ ┴ ┴└─┘┴ ┴  ╚═╝╚═╝╚═╝ ╩ ╚═╝╩ ╩  ╩ ╩╚═╝ ╩ ╩ ╩╚═╝═╩╝╚═╝
  //  ┌─    ┬┌─┐  ┬─┐┌─┐┬  ┌─┐┬  ┬┌─┐┌┐┌┌┬┐    ─┐
  //  │───  │├┤   ├┬┘├┤ │  ├┤ └┐┌┘├─┤│││ │   ───│
  //  └─    ┴└    ┴└─└─┘┴─┘└─┘ └┘ ┴ ┴┘└┘ ┴     ─┘
  // If a dictionary of `customMethods` were provided, attach them dynamically.
  if (customMethods) {

    // Even with no contents, using an _.each() loop here would actually hurt the performance
    // of the "just_build" benchmark by 93% (~13x as slow).  Granted, it was very fast to
    // begin with... but compare with this `for` loop which, with no contents, only hurts
    // the same benchmark's performance by 25% ~(1.3x as slow).
    var methodFn;
    for (var methodName in customMethods) {

      // We explicitly prevent overriding:
      if (
        // • built-in methods:
        methodName === 'exec' ||
        methodName === 'then' ||
        methodName === 'catch' ||
        methodName === 'toPromise' ||

        // • other special, private properties:
        methodName === '_hasBegunExecuting' ||
        methodName === '_hasFinishedExecuting' ||
        methodName === '_handleExec' ||

        // • the standard JavaScript object flora:
        methodName === '__defineGetter__' ||
        methodName === '__defineSetter__' ||
        methodName === '__lookupGetter__' ||
        methodName === '__lookupSetter__' ||
        methodName === '__proto__' ||
        methodName === 'constructor' ||
        methodName === 'hasOwnProperty' ||
        methodName === 'isPrototypeOf' ||
        methodName === 'propertyIsEnumerable' ||
        methodName === 'toLocaleString' ||
        methodName === 'toString' ||
        methodName === 'valueOf' ||

        // • and things that are just a really bad idea:
        //   (or at the very least, which shouldn't be defined this way)
        methodName === 'prototype' ||
        methodName === 'toJSON' ||
        methodName === 'inspect'
      ) {
        throw new Error('Cannot define custom method (`.'+methodName+'()`) because `'+methodName+'` is a reserved/built-in property.');
      }
      methodFn = customMethods[methodName];
      π[methodName] = methodFn;
    }//</for>

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
