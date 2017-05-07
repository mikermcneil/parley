/**
 * Module dependencies
 */

// var assert = require('assert');
var util = require('util');
var _ = require('@sailshq/lodash');
var bluebird = require('bluebird');



/**
 * Deferred (constructor)
 *
 * The Deferred constructor is exported by this module (see bottom of file).
 *
 * ```
 * var deferred = new Deferred(function(done){
 *   // ...
 *   return done();
 * });
 * ```
 *
 * > Why use a constructor instead of just creating this object dynamically?
 * > This is purely for performance, since this is a rather hot code path.
 * > For details, see "OBSERVATIONS" in `tests/baseline.benchmark.js`.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param {Function} handleExec       [your function that should be run]
 *        @param {Function} done      [Node-style callback that your function should invoke when finished]
 *               @param {Error?} err
 *               @param {Ref?} resultMaybe
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @constructs {Deferred}
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @api private
 *      PLEASE DO NOT REQUIRE AND USE THIS CONSTRUCTOR EXCEPT WITHIN THIS PACKAGE!
 *      Instead, use `require('parley')` with the documented usage.  If you're
 *      trying to do this because you want to do an instanceof check, e.g. in
 *      a test, consider checking something like `_.isFunction(foo.exec)` and/or
 *      `foo.constructor.name === 'Deferred'`.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
function Deferred(handleExec){
  // assert(_.isFunction(handleExec), 'Should always provide a function as the 1st argument when constructing a `Deferred`');
  // assert.strictEqual(arguments.length, 1, 'Should always provide exactly 1 argument when constructing a `Deferred`');

  // Attach the provided `handleExec`function so it can be called from inside the
  // `.exec()` instance method below.
  // if (!_.isFunction(handleExec)){ throw new Error('Consistency violation: Expecting a function, but instead got: '+handleExec); }
  this._handleExec = handleExec;

  // Notes about our instance variables:
  //
  //  • We'll track the provided `handleExec` function as `this._handleExec`,
  //    so that we have a way to call it when the time comes. (See above.)
  //
  //  • We'll use `this._hasBegunExecuting` below to track whether we have
  //    begun executing this Deferred yet.  This is mainly for spinlocks.
  //
  //  • We'll use another instance variable below, `this._hasFinishedExecuting`,
  //    to track whether this Deferred has _finished_ yet.  This is mainly to
  //    improve error & warning messages.

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: Investigate the performance impact of using Object.defineProperty()
  // for this and all other built-in instance variables (e.g. the spinlock-related
  // flags.)  Also maybe for things like `toString()` and `inspect()`.
  //
  // This is really just as a nicety.  The reason it was so slow before was likely
  // due to the fact that it got run on every invocation, whereas now (at least in
  // some cases, like for `inspect()`) it could be implemented so that it runs exactly
  // once per process.
  //
  // Why bother?  Just because it makes Deferred instances nicer to look at.
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

}




/**
 * .exec()
 *
 * @param  {Function} _cb
 *         The Node-style callback to invoke when the parley-wrapped implementation is finished.
 *
 * @param  {Function} handleUncaughtException
 *         If specified, this function will be used as a handler for uncaught exceptions
 *         thrown from within `_cb`. **But REMEMBER: this will not handle uncaught exceptions
 *         from any OTHER asynchronous callbacks which might happen to be used within `_cb`.**
 *         (It's the same sort of function you might pass into `.catch()`.)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Example usage:
 *
 * ```
 * User.create({ username: 'foo' }).exec(function (err, result) {
 *   if (err) {
 *     if (err.code === 'E_UNIQUE') { return res.badRequest('Username already in use.'); }
 *     else { return res.serverError(err); }
 *   }
 *
 *   return res.ok();
 *
 * }, res.serverError);
 * ```
 */
