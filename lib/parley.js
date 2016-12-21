/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var bluebird = require('bluebird');
var Deferred = require('./private/Deferred');



/**
 * parley()
 *
 * Build a deferred object that supports Node-style callbacks and promises.
 * > See README.md for more details.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param {Function|Dictionary} handleExecOrOpts
 *        Either the `handleExec` function, or a dictionary of options.
 *
 * @param {Function?} explicitCbMaybe
 *        An optional parameter that, if specified, is passed directly as the incoming
 *        `done` argument to your "handleExec" handler function (i.e. _its_ callback).
 *        Otherwise, if it is omitted, then handleExec receives an internally-generated
 *        callback (from parley) as its `done` argument.  When called, this implicit `done`
 *        will appropriately dispatch with the deferred object.  Finally, note that if an
 *        explicit callback is provided, parley will return undefined instead of returning
 *        a Deferred.
 *        > The nice thing about this is that it allows implementor code that provide this
 *        > feature to avoid manually duplicating the branching logic (i.e. the code that
 *        > checks to see if an explicit cb was provided, and if not, returns a new Deferred)
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns {Deferred}
 * @throws {Error} If there are usage problems with how parley() itself is called
 */

module.exports = function parley(handleExecOrOpts, explicitCbMaybe){
  // console.time('parley');

  // Set up a local variable to track whether we have begun executing this Deferred yet.
  // (this is used below to implement a spinlock)
  var hasBegunExecuting;

  // Set up another variable to track whether this has _finished_ yet.
  // (this is used below to improve error & warning messages)
  var hasFinishedExecuting;



  //  ██╗   ██╗███████╗ █████╗  ██████╗ ███████╗
  //  ██║   ██║██╔════╝██╔══██╗██╔════╝ ██╔════╝
  //  ██║   ██║███████╗███████║██║  ███╗█████╗
  //  ██║   ██║╚════██║██╔══██║██║   ██║██╔══╝
  //  ╚██████╔╝███████║██║  ██║╚██████╔╝███████╗
  //   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
  //
  // Normalize basic usage.
  assert(!_.isUndefined(handleExecOrOpts), 'Must specify a first argument when calling parley() -- please provide a `handleExec` function or a dictionary of options');

  var handleExec;
  var codeName;

  if (_.isFunction(handleExecOrOpts)) {

    handleExec = handleExecOrOpts;

    // Determine `codeName`.
    // > Attempt to guess the code name (fall back to empty string)
    if (handleExec.name) {
      codeName = handleExec.name;
    }
    else {
      codeName = '';
    }

  }
  else if (_.isObject(handleExecOrOpts) && !_.isArray(handleExecOrOpts)) {

    // In this scenario, we must check that a `handleExec` option was provided.
    assert(!_.isUndefined(handleExecOrOpts.handleExec), 'If specifying first argument as a dictionary of options, then a valid `handleExec` function must be specified as an option.');
    handleExec = handleExecOrOpts.handleExec;

    // Verify `codeName` option
    if (handleExecOrOpts.codeName) {
      assert(_.isUndefined(handleExecOrOpts.codeName) ? true : _.isString(handleExecOrOpts.codeName), 'If specified, `codeName` option must be a string.  But instead, got: '+util.inspect(handleExecOrOpts.codeName, {depth:5})+'');
      assert(codeName !== '', 'Specified codeName (empty string: \'\') is not valid.');
      codeName = handleExecOrOpts.codeName;
    }
    // Otherwise use same approach as above.
    else if (handleExec.name) {
      codeName = handleExec.name;
    }
    else {
      codeName = '';
    }

  }
  else {
    throw new Error('Invalid argument passed to parley() -- expected `handleExec` function or dictionary of options.  But instead, got: '+util.inspect(handleExecOrOpts, {depth:5})+'');
  }

  // Verify `handleExec` function.
  assert(_.isFunction(handleExec), 'Invalid `handleExec` function: '+util.inspect(handleExec, {depth:5})+'');

  // Verify `explicitCbMaybe` (if present)
  if (!_.isUndefined(explicitCbMaybe)) {
    assert(_.isFunction(explicitCbMaybe), 'If specified, 2nd argument ("explicitCbMaybe") must be a function.  But instead, got: '+util.inspect(explicitCbMaybe, {depth:5})+'');
  }

  // OLD WAY
  //=============================================================================================================================
  // // Normalize basic usage.
  // assert(!_.isUndefined(handleExecOrOpts), 'Must specify a first argument when calling parley() -- please provide a `handleExec` function or a dictionary of options');
  // var opts;
  // if (_.isFunction(handleExecOrOpts)) {
  //   opts = { handleExec: handleExecOrOpts };
  // }
  // else if (_.isObject(handleExecOrOpts) && !_.isArray(handleExecOrOpts)) {
  //   opts = handleExecOrOpts;
  // }
  // else {
  //   throw new Error('Invalid argument passed to parley() -- expected `handleExec` function or dictionary of options.  But instead, got: '+util.inspect(handleExecOrOpts, {depth:5})+'');
  // }

  // // Verify `handleExec` function.
  // assert(_.isFunction(opts.handleExec), 'Invalid `handleExec` function: '+util.inspect(opts.handleExec, {depth:5})+'');

  // // Verify `codeName`
  // assert(_.isUndefined(opts.codeName) ? true : _.isString(opts.codeName), 'If specified, `opts.codeName` must be a string.  But instead, got: '+util.inspect(opts.codeName, {depth:5})+'');
  // assert(opts.codeName !== '', 'Specified codeName (empty string: \'\') is not valid.');

  // // Verify `explicitCbMaybe` (if present)
  // if (!_.isUndefined(explicitCbMaybe)) {
  //   assert(_.isFunction(explicitCbMaybe), 'If specified, 2nd argument ("explicitCbMaybe") must be a function.  But instead, got: '+util.inspect(explicitCbMaybe, {depth:5})+'');
  // }

  // // Normalize `codeName`
  // // > Attempt to guess the code name (fall back to empty string)
  // if (!opts.codeName) {
  //   if (opts.handleExec.name) {
  //     opts.codeName = opts.handleExec.name;
  //   }
  //   else {
  //     opts.codeName = '';
  //   }
  // }//>-
  //=============================================================================================================================


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
  if (explicitCbMaybe) {

    // Run the logic, then use the explicit callback.
    //
    // > Most of the additional checks from below (e.g. try/catch) are NOT performed
    // > in the situation where an explicit callback was provided.  This is primarily
    // > to allow for squeezing better performance out of particular method calls.
    // > (And at the same time, it avoids duplicating the code below in this file.)
    hasBegunExecuting = true;

    // FUTURE: maybe add try/catch
    handleExec(function (err, result) {

      // FUTURE: maybe add spinlock check + console warning
      hasFinishedExecuting = true;

      if (err) {
        // FUTURE: maybe add insurance that this is an Error instance
        explicitCbMaybe(err);
      }
      else {
        explicitCbMaybe(undefined, result);
      }

    });//</ handleExec() >

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

  }//‡
  // Otherwise, no explicit callback was provided- so we'll build & return a Deferred...
  else {

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
    // ==================================================================
    // Note: to temporarily switch to the prototype/constructor strategy,
    // comment out the inline dictionary definition below in favor of
    // this line:   (i.e. just uncomment it)
    // ```
    // var π = new Deferred(codeName, handleExec);
    // ```
    // For more info & benchmarks, see:
    // https://github.com/mikermcneil/parley/commit/5996651c4b15c7850b5eb2e4dc038e8202414553#commitcomment-20256030
    // ==================================================================

    // Build deferred object.
    var π = {

      /**
       * .exec()
       *
       * @param  {Function} cb
       */
      exec: function (cb){

        if (_.isUndefined(cb)) {
          throw new Error(
            'No callback supplied. Please provide a callback function when calling .exec().  '+
            'See http://npmjs.com/package/parley for help.'
          );
        }//-•

        if (!_.isFunction(cb)) {
          throw new Error(
            'Sorry, `.exec()` doesn\'t know how to handle a callback like that:\n'+
            util.inspect(cb, {depth: 1})+'\n'+
            'Instead, please provide a callback function when calling .exec().  '+
            'See http://npmjs.com/package/parley for help.'
          );
        }//-•

        // Spinlock
        if (hasBegunExecuting) {
          console.warn(
            '\n'+
            'That\'s odd... It looks like '+(codeName ? codeName+'()' : 'this Deferred')+' '+
            'has already '+(hasFinishedExecuting?'finished':'begun')+' executing.\n'+
            'But attempting to execute a Deferred more than once tends to cause\n'+
            'unexpected race conditions and other bugs!  So to be safe, rather than\n'+
            'executing it twice, the second attempt was ignored automatically, and\n'+
            'this warning was logged instead.  See http://npmjs.com/package/parley for help.\n'+
            'Stack trace:\n'+
            '```\n'+
            ((new Error()).stack).replace(/^.+\n/, '')+
            '```\n'
          );
          return;
        }//-•
        hasBegunExecuting = true;

        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -
        // FUTURE: implement configurable timeout here
        // - - - - - - - - - - - - - - - - - - - - - - - - - - - -

        try {
          handleExec(function (err, result) {
            if (err) {
              if (_.isError(err)) { /* ok */ }
              else if (_.isString(err)) { err = new Error(err); }
              else { err = new Error(util.inspect(err, {depth: 5})); }

              hasFinishedExecuting = true;
              return cb(err);
            }//-•

            hasFinishedExecuting = true;
            return cb(undefined, result);

          });
        } catch (e) {

          var err;
          if (_.isError(e)) { err = e; }
          else if (_.isString(e)) { err = new Error(e); }
          else { err = new Error(util.inspect(e, {depth: 5})); }

          hasFinishedExecuting = true;

          return cb(new Error(
            'Unexpected error was thrown while executing '+
            (codeName ? codeName+'()' : 'this Deferred')+':\n'+
            '```\n'+
            err.stack+'\n'+
            '```'
          ));

        }//</catch>
      },

      /**
       * .then()
       *
       * For usage, see:
       * http://bluebirdjs.com/docs/api/then.html
       */
      then: function (){
        var promise = π.toPromise();
        return promise.then.apply(promise, Array.prototype.slice.call(arguments));
      },

      /**
       * .catch()
       *
       * For usage, see:
       * http://bluebirdjs.com/docs/api/catch.html
       */
      catch: function (){
        var promise = π.toPromise();
        return promise.catch.apply(promise, Array.prototype.slice.call(arguments));
      },

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
      toPromise: function (){
        var promise = bluebird.promisify(π.exec)();
        return promise;
      },

    };


    // console.timeEnd('parley');

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

  }//</else>

};
