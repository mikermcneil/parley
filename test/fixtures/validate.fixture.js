/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('../../');
var helpValidate = require('./private/help-validate.util');


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
  if (!_.isUndefined(explicitCb)) {
    helpValidate(undefined, explicitCb);
  }
  else {
    deferred = parley(function (deferredCb){
      helpValidate(undefined, deferredCb);
    });
  }//>-


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
  // --(1)-------------------------------------------------------
  // --too slow:
  // --(e.g. 212k ops/sec)
  // deferred.meta = function (_meta){
  //   metadata.meta = _meta;
  //   return deferred;
  // };
  // --(2)-------------------------------------------------------
  // --perfectly fast, but doesn't do anything:
  // --(e.g. 373k ops/sec)
  // var theMeta = function (_meta){
  //   metadata.meta = _meta;
  //   return deferred;
  // };
  // --(3)-------------------------------------------------------
  // --somewhat better than the original!!...
  // --(e.g. 273k ops/sec)
  // --....but problematic, because it doesn't actually mutate
  // --the original deferred, which could cause inconsistencies.
  // deferred = _.extend({
  //   meta: function (_meta){
  //     metadata.meta = _meta;
  //     return deferred;
  //   }
  // }, deferred);
  // --(4)-------------------------------------------------------
  // --considerably better than the original!!
  // --(Even more than #3... plus it's totally valid!)
  // --(e.g. ~268k-292k ops/sec)
  _.extend(deferred, {
    meta: function (_meta){
      metadata.meta = _meta;
      return deferred;
    }
  });

  // When we're confident that our Deferred is ready for primetime,
  // we finish up by returning it.
  return deferred;

};
