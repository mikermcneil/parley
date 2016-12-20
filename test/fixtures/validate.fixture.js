/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('../../');



/**
 * validate.fixture.js
 *
 * A simplified mock of a hypothetical `validate()` model method
 * that is actually synchronous.  (This is primariliy for use in benchmarks.)
 *
 * @param {Function} explicitCb
 *
 * @returns {Deferred} If no callback specified
 */
module.exports = function find( /* variadic */ ){

  var metadata = {};

  var explicitCb;

  // Handle variadic usage:
  // ===========================================================================
  if (!_.isUndefined(arguments[0])) {
    explicitCb = arguments[0];
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
  (function _determineFinalCb(proceed){
    if (!_.isUndefined(explicitCb)) {
      proceed(undefined, explicitCb);
    }
    else {
      deferred = parley(function (deferredCb){
        proceed(undefined, deferredCb);
      });
    }
  // ~∞%°
  })(function (unused, finalCb) {
    if (unused) {
      finalCb(new Error('Consistency violation: Unexpected internal error occurred before beginning with any business logic.  Details: '+unused.stack));
      return;
    }//-•

    // Now actually do stuff.

    // ...except actually don't-- this is just pretend.

    // All done.
    return finalCb();

  });//</ self-invoking function>


  // If we ended up building a Deferred above, we would have done so synchronously.
  // In other words, if there's going to be a Deferred, we have it here.
  //
  // So if we DON'T have a Deferred, then we know that we must have already went ahead
  // and performed our business logic.  So we'll just return undefined.
  if (!deferred) {
    return;
  }//-•


  // IWMIH, then we know we have a Deferred.
  // (and thus we haven't actually done anything yet.)

  // At this point, we might opt to attach some methods to our Deferred.
  deferred.meta = function (_meta){
    metadata.meta = _meta;
    return deferred;
  };

  // When we're confident that our Deferred is ready for primetime,
  // we finish up by returning it.
  return deferred;

};
