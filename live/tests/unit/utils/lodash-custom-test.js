import { expect } from 'chai';
import { describe, it } from 'mocha';
import _ from 'pix-live/utils/lodash-custom';

describe('Unit | Utility | lodash custom', function() {
  // Replace this with your real tests.
  describe('isNonEmptyString', function() {
    it('when undefined, returns false', function() {
      expect(_.isNonEmptyString(undefined)).to.equal(false);
    });
    it('when null, returns false', function() {
      expect(_.isNonEmptyString(null)).to.equal(false);
    });
    it('when no arg, returns false', function() {
      expect(_.isNonEmptyString()).to.equal(false);
    });
    it('when not a string, returns false', function() {
      expect(_.isNonEmptyString(new Date())).to.equal(false);
    });
    it('when it is an empty string, returns false', function() {
      expect(_.isNonEmptyString('')).to.equal(false);
    });
    it('when it is a filled string, returns true', function() {
      expect(_.isNonEmptyString('abcd')).to.equal(true);
    });
  });
  describe('isTruthy', function() {
    it('when undefined, returns false', function() {
      expect(_.isTruthy(undefined)).to.equal(false);
    });
    it('when null, returns false', function() {
      expect(_.isTruthy(null)).to.equal(false);
    });
    it('when no arg, returns false', function() {
      expect(_.isTruthy()).to.equal(false);
    });
    it('when true, returns true', function() {
      expect(_.isTruthy(true)).to.equal(true);
    });
    it('when false, returns false', function() {
      expect(_.isTruthy(false)).to.equal(false);
    });
    it('when 1, returns true', function() {
      expect(_.isTruthy(1)).to.equal(true);
    });
    it('when 0, returns false', function() {
      expect(_.isTruthy(0)).to.equal(false);
    });
    it('when [1,2,3], returns true', function() {
      expect(_.isTruthy([1,2,3])).to.equal(true);
    });
    it('when [], returns true', function() {
      expect(_.isTruthy([])).to.equal(false);
    });
    it('when {a:42}, returns true', function() {
      expect(_.isTruthy({a:42})).to.equal(true);
    });
    it('when {}, returns false', function() {
      expect(_.isTruthy({})).to.equal(false);
    });
    it('when \'foo\', returns true', function() {
      expect(_.isTruthy('foo')).to.equal(true);
    });
    it('when \'\', returns false', function() {
      expect(_.isTruthy('')).to.equal(false);
    });
  });
  describe('hasSomeTruthyProps', function() {
    it('when undefined, returns false', function() {
      expect(_.hasSomeTruthyProps(undefined)).to.equal(false);
    });
    it('when null, returns false', function() {
      expect(_.hasSomeTruthyProps(null)).to.equal(false);
    });
    it('when no arg, returns false', function() {
      expect(_.hasSomeTruthyProps()).to.equal(false);
    });
    it('when not an object, returns false', function() {
      expect(_.hasSomeTruthyProps('azerty')).to.equal(false);
    });
    it('when {}, returns false', function() {
      expect(_.hasSomeTruthyProps({})).to.equal(false);
    });
    it('when {a:\'\'}, returns false', function() {
      expect(_.hasSomeTruthyProps({a:''})).to.equal(false);
    });
    it('when {a:false}, returns false', function() {
      expect(_.hasSomeTruthyProps({a:false})).to.equal(false);
    });
    it('when {a:undefined}, returns false', function() {
      expect(_.hasSomeTruthyProps({a:undefined})).to.equal(false);
    });
    it('when {a:null}, returns false', function() {
      expect(_.hasSomeTruthyProps({a:null})).to.equal(false);
    });
    it('when {a:0}, returns false', function() {
      expect(_.hasSomeTruthyProps({a:0})).to.equal(false);
    });
    it('when {a:false}, returns false', function() {
      expect(_.hasSomeTruthyProps({a:false})).to.equal(false);
    });
    it('when {a:42}, returns true', function() {
      expect(_.hasSomeTruthyProps({a:42})).to.equal(true);
    });
    it('when mixing true and false properties, returns true', function() {
      expect(_.hasSomeTruthyProps({a:42, b:false})).to.equal(true);
    });
    it('when many false properties, returns false', function() {
      expect(_.hasSomeTruthyProps({a:'', b:false})).to.equal(false);
    });
    it('when only true properties, returns true', function() {
      expect(_.hasSomeTruthyProps({a:42, b:true})).to.equal(true);
    });
  });

});
