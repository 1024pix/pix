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


  describe('ensureString', function () {
    it('when no input, return an empty String', function (done) {
      expect(_.ensureString()).to.equal('');
      done();
    });
    it('when input is explicitly undefined, return an empty String', function (done) {
      expect(_.ensureString(undefined)).to.equal('');
      done();
    });
    it('when input is explicitly null, return an empty String', function (done) {
      expect(_.ensureString(null)).to.equal('');
      done();
    });
    it('when input is a number (typeof meaning), it returns a JSON.stringify version of the input', function (done) {
      expect(_.ensureString(42)).to.equal('42');
      done();
    });
    it('when input is a string (typeof meaning), it returns a JSON.stringify version of the input', function (done) {
      expect(_.ensureString('42')).to.equal('42');
      done();
    });
    it('when input is an object (typeof meaning), it returns a JSON.stringify version of the input', function (done) {
      expect(_.ensureString(/[aeiou]+/g)).to.equal('/[aeiou]+/g');
      done();
    });
    it('when input is an boolean (typeof meaning), it returns a JSON.stringify version of the input', function (done) {
      expect(_.ensureString(true)).to.equal('true');
      done();
    });
  });
});
