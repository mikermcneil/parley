/**
 * Module dependencies
 */

var parley = require('../');
var benchSync = require('./utils/bench-sync.util');
// var bench = require('./utils/bench.util');



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

  // before(function(){
  //   console.log(
  //   '  •  •      •       •      •    •    \n'+
  //   '           •      •              o  \n'+
  //   '  •    b e n c h m a r k s      •    \n'+
  //   '   •    (instantiation)       °     \n'+
  //   '');
  // });

  //  ╔═╗╦═╗ ╦╔╦╗╦ ╦╦═╗╔═╗╔═╗
  //  ╠╣ ║╔╩╦╝ ║ ║ ║╠╦╝║╣ ╚═╗
  //  ╚  ╩╩ ╚═ ╩ ╚═╝╩╚═╚═╝╚═╝
  // N/A


  //  ╦ ╦╦╔═╗╔╦╗╔═╗╦═╗╦╔═╗╔═╗╦    ╦═╗╔═╗╔═╗╔═╗╦═╗╔╦╗╔═╗
  //  ╠═╣║╚═╗ ║ ║ ║╠╦╝║║  ╠═╣║    ╠╦╝║╣ ╠═╝║ ║╠╦╝ ║ ╚═╗
  //  ╩ ╩╩╚═╝ ╩ ╚═╝╩╚═╩╚═╝╩ ╩╩═╝  ╩╚═╚═╝╩  ╚═╝╩╚═ ╩ ╚═╝
  // Just some one-off samples.
  //
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
  // Dec 20, 2016:
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

    // Not particularly relevant:
    // (the extra setImmediate just adds weight and makes it harder to judge results)
    // =================================================================================
    // it('should be performant enough (using bench())', function (done){
    //   bench('parley(handler).exec(cb)', [

    //     // •~ between 18,000 and 19,500 ops/sec  (Dec 20, 2016)
    //     //    --the extra delay vs. the one directly above is probably
    //     //    due to the setImmediate we're using in the test suite--
    //     function (next){
    //       var deferred = parley(function(handlerCb) { return handlerCb(); });
    //       deferred.exec(function (err) {
    //         if (err) { return next(err); }
    //         return next();
    //       });
    //     }

    //   ], done);//</bench()>
    // });
    // it('should be performant enough (using bench())', function (done){
    //   bench('parley(handler).exec(cb) + artificial setImmediate in handler', [

    //     // •~ between 18,000 and 19,500 ops/sec  (Dec 20, 2016)
    //     //    --this is EXACTLY THE SAME AS THE ONE DIRECTLY ABOVE, basically --
    //     //    it is consistently <~400 ops/second slower, sometimes only like 20ops slower --
    //     function (next){
    //       var deferred = parley(function(handlerCb) { setImmediate(function(){ return handlerCb(); }); });
    //       deferred.exec(function (err) {
    //         if (err) { return next(err); }
    //         return next();
    //       });
    //     }

    //   ], done);//</bench()>
    // });
    // it('should be performant enough (using bench())', function (done){
    //   bench('parley(handler).exec(cb) + artificial setImmediate wrapped around the whole thing', [

    //     // •~ between 18,000 and 19,500 ops/sec  (Dec 20, 2016)
    //     //    -- ALSO THE SAME, WITH THE SAME SLIGHT VARIATIONS --
    //     function (next){
    //       setImmediate(function(){
    //         var deferred = parley(function(handlerCb) { return handlerCb(); });
    //         deferred.exec(function (err) {
    //           if (err) { return next(err); }
    //           return next();
    //         });
    //       });
    //     }

    //   ], done);//</bench()>
    // });
    // =================================================================================

  });//</ describe: parley(handler().exec(cb) )

});//</describe (top-level) >
