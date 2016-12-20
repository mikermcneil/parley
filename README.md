parley
=========

Practical, lightweight flow control for Node.js


## Usage

Parley helps you write functions that can be called like this:

```javascript
doStuff({ foo: 123 })
.set({ bar: 456 })
.exec(function (err, result){

});
```

Or like this:

```javascript
doStuff({ foo: 123 })
.set({ bar: 456 })
.then(function (result){

})
.catch(function(err) {

});
```

Or using "pure" promises:

```javascript
var promise = doStuff({ foo: 123 })
.set({ bar: 456 })
.toPromise();
```


## Implementation

Use parley to build a **deferred object**.  Then attach any extra methods you'd like to add (optional), and return the deferred object.

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


#### Results

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


## Errors

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

Then in userland, this can be easily negotiated.  Note that whether the code is using a Node-style callback or a promise, the approach is the same regardless.


```javascript
// Node-style callback
.exec(function(err, result) {
  if (err) {
    switch(err.code) {
      case 'E_TOO_BIG': return res.status(400).json({ reason: 'Ooh, too bad!  '+err.message });
      case 'E_TOO_SMALL': return res.status(401).json({ reason: 'Please try again later.  '+err.message });
      default:
        // Handle unexpected error:
        console.error(err.stack);
        return res.sendStatus(500);
    }
  }//-•

  // ...
});

// or promise
.catch(function(err) {
  // => [Error: oops]
});
```


## Flow control

Since Node.js is asynchronous, seemingly-tricky flow control problems often arise in practical, userland code.  Fortunately, they're easy to solve when equipped with the proper tools.

When using Node-style callbacks, use the [`async` package](http://npmjs.com/package/async).

```javascript
var async = require('async');
```

> Most of the examples below use async for simplicity, but note that many similar affordances are available for promises -- for example, check out `.toPromise()` (below) and `Promise.all()` (in bluebird, or native in ES6, etc.).  The concepts are more or less the same regardless.


#### Async loops

Loop over many asynchronous things, one at a time, using `async.eachSeries()`.

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
      me: _.omit(loggedInUser, 'password')
    });

  });
});
```

> [More background on using the if/then/finally pattern for asynchronous flow control](https://gist.github.com/mikermcneil/32391da94cbf212611933fabe88486e3)

#### Async recursion

Much like "if/then/finally" above, the secret to tidy asynchronous recursion is self-calling function.

```javascript
#!/usr/bin/env node

var path = require('path');
var fs = require('fs');

// Starting from the current working directory, ascend upwards
// looking for a package.json file.  (Keep looking until we hit an error.)
(function _recursively(thisDir, done){

  var pathToCheck = path.resolve(thisDir, './package.json');
  fs.exists(thisDir, function(err, exists) {
    if (err) { return done(err); }
    if (exists) {
      // Found it!
      return done(undefined, pathToCheck);
    }

    // Otherwise keep going.
    var oneLvlUp = path.dirname(thisDir);
    _recursively(oneLvlUp, function(err, nearestPJ) {
      if (err) { return done(err); }
      return done(undefined, nearestPJ);
    });

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

#### Implementor interface

##### parley()

Build and return a deferred object.

As its first argument, expects a function that will run whenever userland code executes the deferred object.

```javascript
var deferred = parley(function (done) {
  // ...
});
```

Or, instead of passing in a function, you can pass in a dictionary of options.

```javascript
var deferred = parley({
  codeName: 'doStuff',
  handleExec: function (done){
    // ...
    return done();
  }
});
```

| Option         | Data type       | Description
|:---------------|-----------------|:-------------------------------------------------------------------------------------------------------------------|
| handleExec     | ((function))    | This is the function that you must provide in order to describe what happens when the deferred object is executed.
| codeName       | ((_string?_))   | An optional value used to improve readability when the deferred object is logged using console.log().  Note that some readability enhancements are disabled in production (for performance reasons.)




#### Userland interface

The deferred object returned by `parley()` exposes a few different methods.

##### .exec()

```javascript
.exec(function (err, result) {

});
```

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

##### .then()

```javascript
parley(function(done){ return done(undefined, 1+1); })
.then(function (result) {
  // => 2
});
```

##### .catch()

```javascript
parley(function(done){ return done(new Error('whoops'), 1+1); })
.catch(function (err) {
  // => [Error: whoops]
});
```

##### .toPromise()

```javascript
var promise1 = parley(function(done){ return done(undefined, 1+1); }).toPromise();
var promise2 = parley(function(done){ setTimeout(function(){ return done(); }, 10); }).toPromise();

Promise.all([
  promise1,
  promise2
])
.then(function(result){
  // => result
}).catch(function (err) {

});
```


## Help

If you have questions or are having trouble, click [here](http://sailsjs.com/support).


## Bugs &nbsp; [![NPM version](https://badge.fury.io/js/parley.svg)](http://npmjs.com/package/parley)

To report a bug, [click here](http://sailsjs.com/bugs).


## Contributing &nbsp; [![Master Branch Build Status](https://travis-ci.org/mikermcneil/parley.svg?branch=master)](https://travis-ci.org/mikermcneil/parley) &nbsp; [![Master Branch Build Status (Windows)](https://ci.appveyor.com/api/projects/status/tdu70ax32iymvyq3?svg=true)](https://ci.appveyor.com/project/mikermcneil/parley)

Please observe the guidelines and conventions laid out in the [Sails project contribution guide](http://sailsjs.com/contribute) when opening issues or submitting pull requests.

[![NPM](https://nodei.co/npm/parley.png?downloads=true)](http://npmjs.com/package/parley)

## License

This package, like the [Sails framework](http://sailsjs.com), is free and open-source under the [MIT License](http://sailsjs.com/license).


