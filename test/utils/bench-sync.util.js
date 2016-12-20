/**
 * Module dependencies
 */

var _ = require('@sailshq/lodash');
var Benchmark = require('benchmark');



/**
 * benchSync()
 * ---------------------------
 * @param  {String}   name
 * @param  {Array}   testFns  [array of functions]
 */

module.exports = function benchSync (name, testFns) {

  var suite = new Benchmark.Suite({ name: name });

  _.each(testFns, function (testFn, i) {
    suite = suite.add(testFn.name+'#'+i, testFn);
  });//</each testFn>

  suite.on('cycle', function(event) {
    console.log(' •',String(event.target));
  })
  .on('complete', function() {
    // console.log('Fastest is ' + this.filter('fastest').map('name'));
    // console.log('Slowest is ' + this.filter('slowest').map('name'));
  })
  .run();

};




// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// For posterity, here's how to do it asynchronously:
// (see also https://benchmarkjs.com/docs#Benchmark)
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// module.exports = function bench (name, testFns, done) {
//   var suite = new Benchmark.Suite({ name: name });
//   _.each(testFns, function (testFn, i) {
//     suite = suite.add(testFn.name+'#'+i, {
//       defer: true,
//       fn: function (deferred) {
//         testFn(function _afterRunningTestFn(err){
//           setImmediate(function _afterEnsuringAsynchronous(){
//             if (err) {
//               console.error('An error occured when attempting to benchmark this code:\n',err);
//             }//>- (resolve the deferred either way)
//             deferred.resolve();
//           });//</afterwards cb from waiting for nextTick>
//         });//</afterwards cb from running test fn>
//       }
//     });//<suite.add>
//   });//</each testFn>

//   suite.on('cycle', function(event) {
//     console.log(' •',String(event.target));
//   })
//   .on('complete', function() {
//     console.log('Fastest is ' + this.filter('fastest').map('name'));
//     console.log('Slowest is ' + this.filter('slowest').map('name'));
//     return done(undefined, this);
//   })
//   .run();
// };
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
