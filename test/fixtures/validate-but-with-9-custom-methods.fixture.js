/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('../../');


/**
 * validate-but-with-9-custom-methods.fixture.js
 *
 * A simplified mock of a hypothetical `validate()` model method,
 * just like the other fixture (see `validate.fixture.js`) but with 9
 * distinct custom methods available on the Deferred instance.
 * (This is primarily for use in benchmarks.)
 *
 * @param {Function} explicitCbMaybe
 *
 * @returns {Deferred} If no callback specified
 */
module.exports = function validateButWith9CustomMethods( /* variadic */ ){

  var metadata = {};

  var explicitCbMaybe;

  // Handle variadic usage:
  // ===========================================================================
  if (!_.isUndefined(arguments[0])) {
    explicitCbMaybe = arguments[0];
  }//>-
  // ===========================================================================

  // This deferred may or may not actually need to get built.
  // (but in case it does, we define it out here so we can unambiguously
  // return it below)
  var deferred;


  // If an explicit callback was specified, then go ahead
  // and proceed to where the real action is at.
  // Otherwise, no callback was specified explicitly,
  // so we'll build and return a Deferred instead.
  deferred = parley(function (finalCb){

    // Now actually do stuff.
    // ...except actually don't-- this is just pretend.

    // All done.
    return finalCb();

  }, explicitCbMaybe, {
    a: function (beep, boop) { console.log(Math.random()+'hi0'); return deferred; },
    b: function (baa, baaa, black, sheep) { console.log(Math.random()+'hi1'); return deferred; },
    c: function (beep, boop) { console.log(Math.random()+'hi2'); return deferred; },
    d: function (baa, baaa, black, sheep) { console.log(Math.random()+'hi3'); return deferred; },
    e: function (beep, boop) { console.log(Math.random()+'hi5'); return deferred; },
    f: function (baa, baaa, black, sheep) { console.log(Math.random()+'hi5'); return deferred; },
    g: function (beep, boop) { console.log(Math.random()+'hi6'); return deferred; },
    h: function (baa, baaa, black, sheep) { console.log(Math.random()+'hi7'); return deferred; },
    i: function (beep, boop) { console.log(Math.random()+'hi8'); return deferred; },
  });


  // If we ended up building a Deferred above, we would have done so synchronously.
  // In other words, if there's going to be a Deferred, we have it here.
  //
  // So if we DON'T have a Deferred, then we know that we must have already went ahead
  // and performed our business logic.  So we'll just return undefined.
  if (!deferred) {
    return;
  }//-•

  // When we're confident that our Deferred is ready for primetime,
  // we finish up by returning it.
  return deferred;

};

