/**
 * Module dependencies
 */

// n/a


/**
 * customizeOmenOrBuildNewError()
 *
 * Return a new error instance, with "hindsight".
 *
 * If an omen is provided, it will be customized (REMEMBER: CAN ONLY DO IT ONCE!!)
 * Otherwise, a new Error instance will be built and returned.
 *
 * @param  {String} message
 * @param  {Error?} omen
 * @return {Error}
 */

module.exports = function customizeOmenOrBuildNewError(message, omen){

  if (omen) {
    omen.message = message;
    return omen;
  }
  else {
    return new Error(message);
  }

};
