import { expect } from 'chai';
import { describe, it } from 'mocha';
import _ from 'mon-pix/utils/lodash-custom';

describe('Unit | Utility | lodash custom', function() {

  describe('#isNonEmptyString', function() {

    it('when no arg, returns false', function() {
      expect(_.isNonEmptyString()).to.equal(false);
    });

    [
      { value: undefined, expected: false },
      { value: null, expected: false },
      { value: new Date(), expected: false },
      { value: '', expected: false },
      { value: 'abcd', expected: true }
    ].forEach((item) => {
      it(`should return ${item.expected} when value is ${item.value}`, function() {
        expect(_.isNonEmptyString(item.value)).to.equal(item.expected);
      });
    });
  });

  describe('#isNonEmptyArray', function() {

    it('when no arg, returns false', function() {
      expect(_.isNonEmptyArray()).to.equal(false);
    });

    [
      { value: undefined, expected: false },
      { value: null, expected: false },
      { value: new Date(), expected: false },
      { value: [], expected: false },
      { value: [''], expected: true },
      { value: ['myvalue'], expected: true },
      { value: ['1', null, true], expected: true }
    ].forEach((item) => {
      it(`should return ${item.expected} when value of array is ${JSON.stringify(item.value)}`, function() {
        expect(_.isNonEmptyArray(item.value)).to.equal(item.expected);
      });
    });
  });

  describe('#isNotInteger', function() {

    it('when no arg, returns false', function() {
      expect(_.isNotInteger()).to.equal(true);
    });

    [
      { value: undefined, expected: true },
      { value: 'undefined', expected: true },
      { value: null, expected: true },
      { value: '', expected: true },
      { value: 'abcd', expected: true },
      { value: 0, expected: false },
      { value: 5, expected: false },
      { value: '5', expected: true }
    ].forEach((item) => {
      it(`should return ${item.expected} when value is ${item.value}`, function() {
        expect(_.isNotInteger(item.value)).to.equal(item.expected);
      });
    });
  });

  describe('#isTruthy', function() {

    it('when no arg, returns false', function() {
      expect(_.isTruthy()).to.equal(false);
    });

    [
      { value: undefined, expected: false },
      { value: null, expected: false },
      { value: true, expected: true },
      { value: false, expected: false },
      { value: 0, expected: false },
      { value: 1, expected: true },
      { value: [], expected: false },
      { value: [1, 2, 3], expected: true },
      { value: { a: 42 }, expected: true },
      { value: {}, expected: false },
      { value: '', expected: false },
      { value: 'foo', expected: true }
    ].forEach((item) => {
      it(`should return ${item.expected} when value is ${item.value}`, function() {
        expect(_.isTruthy(item.value)).to.equal(item.expected);
      });
    });
  });

  describe('#hasSomeTruthyProps', function() {

    it('when no arg, returns false', function() {
      expect(_.hasSomeTruthyProps()).to.equal(false);
    });

    [
      { value: undefined, expected: false },
      { value: null, expected: false },
      { value: 'azerty', expected: false },
      { value: {}, expected: false },
      { value: { a: '' }, expected: false },
      { value: { a: false }, expected: false },
      { value: { a: undefined }, expected: false },
      { value: { a: null }, expected: false },
      { value: { a: 0 }, expected: false },
      { value: { a: false }, expected: false },
      { value: { a: 42 }, expected: true },
      { value: { a: 42, b: false }, expected: true },
      { value: { a: '', b: false }, expected: false },
      { value: { a: 42, b: true }, expected: true }
    ].forEach((item) => {
      it(`should return ${item.expected} when value is ${item.value}`, function() {
        expect(_.hasSomeTruthyProps(item.value)).to.equal(item.expected);
      });
    });
  });

  describe('#isNumeric', function() {

    [
      0,
      2,
      17,
      +17,
      -17,
      -0,
      .0,
      .17,
      -.17,
      1e17,
      1e-17,
      Infinity,
      -Infinity,
      new Number('123')
    ].forEach(function(n) {
      it(`should return true when it is already a number type [n=${n}]`, function() {
        expect(_.isNumeric(n)).to.be.true;
      });
    });

    [
      new String('1337'),
      '1337',
      '-1337',
      '1337.17',
      '-1337.17',
      '0017',
      '00000.017',
    ].forEach(function(n) {
      it(`should return true when it is a string that looks like a number [n=${n}]`, function() {
        expect(_.isNumeric(n)).to.be.true;
      });
    });

    [
      'abc',
      '6qwerty0',
      '17%',
      '-17%',
      '#17',
      '2^18',
      '17px',
      '*',
      '',
      true,
      false,
      [],
      {},
      function() {
      },
      undefined,
      null,
    ].forEach(function(n) {
      it(`should return false when it is a string that does not look like a number [n=${n}]`, function() {
        expect(_.isNumeric(n)).to.be.false;
      });
    });

  });

});
