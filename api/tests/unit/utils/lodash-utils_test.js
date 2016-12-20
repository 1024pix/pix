/* global describe, it, expect */

const _ = require('../../../lib/utils/lodash-utils'); // our custom function(s) of lodash
const original_lodash = require('lodash');


describe('Unit | Utils | lodash-utils', function () {

  describe('scope', function () {
    it('should not affect original version of lodash', function (done) {
      expect(original_lodash.elementAfter).not.to.exist;
      expect(_.elementAfter).to.exist;
      done();
    });
  });

  describe('elementAfter', function () {
    it('for a given array and element in array (but not the last one), should return the element after the one provided', function (done) {
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'a')).to.equal('b');
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'b')).to.equal('c');
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'c')).to.equal('d');
      done();
    });
    it('for a given array and the LAST element in array, should return undefined', function (done) {
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'd')).to.equal(undefined);
      done();
    });
    it('for a given array and an element NOT in array, should return undefined', function (done) {
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'z')).to.equal(undefined);
      done();
    });
    it('for an empty array, should return undefined', function (done) {
      expect(_.elementAfter([], 'z')).to.equal(undefined);
      done();
    });
    it('if first arg is not an array, should return undefined', function (done) {
      expect(_.elementAfter(new Date(), 'a')).to.equal(undefined);
      done();
    });
    it('if last arg is missing, should return undefined', function (done) {
      expect(_.elementAfter(['a', 'b', 'c', 'd'])).to.equal(undefined);
      done();
    });
    it('if both args are is missing, should return undefined', function (done) {
      expect(_.elementAfter()).to.equal(undefined);
      done();
    });
  });
});
