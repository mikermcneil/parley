/**
 * Module dependencies
 */

var util = require('util');
var assert = require('assert');
var _ = require('@sailshq/lodash');
var parley = require('../');
var find = require('./fixtures/find.fixture');



/**
 * practical.test.js
 *
 * A simple test verifiying a real-world use case.
 */

describe('practical.test.js', function() {

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

});
