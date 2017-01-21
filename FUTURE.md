# Future

It would be possible to support more performant usage-- something like:

```js
var parley = require('parley');



var customParley = parley.custom({
  where: function(){
    this._criteria = this._critera || {};
    this._criteria.where = this._critera.where || {};
  },
  limit: function(){ /* etc */},
  skip: function(){ /* etc. */},
});


module.exports = function find(criteriaMaybe, explicitCbMaybe){
  


  return customParley(function(done){

  }, explicitCbMaybe);

};

```



But note that the above doesn't allow you to provide access to truly private, per-Deferred variables (via closure scope) inside of Deferred instance methods.  Instead, pseudo-private (e.g. underscore-scoped) instance variables have to be used.


It's unclear whether this is worth it-- would need to evaluated to see how much more performance it could potentially unlock.
