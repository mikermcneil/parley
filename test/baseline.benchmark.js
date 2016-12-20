/**
 * Module dependencies
 */

var parley = require('../');
var benchSync = require('./utils/bench-sync.util');
var bench = require('./utils/bench.util');



/**
 * baseline.benchmark.js
 *
 * A performance benchmark for Deferred instantiation and execution.
 */

describe('baseline.benchmark.js', function() {

  // Set "timeout" and "slow" thresholds incredibly high
  // to avoid running into issues.
  this.slow(240000);
  this.timeout(240000);

  before(function(){
    console.log(
    '  •  •      •       •      •    •    \n'+
    '           •      •              o  \n'+
    '  •    b e n c h m a r k s      •    \n'+
    '   •    (instantiation)       °     \n'+
    '------------------------------------\n'+
    '');
  });

  //  ╔═╗╦═╗ ╦╔╦╗╦ ╦╦═╗╔═╗╔═╗
  //  ╠╣ ║╔╩╦╝ ║ ║ ║╠╦╝║╣ ╚═╗
  //  ╚  ╩╩ ╚═ ╩ ╚═╝╩╚═╚═╝╚═╝
  var find = require('./fixtures/find.fixture');
  var validate = require('./fixtures/validate.fixture');


  //  ╦ ╦╦╔═╗╔╦╗╔═╗╦═╗╦╔═╗╔═╗╦    ╦═╗╔═╗╔═╗╔═╗╦═╗╔╦╗╔═╗
  //  ╠═╣║╚═╗ ║ ║ ║╠╦╝║║  ╠═╣║    ╠╦╝║╣ ╠═╝║ ║╠╦╝ ║ ╚═╗
  //  ╩ ╩╩╚═╝ ╩ ╚═╝╩╚═╩╚═╝╩ ╩╩═╝  ╩╚═╚═╝╩  ╚═╝╩╚═ ╩ ╚═╝
  // Just some one-off samples.
  //
  //
  // Dec 20, 2016 (take 3):  (all of them put together)
  // ================================================================================================================
  //  baseline.benchmark.js
  //    parley(handler)
  // • just_build#0 x 22,711 ops/sec ±2.51% (78 runs sampled)
  //      ✓ should be performant enough (using benchSync())
  //    parley(handler).exec(cb)
  // • build_AND_exec#0 x 22,396 ops/sec ±2.02% (80 runs sampled)
  //      ✓ should be performant enough (using benchSync())
  //    practical benchmark
  // • mock "find()"#0 x 33.60 ops/sec ±0.93% (72 runs sampled)
  //      ✓ should be performant enough when calling fake "find" w/ .exec() (using bench())
  // • mock "find()"#0 x 34.07 ops/sec ±0.93% (72 runs sampled)
  //      ✓ should be performant enough when calling NAKED fake "find" (using bench())
  // • mock "validate()"#0 x 19,394 ops/sec ±3.55% (70 runs sampled)
  //      ✓ should be performant enough when calling fake "validate" w/ .exec() (using benchSync())
  // • mock "validate()"#0 x 5,182,890 ops/sec ±12.10% (87 runs sampled)
  //      ✓ should be performant enough when calling NAKED "validate" (using benchSync())
  // ================================================================================================================
  //
  // Dec 20, 2016 (take 2):  (notice how the additional time added by calling .exec() is actually a negative number)
  // ================================================================================================================
  //  baseline.benchmark.js
  //    parley(handler)
  // • just_build#0 x 22,540 ops/sec ±3.15% (80 runs sampled)
  //      ✓ should be performant enough (using benchSync())
  //    parley(handler).exec(cb)
  // • build_AND_exec#0 x 22,743 ops/sec ±1.77% (83 runs sampled)
  // ================================================================================================================
  //
  // Dec 20, 2016 (take 1):
  // ================================================================================================================
  //  baseline.benchmark.js
  //    parley(handler)
  // • parley(handler)#0 x 23,432 ops/sec ±2.95% (79 runs sampled)
  //      ✓ should be performant enough (using benchSync())
  //    parley(handler).exec(cb)
  // • parley(handler).exec(cb)#0 x 22,959 ops/sec ±3.83% (78 runs sampled)
  //      ✓ should be performant enough (using benchSync())
  // • parley(handler).exec(cb)#0 x 19,548 ops/sec ±2.04% (72 runs sampled)
  //      ✓ should be performant enough (using bench())
  // • parley(handler).exec(cb) + artificial setImmediate in handler#0 x 19,135 ops/sec ±1.73% (73 runs sampled)
  //      ✓ should be performant enough (using bench())
  // • parley(handler).exec(cb) + artificial setImmediate wrapped around the whole thing#0 x 18,686 ops/sec ±6.00% (71 runs sampled)
  //      ✓ should be performant enough (using bench())
  // ================================================================================================================



  //  ╔═╗╦ ╦╦╔╦╗╔═╗
  //  ╚═╗║ ║║ ║ ║╣
  //  ╚═╝╚═╝╩ ╩ ╚═╝
  describe('parley(handler)', function(){
    it('should be performant enough (using benchSync())', function (){
      benchSync('parley(handler)', [

        // •~ between 21,000 and 23,500 ops/sec  (Dec 20, 2016)
        function just_build(){
          var deferred = parley(function(handlerCb) { return handlerCb(); });
        }

      ]);//</benchSync()>
    });
  });

  describe('parley(handler).exec(cb)', function(){
    it('should be performant enough (using benchSync())', function (){
      benchSync('parley(handler).exec(cb)', [

        // •~ between 21,000 and 23,000 ops/sec  (Dec 20, 2016)
        //    --SAME AS ABOVE, basically -- like 200-500 ops/second slower, tops --
        //    (and keep in mind that's below the % error margin)
        function build_AND_exec(){
          var deferred = parley(function(handlerCb) { return handlerCb(); });
          deferred.exec(function (err) {
            if (err) {
              console.error('Unexpected error running benchmark:',err);
            }//>-
            // Note: Since the handler is blocking, we actually make
            // it in here within one tick of the event loop.
          });
        }

      ]);//</benchSync()>
    });

    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
    // For additional permutations using bench() +/- extra setImmediate() calls,
    // see the commit history of this file.  As it turn out, the setImmediate()
    // calls just add weight and make it harder to judge the accuracy of results.
    // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  });//</ describe: parley(handler().exec(cb) )



  describe('practical benchmark', function(){
    it('should be performant enough when calling fake "find" w/ .exec() (using bench())', function (done){
      bench('mock "find()"', [

        function (next){
          find({ where: {id:3, x:30} })
          .exec(function (err, result) {
            if (err) { return next(err); }
            return next();
          });
        }

      ], done);
    });

    it('should be performant enough when calling NAKED fake "find" (using bench())', function (done){
      bench('mock "find()"', [

        function (next){
          find({ where: {id:3, x:30} }, function (err, result) {
            if (err) { return next(err); }
            return next();
          });
        }

      ], done);
    });

    it('should be performant enough when calling fake "validate" w/ .exec() (using benchSync())', function (){
      benchSync('mock "validate()"', [

        function (){
          validate()
          .exec(function (err) {
            if (err) {
              console.error('Unexpected error running benchmark:',err);
            }//>-
            // Note: Since the handler is blocking, we actually make
            // it in here within one tick of the event loop.
          });
        }

      ]);
    });

    it('should be performant enough when calling NAKED "validate" (using benchSync())', function (){
      benchSync('mock "validate()"', [

        function (){
          validate(function (err) {
            if (err) {
              console.error('Unexpected error running benchmark:',err);
            }//>-
            // Note: Since the handler is blocking, we actually make
            // it in here within one tick of the event loop.
          });
        }

      ]);
    });
  });


  after(function(){
    console.log(
    '------------------------------------\n'+
    '  •  •      •       •      •    •    \n'+
    '           •      •              o  \n'+
    '  • < / b e n c h m a r k s >    •    \n'+
    '   •                           °     \n'+
    '                      o°            \n'+
    '');
  });

});//</describe (top-level) >
