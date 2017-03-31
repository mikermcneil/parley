parley
=========

Practical, lightweight flow control for Node.js


## Usage

Parley helps you write functions that can be called like this:

```javascript
doStuff({ foo: 123 })
.foo({ bar: 456 })
.exec(function (err, result){

});
```

Or like this:

```javascript
doStuff({ foo: 123 })
.baz({ bar: 456 })
.then(function (result){

})
.catch(function(err) {

});
```

> You can also obtain a promise simply by calling [`.toPromise()`](#toPromise).


## Benchmarks

As of January 15, 2017:

```
  baseline.benchmark.js
  •  •      •       •      •    •
           •      •              o
  •    b e n c h m a r k s      •
   •    (instantiation)       °
------------------------------------
    parley(handler)
 • just_build#0 x 18,162,364 ops/sec ±0.98% (90 runs sampled)
      ✓ should be performant enough (using benchSync())
    parley(handler).exec(cb)
 • build_AND_exec#0 x 1,804,891 ops/sec ±1.77% (84 runs sampled)
      ✓ should be performant enough (using benchSync())
    parley(handler, undefined, {...})  (w/ 9 custom methods)
 • just_build_with_9_custom_methods#0 x 3,947,502 ops/sec ±1.62% (90 runs sampled)
      ✓ should be performant enough (using benchSync())
    parley(handler, undefined, {...}).exec(cb)   (w/ 9 custom methods)
 • build_AND_exec_with_9_custom_methods#0 x 1,259,925 ops/sec ±2.08% (76 runs sampled)
      ✓ should be performant enough (using benchSync())
    practical benchmark
 • mock "find().exec()"#0 x 33.69 ops/sec ±0.98% (73 runs sampled)
      ✓ should be performant enough when calling fake "find" w/ .exec() (using bench())
 • mock "find(..., explicitCb)"#0 x 33.93 ops/sec ±0.90% (73 runs sampled)
      ✓ should be performant enough when calling NAKED fake "find" (using bench())
 • mock "validate().exec()"#0 x 789,446 ops/sec ±1.85% (92 runs sampled)
      ✓ should be performant enough when calling fake "validate" w/ .exec() (using benchSync())
 • mock "validateButWith9CustomMethods().exec()"#0 x 686,544 ops/sec ±1.21% (90 runs sampled)
      ✓ should be performant enough calling fake "validateButWith9CustomMethods" w/ .exec() (using benchSync())
 • mock "validate(..., explicitCb)"#0 x 10,157,027 ops/sec ±1.77% (87 runs sampled)
      ✓ should be performant enough when calling NAKED "validate" (using benchSync())
------------------------------------
  •  •      •       •      •    •
           •      •              o
  • < / b e n c h m a r k s >    •
   •                           °
                      o°
```


## Help

If you have questions or are having trouble, click [here](http://sailsjs.com/support).


## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/parley.svg)](http://npmjs.com/package/parley)

To report a bug, [click here](http://sailsjs.com/bugs).



## Overview

This section offers a high-level look at how to use parley from both a userland and implementor perspective.  You can also skip ahead to the [API reference below](#api-reference).


### Building a deferred object

Use parley to build a **deferred object**.  This provides access to `.exec()`, `.then()`, `.catch()`, and `.toPromise()`, but you can also attach any extra methods you'd like to add.

```javascript
var parley = require('parley');

var deferred = parley(function (done){
  setTimeout(function (){
    if (Math.random() > 0.5) {
      return done(new Error('whoops, unlucky I guess'));
    }
    if (Math.random() > 0.2) {
      return done(undefined, Math.floor(5*Math.random()));
    }
    return done();
  }, 50);
});
```

> For a more complete version of the above example, [click here](https://gist.github.com/mikermcneil/621b55cfc54f133a1db30d7238ca52b1).


### Results

To send back a result value from your handler, specify it as the second argument when invoking `done`.

```javascript
return done(undefined, 'hello world');
```

Depending on how userland code chooses to work with the deferred object, your result will be passed back to userland as either the second argument to the `.exec()` callback, or as the value resolved from the promise.

```javascript
// Node-style callback
.exec(function(err, result) {
  // => undefined, 'hello world'
});

// or promise
.then(function(result) {
  // => 'hello world'
});
```


### Errors

To send back an error from your handler, handle it in the conventional Node.js way.

```javascript
return done(new Error('Oops'));
```

Depending on how userland code chooses to work with the deferred object, your error will be passed back to userland as either the first argument to the `.exec()` callback, or as the promise's rejection "reason".

```javascript
// Node-style callback
.exec(function(err, result) {
  // => [Error: oops], undefined
});

// or promise
.catch(function(err) {
  // => [Error: oops]
});
```

#### Negotiating errors

Sometimes, there is more than one exceptional exit a function might take.  To make it possible for userland code to negotiate different exits from your function, give the error a `code` property.

```javascript
var x = Math.random();

// Miscellaneous error (no code)
if (x > 1) {
  return done(new Error('Consistency violation: This should never happen.'));
}

var flaverr = require('flaverr');
// Other recognized exceptions
if (x > 0.6) {
  return done(flaverr('E_TOO_BIG', new Error('Oops: too big')));
}
if (x < 0.4) {
  return done(flaverr('E_TOO_SMALL', new Error('Too small -- probably already in use!')))
}
```

Then in userland, this can be easily negotiated.  Note that whether the code is using a Node-style callback or a promise, the approach is conceptually the same regardless.


```javascript
// Node-style callback
.exec(function(err, result) {
  if (err) {
    switch(err.code) {
      case 'E_TOO_BIG': return res.status(400).json({ reason: 'Ooh, too bad!  '+err.message });
      case 'E_TOO_SMALL': return res.status(401).json({ reason: 'Please try again later.  '+err.message });
      default:
        console.error('Unexpected error:',err.stack);
        return res.sendStatus(500);
    }
  }//-•

  // ...
});
```

```Javascript
// Promises
.then(function (result) {
  // ...
})
.catch({ code: 'E_TOO_BIG' }, function(err) {
  return res.status(400).json({ reason: 'Ooh, too bad!  '+err.message });
})
.catch({ code: 'E_TOO_SMALL' }, function(err) {
  return res.status(401).json({ reason: 'Please try again later.  '+err.message });
})
.catch(function(err) {
  console.error('Unexpected error:',err.stack);
  return res.sendStatus(500);
});
```


#### Handling uncaught exceptions

Out of the box, when using asynchronous callbacks in Node.js, _if the code in your callback throws an uncaught error, the process **will crash!**_

For example, the following code would crash the process:

```javascript
setTimeout(function (){

  // Since this string can't be parsed as JSON, this will throw an error.
  // And since we aren't using try...catch, it will crash the process.
  JSON.parse('who0ps"thisis totally not valid js{}n');

  return res.ok();

}, 50);
```

To protect against this, always be sure to use try...catch blocks around any logic
that might throw in an asynchronous, Node-style callback.

For example:

```javascript
setTimeout(function (){

  try {
    JSON.parse('who0ps"thisis totally not valid js{}n');
  } catch (e) { return res.serverError(e); }

  return res.ok();

}, 50);
```

Here are a few common use cases to watch out for:
+ basic JavaScript errors; e.g. syntax issues, or trying to use the dot (.) operator on `null`.
+ trying to JSON.parse() some data that is not a valid, parseable JSON string
+ trying to JSON.stringify() a circular object
+ RPS methods in Sails.js; e.g. `.publish()`, `.subscribe()`, `.unsubscribe()`
+ Waterline's `.validate()` model method
+ Node core's `assert()`
+ most synchronous methods from Node core (e.g. `fs.readFileSync()`)
+ any synchronous machine called with `.execSync()`
+ other synchronous functions from 3rd party libraries


_Note that this is not an issue when using promises, since `.then()` automatically catches uncaught errors
(although there are other considerations when using promises-- for instance, forgetting to use .catch()
each time .then() is used is a common source of hard-to-debug issues, technical debt, and memory leaks.)_


> **EXPERIMENTAL:** As of parley 2.3.x, there is a new, experimental feature that allows you to
> easily provide an extra layer of protection: an optional 2nd argument to `.exec()`.  If specified,
> this function will be used as an uncaught exception handler-- a simple fallback just in case something
> happens to go wrong in your callback function.
>
> This allows you to safely write code like the following without crashing the server:
>
> ```javascript
> User.create({ username: 'foo' }).exec(function (err, result) {
>   if (err) {
>     if (err.code === 'E_UNIQUE') { return res.badRequest('Username already in use.'); }
>     else { return res.serverError(err); }
>   }
>
>   var result = JSON.parse('who0ps"thisis totally not valid js{}n');
>
>   return res.ok(result);
>
> }, res.serverError);
> ```
>
> Of course, it's still best to be explicit about error handling whenever possible.
> The extra layer of protection is just that-- it's here to help prevent issues
> stemming from the myriad runtime edge cases it's almost impossible to anticipate
> when building a production-ready web application.


### Flow control

Since Node.js is asynchronous, seemingly-tricky flow control problems often arise in practical, userland code.  Fortunately, they're easy to solve when equipped with the proper tools and strategies.

> Most of the examples below use simple Node callbacks, but note that many similar affordances are available for promises -- for example, check out `.toPromise()` ([below](#toPromise)) and `Promise.all()` (in bluebird, or native in ES6, etc.).  The concepts are more or less the same regardless.
>
> _Unless you and the rest of your team are experts with promises and already have tight, consistently-applied and agreed-upon conventions for how to implement the use cases below, you're probably best off using Node callbacks._

#### Async loops

Loop over many asynchronous things, one at a time, using `async.eachSeries()`.

> For this example, make sure you have access to the [`async` library](http://npmjs.com/package/async):
>
>```javascript
>var async = require('async');
>```

```javascript
var results = [];
async.eachSeries(['a','b','c','d','e','f','g','h','i','j','k','l'], function (letter, next) {
  doStuff(letter).exec(function (err, resultForThisLetter){
    if (err) { return next(err); }
    results.push(resultForThisLetter)
    return next();
  });
},
// ~∞%°
function afterwards(err) {
  if (err) {
    console.error(err);
    return res.sendStatus(500);
  }
  return res.json(results);
});
```

#### Async "if"

Even simple detours and conditionals can sometimes be tricky when things get asynchronous.

Fortunately, relatively concise and robust branching logic can be easily implemented using out-of-the-box JavaScript using this weird trick™.

```javascript
User.findOne({ id: req.param('id') })
.exec(function(err, profileUser) {
  if (err) { return res.serverError(err); }
  if (!profileUser) { return res.notFound(); }

  // If the request came from a logged in user,
  // then fetch that user's record from the database.
  (function(proceed) {
    if (!req.session.userId) {
      return proceed();
    }
    User.findOne({ id: req.session.userId })
    .exec(function (err, loggedInUser) {
      if (err) { return proceed(err); }
      if (!loggedInUser) { return proceed(new Error('Logged-in user ('+req.session.userId+') is missing from the db!')); }
      return proceed(undefined, loggedInUser);
    });

  // ~∞%°
  })(function afterwards(err, loggedInUser){
    if (err) { return res.serverError(err); }

    return res.view('profile', {
      profile: _.omit(profileUser, ['password', 'email']),
      me: loggedInUser ? _.omit(loggedInUser, 'password') : {}
    });

  });
});
```

> [More background on using the if/then/finally pattern for asynchronous flow control](https://gist.github.com/mikermcneil/32391da94cbf212611933fabe88486e3)

#### Async recursion

Much like "if/then/finally" above, the secret to tidy asynchronous recursion is the (notorious) self-calling function.

```javascript
#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

// Starting from the current working directory, ascend upwards
// looking for a package.json file.  (Keep looking until we hit an error.)
(function _recursively(thisDir, done){

  var pathToCheck = path.resolve(thisDir, './package.json');
  fs.stat(pathToCheck, function(err) {
    if (err) {
      switch (err.code) {

        // Not found -- so keep going.
        case 'ENOENT':
          var oneLvlUp = path.dirname(thisDir);
          _recursively(oneLvlUp, function(err, nearestPJ) {
            if (err) { return done(err); }
            return done(undefined, nearestPJ);
          });
          return;

        // Misc. error
        default: return done(err);
      }
    }//-•

    // Otherwise, found it!
    return done(undefined, pathToCheck);

  });//</ fs.exists >

// ~∞%°
})(process.cwd(), function afterwards(err, nearestPJ) {
  if (err) {
    console.error(err);
    return process.exit(1);
  }

  console.log('Found nearest package.json file at:',nearestPJ);

});
```

> [More examples and thoughts on asynchronous recursion](https://gist.github.com/mikermcneil/225198a46317050af1f772296f67e6ce)


#### Parallel processing / "races"

To manage "races" between deferred objects while still performing tasks simultaneously, you can use `async.each()` -- for example, here's the `async.eachSeries()` code from above again, but optimized to run on groups of letters simultaneously, while still processing letters within those groups in sequential order:

```javascript
var results = [];
async.each(['abc','def','ghi','jkl'], function (group, next) {

  var theseLetters = group.split('');
  var resultsForThisGroup = [];
  async.eachSeries(theseLetters, function (letter, next) {
    doStuff(letter).exec(function (err, resultForThisLetter){
      if (err) { return next(err); }
      resultsForThisGroup.push(resultForThisLetter)
      return next();
    });
  },// ~∞%°
  function (err) {
    if (err) { return next(err); }

    resultsForThisGroup.forEach(function(letter){
      results.push(letter);
    });

    return next();
  });

},// ~∞%°
function afterwards(err) {
  if (err) {
    console.error(err);
    return res.sendStatus(500);
  }
  return res.json(results);
});
```

> [More background on asynchronous vs. synchronous flow control in general](https://gist.github.com/mikermcneil/755a2ae7cc62d9a59656ab3ba9076cc1)




## API reference

### Implementor interface

#### parley()

Build and return a deferred object.

As its first argument, expects a function (often called the handler, or more specifically "handleExec") that will run whenever userland code executes the deferred object (e.g. with `.exec()`).

```javascript
var deferred = parley(function (done) {
  // • If something goes wrong, call `done(new Error('something went wrong'))`
  // • If everything worked out, and you want to send a result back, call `done(undefined, result);`
  // • Otherwise, if everything worked out but no result is necessary, simply call:
  return done();
});
```

This first argument is mandatory-- it defines what your implementation _actually does_ when `.exec()` is called.

##### Optional callback
There is also an optional second argument you can use: another function that, if provided, will cause your handler (the first arg) to run _immediately_.
This provides a simple, optimized shortcut for exposing an optional callback to your users.

> Why bother?  Well, for one thing, it's stylistically a good idea to give users a way to call your handler with as little sugar on top as possible.  More rarely, for very performance-sensitive applications, direct callback usage does provide a mild performance benefit.

```javascript
var deferred = parley(function (done){
  // ...
}, optionalCbFromUserland);
```

##### Custom methods
The safest way to attach custom methods is by using parley's optional 3rd argument.  The usual approach is for these custom methods to be chainable (i.e. return `this`).

```javascript
var privateMetadata = {};

var deferred = parley(function (done){
  // ...
}, optionalCbFromUserland, {
  someCustomMethod: function(a,b,c){
    privateMetadata = privateMetadata || {};
    privateMetadata.foo = privateMetadata.foo || 1;
    privateMetadata.foo++;
    return deferred;
  }
});
```

> Don't use this approach to define non-functions or overrides with special meaning (e.g. `inspect`, `toString`, or `toJSON`).
> To do that, just set the property directly-- for example:
> ```javascript
> deferred.inspect = function(){ return '[My cool deferred!]'; };
> ```


### Userland interface

The deferred object returned by `parley()` exposes a few different methods.

#### .exec()

```javascript
parley(function(done){ return done(undefined, 1+1); })
.exec(function (err, result) {
  // => undefined, 2
});
```

```javascript
parley(function(done){ return done(new Error('whoops'), 1+1); })
.exec(function (err, result) {
  // => [Error: whoops], undefined
});
```

#### .then()

```javascript
parley(function(done){ return done(undefined, 1+1); })
.then(function (result) {
  // => 2
});
```

#### .catch()

```javascript
parley(function(done){ return done(new Error('whoops'), 1+1); })
.catch(function (err) {
  // => [Error: whoops]
});
```

#### .toPromise()

```javascript
var promise1 = parley(function(done){ return done(undefined, 1+1); }).toPromise();
var promise2 = parley(function(done){ setTimeout(function(){ return done(); }, 10); }).toPromise();

Promise.all([
  promise1,
  promise2
])
.then(function(result){
  // => [2, undefined]
}).catch(function (err) {

});
```


#### Other methods

Implementors may also choose to attach other methods to the deferred object (e.g. `.where()`).  See "Custom methods" above for more information.


## Contributing &nbsp; [![Master Branch Build Status](https://travis-ci.org/mikermcneil/parley.svg?branch=master)](https://travis-ci.org/mikermcneil/parley) &nbsp; [![Master Branch Build Status (Windows)](https://ci.appveyor.com/api/projects/status/tdu70ax32iymvyq3?svg=true)](https://ci.appveyor.com/project/mikermcneil/parley)

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](http://sailsjs.com/documentation/contributing) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/parley.png?downloads=true)](http://npmjs.com/package/parley)

## Pronunciation

[`/ˈpärlē/`](http://www.macmillandictionary.com/us/pronunciation/american/parley)

> _Rather than picking barley and getting snarly, she decided to `npm install parley` and listen to some Bob Marley._

## License

This package, like the [Sails framework](http://sailsjs.com), is free and open-source under the [MIT License](http://sailsjs.com/license).


