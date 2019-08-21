const { expect } = require('../../../test-helper');
const isPasswordValid = require('../../../../lib/infrastructure/validators/password-validator');

describe('Unit | Validator | password-validator', function() {

  describe('Validation rules', function() {

    it('should contain at least 8 characters:', function() {
      expect(isPasswordValid('Ab123456')).to.be.true;
      expect(isPasswordValid('Ab1')).to.be.false;
    });

    it('should contain at least one digit', function() {
      expect(isPasswordValid('Ab123456')).to.be.true;
      expect(isPasswordValid('AbCDEFGH')).to.be.false;
    });

    it('should contain at least one uppercase letter', function() {
      expect(isPasswordValid('Ab123456')).to.be.true;
      expect(isPasswordValid('ab123456')).to.be.false;
    });

    it('should contain at least one lowercase letter', function() {
      expect(isPasswordValid('Ab123456')).to.be.true;
      expect(isPasswordValid('AB123456')).to.be.false;
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
      '+!@)-=`"#&1',
      '+!@)-=`"#&1A',
      '+!@)-=`"#&1a'
    ].forEach(function(badPassword) {
      it(`should return false when password is invalid: ${badPassword}`, function() {
        expect(isPasswordValid(badPassword)).to.be.false;
      });
    });
  });

  describe('Valid password', function() {
    [
      'PIXBETa1',
      'PIXBETa12',
      'NULLNuLL1',
      '1234567Aa',
      '12345678Ab',
      '12345678Ab+',
      '12345678Ab+!',
      '12345678Ab+!@',
      '12345678Ab+!@)-=`',
      '12345678Ab+!@)-=`"',
      '12345678Ab+!@)-=`"#&',
      '1234Password avec espace',
      '1A      a1',
      'Aà1      '
    ].forEach(function(validPassword) {
      it(`should return true if provided password is valid: ${validPassword}`, function() {
        expect(isPasswordValid(validPassword)).to.be.true;
      });
    });
  });
});
