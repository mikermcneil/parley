// This is used by validate.fixture.js.
// It was originally and part of a benchmarking experiment, and its extrapolation
// was found to have a positive impact on performance.
module.exports = function cbToReceiveAnotherCallbackAndUnusedError(unused, finalCb) {
  if (unused) {
    finalCb(new Error('Consistency violation: Unexpected internal error occurred before beginning with any business logic.  Details: '+unused.stack));
    return;
  }//-•

  // Now actually do stuff.

  // ...except actually don't-- this is just pretend.

  // All done.
  return finalCb();

};
