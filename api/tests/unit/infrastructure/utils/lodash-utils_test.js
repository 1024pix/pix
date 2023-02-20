import { expect } from '../../../test-helper';
import original_lodash from 'lodash';
import _ from '../../../../lib/infrastructure/utils/lodash-utils';

describe('Unit | Utils | lodash-utils', function () {
  describe('#scope', function () {
    it('should not affect original version of lodash', function () {
      expect(original_lodash.elementAfter).not.to.exist;
      expect(_.elementAfter).to.exist;
    });
  });

  describe('#elementAfter', function () {
    it('for a given array and element in array (but not the last one), should return the element after the one provided', function () {
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'a')).to.equal('b');
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'b')).to.equal('c');
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'c')).to.equal('d');
    });
    it('for a given array and the LAST element in array, should return undefined', function () {
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'd')).to.equal(undefined);
    });
    it('for a given array and an element NOT in array, should return undefined', function () {
      expect(_.elementAfter(['a', 'b', 'c', 'd'], 'z')).to.equal(undefined);
    });
    it('for an empty array, should return undefined', function () {
      expect(_.elementAfter([], 'z')).to.equal(undefined);
    });
    it('if first arg is not an array, should return undefined', function () {
      expect(_.elementAfter(new Date(), 'a')).to.equal(undefined);
    });
    it('if last arg is missing, should return undefined', function () {
      expect(_.elementAfter(['a', 'b', 'c', 'd'])).to.equal(undefined);
    });
    it('if both args are is missing, should return undefined', function () {
      expect(_.elementAfter()).to.equal(undefined);
    });
  });

  describe('#areCSVequivalent', function () {
    it('when no arg are given, should return false', function () {
      expect(_.areCSVequivalent()).to.equal(false);
    });
    it('when two arg are given, but are not string, should return false', function () {
      expect(_.areCSVequivalent(['1,2,3'], ['1,2,3'])).to.equal(false);
      expect(_.areCSVequivalent(new Date(), new Date())).to.equal(false);
    });
    it('when two string are the same, should return true', function () {
      expect(_.areCSVequivalent('1,2,3', '1,2,3')).to.equal(true);
      expect(_.areCSVequivalent('azerty', 'azerty')).to.equal(true);
    });
    it('when element are the same but in different order, should return true', function () {
      expect(_.areCSVequivalent('1,2,3', '3,1,2')).to.equal(true);
    });
    it('when element have space around values, should return true', function () {
      expect(_.areCSVequivalent('2 , blabla, 1', 'blabla ,1,2')).to.equal(true);
    });
  });

  describe('#ensureString', function () {
    it('when no input, return an empty String', function () {
      expect(_.ensureString()).to.equal('');
    });
    it('when input is explicitly undefined, return an empty String', function () {
      expect(_.ensureString(undefined)).to.equal('');
    });
    it('when input is explicitly null, return an empty String', function () {
      expect(_.ensureString(null)).to.equal('');
    });
    it('when input is a number (typeof meaning), it returns a toString() version of the input', function () {
      expect(_.ensureString(42)).to.equal('42');
    });
    it('when input is a string (typeof meaning), it returns a toString() version of the input', function () {
      expect(_.ensureString('42')).to.equal('42');
    });
    it('when input is an object (typeof meaning), it returns a toString() version of the input', function () {
      expect(_.ensureString(/[aeiou]+/g)).to.equal('/[aeiou]+/g');
    });
    it('when input is an boolean (typeof meaning), it returns a toString() version of the input', function () {
      expect(_.ensureString(true)).to.equal('true');
    });
  });

  describe('#isBlank', function () {
    it('should return true if string is undefined', function () {
      expect(_.isBlank()).to.be.true;
    });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line mocha/no-setup-in-describe
    [null, '', ' ', '   ', '\t', '\r\n', '\n'].forEach(function (string) {
      it(`should return true if string is "${string}"`, function () {
        expect(_.isBlank(string)).to.be.true;
      });
    });

    // eslint-disable-next-line mocha/no-setup-in-describe
    ['a', ' a', 'a ', ' a ', '\ta\ta'].forEach(function (string) {
      it(`should return false if string is "${string}"`, function () {
        expect(_.isBlank(string)).to.be.false;
      });
    });
  });
});
