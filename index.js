/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var bluebird = require('bluebird');



/**
 * parley()
 *
 * Build a deferred object that supports Node-style callbacks and promises.
 * > See README.md for more details.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @param {Function|Dictionary} handleExecOrOpts
 *        Either the `handleExec` function, or a dictionary of options.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * @returns {Deferred}
 * @throws {Error} If there are usage problems with how parley() itself is called
 */

module.exports = function parley(handleExecOrOpts){
  // console.time('parley');

  //  ██╗   ██╗███████╗ █████╗  ██████╗ ███████╗
  //  ██║   ██║██╔════╝██╔══██╗██╔════╝ ██╔════╝
  //  ██║   ██║███████╗███████║██║  ███╗█████╗
  //  ██║   ██║╚════██║██╔══██║██║   ██║██╔══╝
  //  ╚██████╔╝███████║██║  ██║╚██████╔╝███████╗
  //   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝
  //
  // Normalize basic usage.
  assert(!_.isUndefined(handleExecOrOpts), 'Must specify a first argument when calling parley() -- please provide a `handleExec` function or a dictionary of options');
  var opts;
  if (_.isFunction(handleExecOrOpts)) {
    opts = { handleExec: handleExecOrOpts };
  }
  else if (_.isObject(handleExecOrOpts) && !_.isArray(handleExecOrOpts)) {
    opts = handleExecOrOpts;
  }
  else {
    throw new Error('Invalid argument passed to parley() -- expected `handleExec` function or dictionary of options.  But instead, got: '+util.inspect(handleExecOrOpts, {depth:5})+'');
  }

  // Verify `handleExec` function.
  assert(_.isFunction(opts.handleExec), 'Invalid `handleExec` function: '+util.inspect(opts.handleExec, {depth:5})+'');

  // Verify `codeName`
  assert(_.isUndefined(opts.codeName) ? true : _.isString(opts.codeName), 'If specified, `opts.codeName` must be a string.  But instead, got: '+util.inspect(opts.codeName, {depth:5})+'');
  assert(opts.codeName !== '', 'Specified codeName (empty string: \'\') is not valid.');


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
          'Error: Sorry, `.exec()` doesn\'t know how to handle a callback like that:\n'+
          util.inspect(cb, {depth: 1})+'\n'+
          'Instead, please provide a callback function when calling .exec().  '+
          'See http://npmjs.com/package/parley for help.'
        );
      }//-•

      try {
        opts.handleExec(function (err, result) {
          if (err) {
            if (_.isError(err)) { /* ok */ }
            else if (_.isString(err)) { err = new Error(err); }
            else { err = new Error(util.inspect(err, {depth: 5})); }

            return cb(err);
          }//-•

          return cb(undefined, result);

        });
      } catch (e) {

        var err;
        if (_.isError(e)) { err = e; }
        else if (_.isString(e)) { err = new Error(e); }
        else { err = new Error(util.inspect(e, {depth: 5})); }

        return cb(new Error(
          'Unexpected error thrown while executing '+
          (opts.codeName ? opts.codeName+'()' : 'this Deferred')+': '+
          err.stack
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



  //  ██████╗ ██████╗ ███████╗████████╗████████╗██╗   ██╗    ██████╗ ██████╗ ██╗███╗   ██╗████████╗
  //  ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝╚██╗ ██╔╝    ██╔══██╗██╔══██╗██║████╗  ██║╚══██╔══╝
  //  ██████╔╝██████╔╝█████╗     ██║      ██║    ╚████╔╝     ██████╔╝██████╔╝██║██╔██╗ ██║   ██║
  //  ██╔═══╝ ██╔══██╗██╔══╝     ██║      ██║     ╚██╔╝      ██╔═══╝ ██╔══██╗██║██║╚██╗██║   ██║
  //  ██║     ██║  ██║███████╗   ██║      ██║      ██║       ██║     ██║  ██║██║██║ ╚████║   ██║
  //  ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝      ╚═╝      ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝
  //
  // Pretty-printing is disabled in production.
  if (process.env.NODE_ENV !== 'production') {

    // Attempt to guess the code name (fall back to empty string)
    var codeNameGuess;
    if (opts.codeName) {
      codeNameGuess = opts.codeName;
    }
    else if (opts.handleExec.name) {
      codeNameGuess = opts.handleExec.name;
    }
    else {
      codeNameGuess = '';
    }


    // Now, attach `inspect` and `toString` to make for better console output.
    // (note that we define it as a non-enumerable property)
    (function (_prettyPrinter){
      Object.defineProperties(π, {
        inspect: { value: _prettyPrinter },
        toString: { value: _prettyPrinter }
      });
    })(function(){ return '[Deferred'+(codeNameGuess?(': '+codeNameGuess):'')+']'; });


    // Now do the same thing for each of the functions.
    _.each(['exec', 'then', 'catch', 'toPromise'], function (methodName){
      (function (_prettyPrinter){
        Object.defineProperties(π[methodName], {
          inspect: { value: _prettyPrinter },
          toString: { value: _prettyPrinter }
        });
      })(function(){ return '[Function: '+(codeNameGuess?(codeNameGuess+'()'):'')+'.'+methodName+']'; });
    });
  }//>-


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

};
