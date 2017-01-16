/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var parley = require('../');
var find = require('./fixtures/find.fixture');
var validateButWith9CustomMethods = require('./fixtures/validate-but-with-9-custom-methods.fixture');


/**
 * practical.test.js
 *
 * A simple test verifiying a real-world use case.
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

});
