const { describe, it, expect } = require('../../../test-helper');
const isPasswordvalid = require('../../../../lib/infrastructure/validators/password-validator');

describe('Unit | Validator | password-validator', function() {

  describe('Validation rules', function() {

    it('should contain at least 8 characters:', function() {
      expect(isPasswordvalid('ABCD1234')).to.be.true;
      expect(isPasswordvalid('A1')).to.be.false;
    });

    it('should contain at least one letter ', function() {
      expect(isPasswordvalid('ABCD1234')).to.be.true;
      expect(isPasswordvalid('12345678')).to.be.false;
    });

    it('should contain at least one digit', function() {
      expect(isPasswordvalid('ABCD1234')).to.be.true;
      expect(isPasswordvalid('ABCDEFGH')).to.be.false;
    });

  });

  describe('Invalid password', function() {
    [
      '',
      ' ',
      null,
      '@pix',
      '@pix.fr',
      '1      1',
      'password',
      '12345678&',
      '+!@)-=`"#&',
      '+!@)-=`"#&1'
    ].forEach(function(badPassword) {
      it(`should return false when password is invalid: ${badPassword}`, function() {
        expect(isPasswordvalid(badPassword)).to.be.false;
      });
    });
  });

  describe('Valid password', function() {
    [
      'PIXBETA1',
      'PIXBETA12',
      'NULLNULL1',
      '12345678a',
      '12345678ab',
      '12345678ab+',
      '12345678ab+!',
      '12345678ab+!@',
      '12345678ab+!@)-=`',
      '12345678ab+!@)-=`"',
      '12345678ab+!@)-=`"#&',
      '1234Password avec espace',
      '1A      A1',
      'à1      '
    ].forEach(function(validPassword) {
      it(`should return true if provided password is valid: ${validPassword}`, function() {
        expect(isPasswordvalid(validPassword)).to.be.true;
      });
    });
  });
});
