/**
 * Module dependencies
 */

var util = require('util');
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
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 50); }); });
      it('should work', function(done){
        deferred.exec(function(err) {
          if (err) { return done(err); }
          return done();
        });
      });
    });
    describe('when called more than once', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 50); }); });
      it('should ignore subsequent calls', function(done){
        deferred.exec(function (){
          setTimeout(function (){
            return done();
          }, 500);
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
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 50); }); });
      it('should throw', function(){
        try { deferred.exec(123); }
        catch (e) { return; }
        throw new Error('Should have thrown an Error');
      });
    });
    describe('with no arguments', function() {
      var deferred; before(function(){ deferred = parley(function(done){ setTimeout(function (){ return done(undefined, 'hello!'); }, 50); }); });
      it('should throw', function(){
        try { deferred.exec(); }
        catch (e) { return; }
        throw new Error('Should have thrown an Error');
      });
    });
  });//</.exec()>

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
