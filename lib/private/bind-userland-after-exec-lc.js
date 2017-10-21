/**
 * Module dependencies
 */

var util = require('util');
var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');


/**
 * bindUserlandAfterExecLC()
 *
 * Shared by .intercept() and .tolerate().
 *
 * @param  {String} lcType
 * @param  {String|Dictionary|Function} negotiationRuleOrWildcardHandler
 * @param  {Function?} specificHandler
 * @param  {Deferred} deferred
 *
 *
 * > The lifecycle callback attached here will run *before* this Deferred's
 * > `interceptAfterExec` function (if it has one configured from implementorland.)
 * >
 * > Historical notes:
 * > https://gist.github.com/mikermcneil/c1bc2d57f5bedae810295e5ed8c5f935
 */
module.exports = function bindUserlandAfterExecLC(lcType, negotiationRuleOrWildcardHandler, specificHandler, deferred){

  // Handle variadic usage.
  var handler;
  var negotiationRule;
  if (_.isFunction(negotiationRuleOrWildcardHandler) && specificHandler === undefined) {
    handler = negotiationRuleOrWildcardHandler;
  }
  else {
    negotiationRule = negotiationRuleOrWildcardHandler;
    handler = specificHandler;
  }

  // Validate arguments.
  if (handler !== undefined && !_.isFunction(handler)) {
    throw flaverr({
      name:
        'UsageError',
      message:
        'Invalid usage of `.'+lcType+'()`.  Provided handler function is invalid.\n'+
        ' [?] See https://sailsjs.com/support for help.'
    }, deferred._omen);
  }//•

  if (handler !== undefined && handler.constructor.name === 'AsyncFunction') {
    throw flaverr({
      name:
        'UsageError',
      message:
        '`async` functions are not currently supported for `.'+lcType+'()` '+
        'handlers, so please stick to synchronous logic for now.  In the mean time, if you '+
        'need to use asynchronous logic while intercepting or tolerating an error (such as '+
        'additional database queries or HTTP requests) you can still accomplish this '+
        'by refactoring your code.\n'+
        ' [?] For advice or assistance, come visit https://sailsjs.com/support'
    });
  }//•

  if (handler === undefined && lcType === 'intercept') {
    throw flaverr({
      name:
        'UsageError',
      message:
        'Invalid usage of `.intercept()`.  No handler function provided.\n'+
        ' [?] See https://sailsjs.com/support for help.'
    }, deferred._omen);
  }//•

  if (handler === undefined && negotiationRule === undefined && lcType === 'tolerate') {
    throw flaverr({
      name:
        'UsageError',
      message:
        'Invalid usage of `.tolerate()`.  No handler function was provided, and no\n'+
        'negotiation rule was provided either.  It would be unsafe to continue.\n'+
        'It is never a good idea to tolerate *ALL* errors a function might\n'+
        'encounter, because doing so would make it easy to accidentally swallow\n'+
        'real problems or bugs.  So instead, please provide some way of narrowing\n'+
        'down the errors which you\'d like to tolerate, like `.tolerate(\'E_FOOBAR\')`.\n'+
        ' [?] See https://sailsjs.com/support for help.'
    }, deferred._omen);
  }//•


  if (negotiationRule !== undefined) {

    if (_.isString(negotiationRule) && negotiationRule) {
      // Ok, we'll assume it's fine.
    }
    else if (_.isArray(negotiationRule)) {
      // you can bind multiple LCs at the same time
      // (array rules are automatically split into sub-rules)
    }
    else if (_.isObject(negotiationRule) && !_.isArray(negotiationRule) && !_.isFunction(negotiationRule)) {
      // flaverr/bluebird/lodash-style dictionary negotiation rules are now supported.
    }
    else {
      throw flaverr({
        name:
          'UsageError',
        message:
          'Invalid usage of `.'+lcType+'()`.  Invalid error negotiation rule: `'+util.inspect(negotiationRule,{depth:null})+'`.\n'+
          ' [?] For advice or assistance, come visit https://sailsjs.com/support'
      }, deferred._omen);
    }

  }//ﬁ


  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // FUTURE: MAYBE add a best-effort check to make sure there is no pre-existing
  // after exec LC rule that matches this one (i.e. already previously registered
  // using .tolerate() or .intercept())
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  if (!deferred._userlandAfterExecLCs) {
    deferred._userlandAfterExecLCs = [];
  }//ﬁ

  if (_.isArray(negotiationRule)) {
    for (var i=0; i<negotiationRule.length; i++) {
      deferred._userlandAfterExecLCs.push({
        type: lcType,
        rule: negotiationRule[i],
        handler: handler
      });
    }//∞
  }
  else {
    deferred._userlandAfterExecLCs.push({
      type: lcType,
      rule: negotiationRule,
      handler: handler
    });
  }

  return deferred;
};

