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
    '------------------------------------'+
    '');
  });

  //  ╔═╗╦═╗ ╦╔╦╗╦ ╦╦═╗╔═╗╔═╗
  //  ╠╣ ║╔╩╦╝ ║ ║ ║╠╦╝║╣ ╚═╗
  //  ╚  ╩╩ ╚═ ╩ ╚═╝╩╚═╚═╝╚═╝
  var find = require('./fixtures/find.fixture');
  var validate = require('./fixtures/validate.fixture');


  //  ╔═╗╔╗╔╔═╗╔═╗╔═╗╦ ╦╔═╗╔╦╗
  //  ╚═╗║║║╠═╣╠═╝╚═╗╠═╣║ ║ ║
  //  ╚═╝╝╚╝╩ ╩╩  ╚═╝╩ ╩╚═╝ ╩
  // Just a one-off snapshot run on a laptop.
  // For historical reports, see the history of this file on GitHub.
  //
  //
  // Dec 20, 2016 (take 4):  (after removing pretty-print)
  // ================================================================================================================
  //   baseline.benchmark.js
  //   •  •      •       •      •    •
  //            •      •              o
  //   •    b e n c h m a r k s      •
  //    •    (instantiation)       °
  // ------------------------------------
  //     parley(handler)
  //  • just_build#0 x 527,939 ops/sec ±1.45% (85 runs sampled)
  //       ✓ should be performant enough (using benchSync())
  //     parley(handler).exec(cb)
  //  • build_AND_exec#0 x 420,899 ops/sec ±1.61% (85 runs sampled)
  //       ✓ should be performant enough (using benchSync())
  //     practical benchmark
  //  • mock "find()"#0 x 34.33 ops/sec ±0.90% (73 runs sampled)
  //       ✓ should be performant enough when calling fake "find" w/ .exec() (using bench())
  //  • mock "find()"#0 x 34.20 ops/sec ±0.95% (74 runs sampled)
  //       ✓ should be performant enough when calling NAKED fake "find" (using bench())
  //  • mock "validate()"#0 x 173,206 ops/sec ±3.02% (78 runs sampled)
  //       ✓ should be performant enough when calling fake "validate" w/ .exec() (using benchSync())
  //  • mock "validate()"#0 x 5,805,213 ops/sec ±4.04% (87 runs sampled)
  //       ✓ should be performant enough when calling NAKED "validate" (using benchSync())
  // ------------------------------------
  //   •  •      •       •      •    •
  //            •      •              o
  //   • < / b e n c h m a r k s >    •
  //    •                           °
  //                       o°
  // ================================================================================================================


  //  ╔═╗╔╗ ╔═╗╔═╗╦═╗╦  ╦╔═╗╔╦╗╦╔═╗╔╗╔╔═╗
  //  ║ ║╠╩╗╚═╗║╣ ╠╦╝╚╗╔╝╠═╣ ║ ║║ ║║║║╚═╗
  //  ╚═╝╚═╝╚═╝╚═╝╩╚═ ╚╝ ╩ ╩ ╩ ╩╚═╝╝╚╝╚═╝
  //
  // • Removing pretty-print caused a huge performance increase
  //   (33x instead of 317x slower than naked usage)
  //
  // • The additional time added by calling .exec() (vs. just building) is actually a NEGATIVE number
  //   in some cases.  i.e. calling .exec() does not add any noticeable latency.
  //



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
