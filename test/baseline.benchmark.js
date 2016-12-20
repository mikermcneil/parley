/**
 * Module dependencies
 */

var parley = require('../');
var benchSync = require('./utils/bench-sync.util');



/**
 * instantiation.benchmark.js
 *
 * A performance benchmark for Deferred instantiation.
 */

describe('instantiation.benchmark.js', function() {

  // Set "timeout" and "slow" thresholds incredibly high
  // to avoid running into issues.
  this.slow(240000);
  this.timeout(240000);


  //  ╔═╗╦═╗ ╦╔╦╗╦ ╦╦═╗╔═╗╔═╗
  //  ╠╣ ║╔╩╦╝ ║ ║ ║╠╦╝║╣ ╚═╗
  //  ╚  ╩╩ ╚═ ╩ ╚═╝╩╚═╚═╝╚═╝
  // N/A


  //  ╔═╗╦ ╦╦╔╦╗╔═╗
  //  ╚═╗║ ║║ ║ ║╣
  //  ╚═╝╚═╝╩ ╩ ╚═╝
  it('should be performant enough', function (){

    // console.log(
    // '  •  •      •       •      •    •    \n'+
    // '           •      •              o  \n'+
    // '  •    b e n c h m a r k s      •    \n'+
    // '   •    (instantiation)       °     \n'+
    // '');
    benchSync('parley(handleExec)', [

      // •~ between 21,000 and 23,000 ops/sec  (Dec 20, 2016)
      function build_deferred(){
        var deferred = parley(function(done) { return done(); });
      }

    ]);//</benchSync()>

  });//</should be performant enough>

});//</describe>