Deferred.prototype.exec = function(_cb, handleUncaughtException){

  // If 2nd argument was provided, wrap `cb` in another function that protects
  // against uncaught exceptions.  Otherwise, just use `_cb` as-is.
  var cb;
  if (!_.isUndefined(handleUncaughtException)) {
    if (!_.isFunction(handleUncaughtException)) {
      throw new Error(
        'Sorry, `.exec()` doesn\'t know how to handle an uncaught exception handler like that:\n'+
        util.inspect(handleUncaughtException, {depth: 1})+'\n'+
        'If provided, the 2nd argument to .exec() should be a function like `function(err){...}`\n'+
        '(This function will be used as a failsafe in case the callback throws an uncaught error.)\n'+
        'See https://sailsjs.com/support for help.'
      );
    }//-•

    cb = function _tryToRunCb() {
      try {
        // > Note that we don't use .slice() -- this is for perf.
        // > (see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#what-is-safe-arguments-usage)
        return _cb.apply(undefined, arguments);
      } catch (e) { return handleUncaughtException(e); }
    };
  }
  else {
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Consider wrapping cb in a function that injects a try/catch.  If an unhandled
    // exception is thrown, our wrapper could check synchronicity and, if synchronous, inject
    // a `setImmediate()` call to ensure that the process crashes from an unhandled exception,
    // rather than outputting a rather puzzling error message -- e.g. about something unexpected
    // happening in the Deferred (when actually, the issue is that something went wrong in the
    // callback-- and that the Deferred logic happened to be synchronous.)
    //
    // This would take care of weird errors that have stuff like this in them:
    // "Also, here are the available keys on `self` at this point:\n```\n_handleExec,meta,usingConnection,where,limit,skip,paginate,sort,sum,avg,min,max,groupBy,select,omit,populateAll,populate,_WLModel,_wlQueryInfo,_hasBegunExecuting,_hasFinishedExecuting"
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    cb = _cb;
  }

  // Since thar be closure scope below, a hazard for young `this`s, we define `self`.
  var self = this;

  if (_.isUndefined(cb)) {
    throw new Error(
      'No callback supplied. Please provide a callback function when calling .exec().  '+
      'See https://sailsjs.com/support for help.'
    );
  }//-•

  if (!_.isFunction(cb)) {
    throw new Error(
      'Sorry, `.exec()` doesn\'t know how to handle a callback like that:\n'+
      util.inspect(cb, {depth: 1})+'\n'+
      'Instead, please provide a callback function when calling .exec().  '+
      'See https://sailsjs.com/support for help.'
    );
  }//-•

  // Userland spinlock
  if (self._hasBegunExecuting) {
    console.warn(
      '\n'+
      'That\'s odd... It looks like this Deferred '+
      'has already '+(self._hasFinishedExecuting?'finished':'begun')+' executing.\n'+
      'But attempting to execute a Deferred more than once tends to cause\n'+
      'unexpected race conditions and other bugs!  So to be safe, rather than\n'+
      'executing it twice, the additional attempt was ignored automatically, and\n'+
      'this warning was logged instead.  See https://sailsjs.com/support for help.\n'+
      'Stack trace:\n'+
      '```\n'+
      ((new Error()).stack).replace(/^.+\n/, '')+
      '```\n'
    );
    return;
  }//-•
  self._hasBegunExecuting = true;

  // Before proceeding to execute the function, set up a `setTimeout` that will fire
  // when the runtime duration exceeds the configured timeout.
  // > If configured timeout is falsey or <0, then we ignore it.
  var timeoutAlarm;
  if (self._timeout && self._timeout > 0) {
    timeoutAlarm = setTimeout(function(){
      return done(flaverr({name: 'TimeoutError'}, new Error(
        'Took too long to finish executing (timeout of '+self._timeout+'ms exceeded.)'
      )));
    }, self._timeout);// _∏_
  }//>-

  try {
    self._handleExec(function (err, result) {

      // Clear timeout, if relevant.
      if (timeoutAlarm) {
        clearTimeout(timeoutAlarm);
      }

      // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // TODO: Implementorland spinlock
      // e.g.
      // ```
      // if (self._hasFinishedExecuting) {
      //   console.warn(
      //     'Something seems to be wrong with this function.\n'+
      //     'It is trying to trigger your .exec() handler AGAIN...\n'+
      //     'after already calling it once.\n'+
      //     '(silently ignoring this...)'
      //   );
      //   return;
      // }
      // ```
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - -

      if (err) {
        if (_.isError(err)) { /* ok */ }
        else if (_.isString(err)) { err = new Error(err); }
        else { err = new Error(util.inspect(err, {depth: 5})); }

        self._hasFinishedExecuting = true;
        return cb(err);
      }//-•

      self._hasFinishedExecuting = true;

      // If there are any extra arguments, send them back too.
      // (This is unconventional, but permitted to allow for extra metadata,
      // which is sometimes handy when you want to expose advanced usage.)
      if (arguments.length > 2) {
        // > Note that we don't use .slice() -- this is for perf.
        // > (see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#what-is-safe-arguments-usage)
        return cb.apply(undefined, arguments);
      }
      // Otherwise, this is the normal case.
      // If there's no result, just call the callback w/ no args.
      // (This just makes for better log output, etc.)
      else if (_.isUndefined(result)) {
        return cb();
      }
      // Otherwise, there's a result, so send it back.
      else {
        return cb(undefined, result);
      }

    });//</self._handleExec>
  } catch (e) {

    var err;
    if (_.isError(e)) { err = e; }
    else if (_.isString(e)) { err = new Error(e); }
    else { err = new Error(util.inspect(e, {depth: 5})); }

    self._hasFinishedExecuting = true;

    return cb(err);
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // FUTURE: Consider using the more detailed explanation in some cases:
    // > see other "FUTURE" block above to read about the other stuff we'd want to do first--
    // > and also note that we'd almost certainly want to leave out the bit about "available
    // > keys on `self`" bit (that's really just leftover from debugging)
    // ```
    //    return cb(new Error(
    //      'Unexpected error was thrown while executing '+
    //      'this Deferred:\n'+
    //      '```\n'+
    //      err.stack+'\n'+
    //      '```\n'+
    //      'Also, here are the available keys on `self` at this point:\n'+
    //      '```\n'+
    //      _.keys(self)+'\n'+
    //      '```'
    //    ));
    // ```
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  }//</catch>
};

