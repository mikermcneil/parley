/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var parley = require('../');



/**
 * behavior.test.js
 *
 * Tests verifying parley's behavior with both callback and promise usage.
 */

describe('behavior.test.js', function() {


  describe('.exec()', function() {
    describe('with proper usage', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 12); }); });
      it('should work', function(done){
        deferred.exec(function(err) {
          if (err) { return done(err); }
          return done();
        });
      });
    });
    describe('when called more than once', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 12); }); });
      it('should ignore subsequent calls', function(done){
        this.slow(300);

        // As a hack, override console.warn().
        // (this is mainly to improve the experience of looking at test results,
        // but it also has the benefit of adding another check.)
        var origConsoleWarn = global.console.warn;
        var counter = 0;
        global.console.warn = function(){
          counter++;
        };

        deferred.exec(function (){
          setTimeout(function (){
            global.console.warn = origConsoleWarn;
            try {
              assert.equal(counter, 3);
            } catch(e) { return done(e); }
            return done();
          }, 125);
        });

        // The following .exec() calls will be ignored.
        // (Note that 3 extra warnings will be logged, though.)
        deferred.exec(function (){
          return done(new Error('Should never make it here'));
        });
        deferred.exec(function (){
          return done(new Error('Should never make it here'));
        });
        deferred.exec(function (){
          return done(new Error('Should never make it here'));
        });
      });
    });
    describe('with invalid callback', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 12); }); });
      it('should throw', function(){
        try { deferred.exec(123); }
        catch (e) { return; }
        throw new Error('Should have thrown an Error');
      });
    });
    describe('with no arguments', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 12); }); });
      it('should throw', function(){
        try { deferred.exec(); }
        catch (e) { return; }
        throw new Error('Should have thrown an Error');
      });
    });
  });//</.exec()>



  describe('.then()', function() {
    describe('with proper usage', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 12); }); });
      it('should work', function(done){
        deferred.then(function(result) {
          return done();
        }).catch(function(err){ return done(err); });
      });
    });
    describe('when called more than once', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 12); }); });
      it('should ignore subsequent calls', function(done){
        this.slow(300);
        // As a hack, override console.warn().
        // (this is mainly to improve the experience of looking at test results,
        // but it also has the benefit of adding another check.)
        var origConsoleWarn = global.console.warn;
        var counter = 0;
        global.console.warn = function(){
          counter++;
        };

        deferred.then(function (){
          setTimeout(function (){
            global.console.warn = origConsoleWarn;
            try {
              assert.equal(counter, 3);
            } catch(e) { return done(e); }
            return done();
          }, 125);
        }).catch(function(err){ return done(err); });

        // The following .then() calls will be ignored.
        // (Note that 3 extra warnings will be logged, though.)
        deferred.then(function (){
          return done(new Error('Should never make it here'));
        }).catch(function(err){ return done(err); });
        deferred.then(function (){
          return done(new Error('Should never make it here'));
        }).catch(function(err){ return done(err); });
        deferred.then(function (){
          return done(new Error('Should never make it here'));
        }).catch(function(err){ return done(err); });
      });
    });
  });//</.then()>

});


// // A few additional, ad hoc tests:
// // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// // Success condition:
// // ====================
// // .toPromise()
// π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(undefined, 'hello!'); }, 1000); } }); promise = π.toPromise();  promise.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// // .then() shortcut
// π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(undefined, 'hello!'); }, 1000); } }); π.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// // .exec()
// π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(undefined, 'hello!'); }, 1000); } }); π.exec(function(err, result){ if (err){ console.error('ERROR',err, result); return; } console.log('done!', err, result); });

// // Error condition:
// // ====================
// // .toPromise()
// π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); promise = π.toPromise();  promise.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// // .then() shortcut
// π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); π.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// // .catch() shortcut
// π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); π.catch(function(err){ console.error('ERROR',err); });
// // .exec()
// π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); π.exec(function(err, result){ if (err){ console.error('ERROR',err, result); return; } console.log('done!', err, result); });
// // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
