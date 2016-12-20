/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('../../');



/**
 * find.fixture.js
 *
 * A simplified mock of Waterline's `find()` model method.
 *
 * @param {Dictionary?} criteria
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
    if (_.isFunction(arguments[0])) {
      explicitCb = arguments[0];
    }
    else {
      metadata.criteria = arguments[0];
    }
  }//>-

  if (!_.isUndefined(arguments[1])) {
    explicitCb = arguments[1];
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


    // In this case, we'll just pretend, since this part doesn't matter.
    // (we just wait a few miliseconds, and then send back an array consisting
    // of one item: the `criteria` that was received.)
    setTimeout(function (){
      var fakeResult = [ metadata.criteria ];

      // Note that, as a way for our test cases to instrument the outcome,
      // we check `metadata.criteria` here, and if it happens to be `false`
      // or `null`, then we trigger an error instead.
      if (metadata.criteria === false) {
        return finalCb(flaverr('E_SOME_ERROR', new Error('Simulated failure (E_SOME_ERROR)')));
      }
      if (_.isNull(metadata.criteria)) {
        return finalCb(new Error('Simulated failure (catchall / misc. error)'));
      }

      return finalCb(undefined, fakeResult);

    }, 25);

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
  deferred.where = function (clause){
    metadata.criteria = metadata.criteria || {};
    metadata.criteria.where = clause;
    return deferred;
  };

  // When we're confident that our Deferred is ready for primetime,
  // we finish up by returning it.
  return deferred;

};
