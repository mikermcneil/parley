// ~∞%°
module.exports = function proceed(unused, finalCb) {
  if (unused) {
    finalCb(new Error('Consistency violation: Unexpected internal error occurred before beginning with any business logic.  Details: '+unused.stack));
    return;
  }//-•

  // Now actually do stuff.

  // ...except actually don't-- this is just pretend.

  // All done.
  return finalCb();

};
// This is temporary, and part of a benchmarking experiment.
