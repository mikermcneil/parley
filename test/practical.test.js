/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var parley = require('../');
var find = require('./fixtures/find.fixture');
var validateButWith9CustomMethods = require('./fixtures/validate-but-with-9-custom-methods.fixture');
var findButWithTimeout = require('./fixtures/find-but-with-timeout.fixture');
var findButWithInterceptAfterExec = require('./fixtures/find-but-with-intercept-after-exec.fixture');


/**
 * practical.test.js
 *
 * A simple test verifiying a couple of real-world use cases.
 */

describe('practical.test.js', function() {

  //  ██████╗ ██████╗ ███████╗████████╗███████╗███╗   ██╗██████╗
  //  ██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝████╗  ██║██╔══██╗
  //  ██████╔╝██████╔╝█████╗     ██║   █████╗  ██╔██╗ ██║██║  ██║
  //  ██╔═══╝ ██╔══██╗██╔══╝     ██║   ██╔══╝  ██║╚██╗██║██║  ██║
  //  ██║     ██║  ██║███████╗   ██║   ███████╗██║ ╚████║██████╔╝
  //  ╚═╝     ╚═╝  ╚═╝╚══════╝   ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═════╝
  //
  //     ███████╗██╗███╗   ██╗██████╗  ██╗██╗
  //     ██╔════╝██║████╗  ██║██╔══██╗██╔╝╚██╗
  //     █████╗  ██║██╔██╗ ██║██║  ██║██║  ██║
  //     ██╔══╝  ██║██║╚██╗██║██║  ██║██║  ██║
  //  ██╗██║     ██║██║ ╚████║██████╔╝╚██╗██╔╝
  //  ╚═╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═════╝  ╚═╝╚═╝
  //
  describe('calling a simplified mock of Waterline\'s `find()` model method', function(){

    describe('simulated success', function(){

      it('should work with explicit callback', function(done){
        find(function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [undefined]);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should work with 1st arg + explicit callback', function(done){
        find({ where: {id:3} }, function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [{ where:{id:3} }]);
          } catch (e) { return done(e); }
          return done();
        });
      });

      it('should work with .exec()', function(done){
        find().exec(function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [undefined]);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should work with 1st arg + .exec()', function(done){
        find({ where: {id:3} }).exec(function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [{ where:{id:3} }]);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should work with .where() + .exec()', function(done){
        find()
        .where({id:4})
        .exec(function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [{ where:{id:4} }]);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should work with 1st arg + .where() + .exec()', function(done){
        find({ where: {id:3, x:30} })
        .where({id:4})
        .exec(function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [{ where:{id:4} }]);
          } catch (e) { return done(e); }
          return done();
        });
      });

    });//</ simulated success >

  });//</ calling simulated .find() >


  //  ██╗   ██╗███████╗██╗███╗   ██╗ ██████╗      ██████╗██╗   ██╗███████╗████████╗ ██████╗ ███╗   ███╗
  //  ██║   ██║██╔════╝██║████╗  ██║██╔════╝     ██╔════╝██║   ██║██╔════╝╚══██╔══╝██╔═══██╗████╗ ████║
  //  ██║   ██║███████╗██║██╔██╗ ██║██║  ███╗    ██║     ██║   ██║███████╗   ██║   ██║   ██║██╔████╔██║
  //  ██║   ██║╚════██║██║██║╚██╗██║██║   ██║    ██║     ██║   ██║╚════██║   ██║   ██║   ██║██║╚██╔╝██║
  //  ╚██████╔╝███████║██║██║ ╚████║╚██████╔╝    ╚██████╗╚██████╔╝███████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
  //   ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝      ╚═════╝ ╚═════╝ ╚══════╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
  //
  //  ███╗   ███╗███████╗████████╗██╗  ██╗ ██████╗ ██████╗ ███████╗
  //  ████╗ ████║██╔════╝╚══██╔══╝██║  ██║██╔═══██╗██╔══██╗██╔════╝
  //  ██╔████╔██║█████╗     ██║   ███████║██║   ██║██║  ██║███████╗
  //  ██║╚██╔╝██║██╔══╝     ██║   ██╔══██║██║   ██║██║  ██║╚════██║
  //  ██║ ╚═╝ ██║███████╗   ██║   ██║  ██║╚██████╔╝██████╔╝███████║
  //  ╚═╝     ╚═╝╚══════╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝
  //
  describe('calling something that takes advantage of parley\'s built-in support for custom methods', function(){

    it('should work with explicit callback', function(done){
      validateButWith9CustomMethods(function (err, result) {
        if (err) { return done(err); }
        try {
          assert.strictEqual(result, undefined);
        } catch (e) { return done(e); }
        return done();
      });
    });

    it('should work with .exec()', function(done){
      validateButWith9CustomMethods().exec(function (err, result) {
        if (err) { return done(err); }
        try {
          assert.strictEqual(result, undefined);
        } catch (e) { return done(e); }
        return done();
      });
    });

    it('should work with .then()', function(done){
      validateButWith9CustomMethods()
      .then(function (result) {
        try {
          assert.strictEqual(result, undefined);
        } catch (e) { return done(e); }
        return done();
      }).catch(function(err) { return done(err); });
    });

    it('should work with .b() + .exec()', function(done){
      validateButWith9CustomMethods()
      .b({id:4})
      .exec(function (err, result) {
        if (err) { return done(err); }
        try {
          assert.strictEqual(result, undefined);
        } catch (e) { return done(e); }
        return done();
      });
    });

    it('should work with .b() + .then()', function(done){
      validateButWith9CustomMethods()
      .b({id:4})
      .then(function (result) {
        try {
          assert.strictEqual(result, undefined);
        } catch (e) { return done(e); }
        return done();
      }).catch(function(err) { return done(err); });
    });

  });//</ calling something that takes advantage of parley\'s built-in support for custom methods >




  //  ██╗   ██╗███████╗██╗███╗   ██╗ ██████╗
  //  ██║   ██║██╔════╝██║████╗  ██║██╔════╝
  //  ██║   ██║███████╗██║██╔██╗ ██║██║  ███╗
  //  ██║   ██║╚════██║██║██║╚██╗██║██║   ██║
  //  ╚██████╔╝███████║██║██║ ╚████║╚██████╔╝
  //   ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝
  //
  //  ████████╗██╗███╗   ███╗███████╗ ██████╗ ██╗   ██╗████████╗
  //  ╚══██╔══╝██║████╗ ████║██╔════╝██╔═══██╗██║   ██║╚══██╔══╝
  //     ██║   ██║██╔████╔██║█████╗  ██║   ██║██║   ██║   ██║
  //     ██║   ██║██║╚██╔╝██║██╔══╝  ██║   ██║██║   ██║   ██║
  //     ██║   ██║██║ ╚═╝ ██║███████╗╚██████╔╝╚██████╔╝   ██║
  //     ╚═╝   ╚═╝╚═╝     ╚═╝╚══════╝ ╚═════╝  ╚═════╝    ╚═╝
  //
  describe('calling something that takes advantage of parley\'s built-in support for timeouts', function(){

    describe('in cases where timeout is explicitly unsupported', function(){

      it('should NOT RESPECT TIMEOUT WHEN given an explicit callback', function(done){
        findButWithTimeout(function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [undefined]);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should NOT RESPECT TIMEOUT WHEN given 1st arg + explicit callback', function(done){
        findButWithTimeout({ where: {id:3} }, function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [{ where:{id:3} }]);
          } catch (e) { return done(e); }
          return done();
        });
      });

    });


    describe('in cases where timeout is supposed to work', function(){

      it('should time out properly given .exec()', function(done){
        findButWithTimeout().exec(function (err, result) {
          try {
            assert.equal(err.name, 'TimeoutError');
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should time out properly given 1st arg + .exec()', function(done){
        findButWithTimeout({ where: {id:3} }).exec(function (err, result) {
          try {
            assert.equal(err.name, 'TimeoutError');
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should time out properly given .where() + .exec()', function(done){
        findButWithTimeout()
        .where({id:4})
        .exec(function (err, result) {
          try {
            assert.equal(err.name, 'TimeoutError');
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should time out properly given 1st arg + .where() + .exec()', function(done){
        findButWithTimeout({ where: {id:3, x:30} })
        .where({id:4})
        .exec(function (err) {
          try {
            assert.equal(err.name, 'TimeoutError');
          } catch (e) { return done(e); }
          return done();
        });
      });

    });



  });//</ calling something that takes advantage of parley\'s built-in support for timeouts >


  //  ██╗   ██╗███████╗██╗███╗   ██╗ ██████╗     ██╗      ██████╗
  //  ██║   ██║██╔════╝██║████╗  ██║██╔════╝     ██║     ██╔════╝██╗
  //  ██║   ██║███████╗██║██╔██╗ ██║██║  ███╗    ██║     ██║     ╚═╝
  //  ██║   ██║╚════██║██║██║╚██╗██║██║   ██║    ██║     ██║     ██╗
  //  ╚██████╔╝███████║██║██║ ╚████║╚██████╔╝    ███████╗╚██████╗╚═╝
  //   ╚═════╝ ╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝     ╚══════╝ ╚═════╝
  //
  //  ██╗███╗   ██╗████████╗███████╗██████╗  ██████╗███████╗██████╗ ████████╗ █████╗ ███████╗████████╗███████╗██████╗ ███████╗██╗  ██╗███████╗ ██████╗
  //  ██║████╗  ██║╚══██╔══╝██╔════╝██╔══██╗██╔════╝██╔════╝██╔══██╗╚══██╔══╝██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██╔════╝╚██╗██╔╝██╔════╝██╔════╝
  //  ██║██╔██╗ ██║   ██║   █████╗  ██████╔╝██║     █████╗  ██████╔╝   ██║   ███████║█████╗     ██║   █████╗  ██████╔╝█████╗   ╚███╔╝ █████╗  ██║
  //  ██║██║╚██╗██║   ██║   ██╔══╝  ██╔══██╗██║     ██╔══╝  ██╔═══╝    ██║   ██╔══██║██╔══╝     ██║   ██╔══╝  ██╔══██╗██╔══╝   ██╔██╗ ██╔══╝  ██║
  //  ██║██║ ╚████║   ██║   ███████╗██║  ██║╚██████╗███████╗██║        ██║   ██║  ██║██║        ██║   ███████╗██║  ██║███████╗██╔╝ ██╗███████╗╚██████╗
  //  ╚═╝╚═╝  ╚═══╝   ╚═╝   ╚══════╝╚═╝  ╚═╝ ╚═════╝╚══════╝╚═╝        ╚═╝   ╚═╝  ╚═╝╚═╝        ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝
  //
  describe('calling something that takes advantage of interceptAfterExec', function(){

    describe('in cases where interceptAfterExec is explicitly unsupported given an explicit callback with success (i.e. where the LC might normally modify the result/error if we were using .exec())', function(){

      it('should NOT RESPECT LC WHEN given explicit callback as first arg', function(done){
        findButWithInterceptAfterExec(function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [undefined]);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should NOT RESPECT LC WHEN given 1st arg + explicit callback', function(done){
        findButWithInterceptAfterExec({ where: {id:3} }, function (err, result) {
          if (err) { return done(err); }
          try {
            assert.deepEqual(result, [{ where:{id:3} }]);
          } catch (e) { return done(e); }
          return done();
        });
      });

    });


    describe('in cases where this is supposed to work', function(){

      it('should work normally given .exec() with an error, where the LC is a pass-through', function(done){
        findButWithInterceptAfterExec(false).exec(function (err) {
          try {
            assert(_.isError(err), 'Expecting `err` to be an Error instance!  But instead got: '+err);
            assert.equal(err.code, 'E_SOME_ERROR', 'Expected error with a `code` of "E_SOME_ERROR".  But instead, got an error with a different code (`'+err.code+'`).  Here\'s the error: '+err);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should work normally given .exec() with success, where the LC is a pass-through', function(done){
        findButWithInterceptAfterExec(true).exec(function (err, result) {
          try {
            assert(!err, 'Got unexpected error in test: '+err);
            assert(_.isArray(result), 'Expecting result to be an array!  But instead got: '+result);
            assert.equal(result.length, 1);
            assert.equal(result[0], true);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should properly apply changes from LC given .exec() with an error', function(done){
        findButWithInterceptAfterExec(null).exec(function (err) {
          try {
            assert(_.isError(err), 'Expecting `err` to be an Error instance!  But instead got: '+err);
            assert.equal(err.code, 'E_SOME_UNRECOGNIZED_ERROR', 'Expected error with a `code` of "E_SOME_UNRECOGNIZED_ERROR".  But instead, got an error with a different code (`'+err.code+'`).  Here\'s the error: '+err);
          } catch (e) { return done(e); }
          return done();
        });
      });
      it('should properly apply changes from LC given .exec() with success', function(done){
        findButWithInterceptAfterExec().exec(function (err, result) {
          try {
            assert(!err, 'Got unexpected error in test: '+err);
            assert(_.isArray(result), 'Expecting result to be an array!  But instead got: '+result);
            assert.equal(result.length, 2);
            assert.equal(result[0], undefined);
            assert.deepEqual(result[1], { fake: true });
          } catch (e) { return done(e); }
          return done();
        });
      });

    });


  });//</ calling something that takes advantage of interceptAfterExec >


});
