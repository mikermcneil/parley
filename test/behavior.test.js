



// A few simple, ad hoc tests:
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
// Success condition:
// ====================
// .toPromise()
π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(undefined, 'hello!'); }, 1000); } }); promise = π.toPromise();  promise.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// .then() shortcut
π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(undefined, 'hello!'); }, 1000); } }); π.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// .exec()
π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(undefined, 'hello!'); }, 1000); } }); π.exec(function(err, result){ if (err){ console.error('ERROR',err, result); return; } console.log('done!', err, result); });

// Error condition:
// ====================
// .toPromise()
π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); promise = π.toPromise();  promise.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// .then() shortcut
π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); π.then(function(result){ console.log('done!', result); }).catch(function(err){ console.error('ERROR',err); });
// .catch() shortcut
π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); π.catch(function(err){ console.error('ERROR',err); });
// .exec()
π = require('./')({ codeName: 'asdf', handleExec: function foo(done){ console.log('working...');   setTimeout(function (){ console.log('finishing...'); return done(new Error('uh oh'), 'should never get this!'); }, 1000); } }); π.exec(function(err, result){ if (err){ console.error('ERROR',err, result); return; } console.log('done!', err, result); });
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
