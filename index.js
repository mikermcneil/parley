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
 *
 * @param {Function|Dictionary} handleExecOrOpts
 *        Either the `handleExec` function, or a dictionary of options.
 *        (See README.md for more details.)
 */

module.exports = function parley(handleExecOrOpts){

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
  // Build deferred object
  var π = {

    exec: function (){
      // TODO
    },

    then: function (){
      // TODO
    },

    catch: function (){
      // TODO
    },

    toPromise: function (){
      // TODO
    },

  };


  //  ██████╗ ██████╗ ███████╗████████╗████████╗██╗   ██╗    ██████╗ ██████╗ ██╗███╗   ██╗████████╗
  //  ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝╚══██╔══╝╚██╗ ██╔╝    ██╔══██╗██╔══██╗██║████╗  ██║╚══██╔══╝
  //  ██████╔╝██████╔╝█████╗     ██║      ██║    ╚████╔╝     ██████╔╝██████╔╝██║██╔██╗ ██║   ██║
  //  ██╔═══╝ ██╔══██╗██╔══╝     ██║      ██║     ╚██╔╝      ██╔═══╝ ██╔══██╗██║██║╚██╗██║   ██║
  //  ██║     ██║  ██║███████╗   ██║      ██║      ██║       ██║     ██║  ██║██║██║ ╚████║   ██║
  //  ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝      ╚═╝      ╚═╝       ╚═╝     ╚═╝  ╚═╝╚═╝╚═╝  ╚═══╝   ╚═╝
  //
  // Now, attach an `inspect` method to make for better console output.
  // (note that we define it as a non-enumerable property)
  var prettyPrintStr;
  if (_.isUndefined(opts.codeName)) {
    prettyPrintStr = '[Deferred]';
  }
  else {
    prettyPrintStr = '[Deferred: '+opts.codeName+']';
  }
  Object.defineProperty(π, 'inspect', { value: function(){ return prettyPrintStr; } });
  Object.defineProperty(π, 'toString', { value: function(){ return prettyPrintStr; } });



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