/**
 * .then()
 *
 * For usage, see:
 * http://bluebirdjs.com/docs/api/then.html
 */
Deferred.prototype.then = function (){
  var promise = this.toPromise();
  // > Note that we don't use .slice() -- this is for perf.
  // > (see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#what-is-safe-arguments-usage)
  return promise.then.apply(promise, arguments);
};

/**
 * .catch()
 *
 * For usage, see:
 * http://bluebirdjs.com/docs/api/catch.html
 */
Deferred.prototype.catch = function (){
  var promise = this.toPromise();
  // > Note that we don't use .slice() -- this is for perf.
  // > (see https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#what-is-safe-arguments-usage)
  return promise.catch.apply(promise, arguments);
};

/**
 * .toPromise()
 *
 * Begin executing this Deferred and return a promise.
 *
 * > See also:
 * > http://bluebirdjs.com/docs/api/promisify.html
 *
 * @returns {Promise}
 */
Deferred.prototype.toPromise = function (){

  // Use cached promise, if one has already been created.
  //
  // > This prevents extraneous invocation in `.then()` chains.
  // > (& potentially improves perf of `.catch()`)
  if (this._promise) {
    return this._promise;
  }//-•

  // Build a function that, when called, will begin executing the underlying
  // logic and also return a promise.
  var getPromise = bluebird.promisify(this.exec, { context: this });
  // ^^This is equivalent to `bluebird.promisify(this.exec).bind(this)`
  // > The reason we have to use `.bind()` here is so that `.exec()` gets
  // > called w/ the appropriate context.  (If we were using closures instead
  // > of a prototypal thing, we wouldn't have to do this.)

  // Make a promise, and cache it as `this._promise` so that it can be
  // reused (e.g. in case there are multiple calls to `.then()` and `.catch()`)
  this._promise = getPromise();
  return this._promise;

};


/**
 * .log()
 *
 * Log the output from this asynchronous logic, fully-expanded.
 * (Uses `util.inspect(..., {depth: null})`.)
 *
 * * * * WARNING: THIS METHOD IS EXPERIMENTAL! * * *
 *
 * Note: This is for debugging / for exploration purposes, especially
 * for use on the Node.js/Sails.js REPL or in the browser console.
 * If there is an error, it will simply be logged to stderr.
 */
Deferred.prototype.log = function (){


  if (process.env.NODE_ENV === 'production') {
    console.warn('* * * * * * * * * * * * * * * * * * * * * * * * * *');
    console.warn('Warning: Production environment detected...');
    console.warn('Please reconsider using using .log() in production.');
    console.warn('(Visit https://sailsjs.com/support for help.)');
    console.warn('* * * * * * * * * * * * * * * * * * * * * * * * * *');
  }
  else {
    console.log('Running with `.log()`...');
  }

  this.exec(function(err, result) {
    if (err) {
      console.error();
      console.error('- - - - - - - - - - - - - - - - - - - - - - - -');
      console.error('An error occurred:');
      console.error();
      console.error(err);
      // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
      // FUTURE: Consider using the more detailed explanation in some cases:
      // > i.e. depending on Node.js version/browser info/runtime -- i.e. if the stack won't
      // > already be included in the console output
      // ```
      //    console.error();
      //    console.error('--');
      //    console.error('And just in case you also need the `.stack`:');
      //    console.error();
      //    console.error(err.stack);
      // ```
      console.error('- - - - - - - - - - - - - - - - - - - - - - - -');
      console.error();
      return;
    }//-•

    console.log();
    if (_.isUndefined(result)) {
      console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('Finished successfully.');
      console.log();
      console.log('(There was no result.)');
      console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
    }
    else {
      console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
      console.log('Finished successfully.');
      console.log();
      console.log('Result:');
      console.log();
      console.log(util.inspect(result, {depth:null}));
      console.log('- - - - - - - - - - - - - - - - - - - - - - - -');
    }
    console.log();

  });

};


// Finally, export the Deferred constructor.
// (we could have done this earlier-- we just do it down here for consistency)
module.exports = Deferred;
