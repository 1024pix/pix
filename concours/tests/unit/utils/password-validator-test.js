import { expect } from 'chai';
import { describe, it } from 'mocha';
import isPasswordvalid from 'mon-pix/utils/password-validator';

describe('Unit | Utility | password validator', function() {

  describe('Validation rules', function() {

    it('should contain at least 8 characters:', function() {
      expect(isPasswordvalid('Ab123456')).to.be.true;
      expect(isPasswordvalid('A1')).to.be.false;
    });

    it('should contain at least one digit', function() {
      expect(isPasswordvalid('Ab123456')).to.be.true;
      expect(isPasswordvalid('ABCDEFGH')).to.be.false;
    });

    it('should contain at least one uppercase letter', function() {
      expect(isPasswordvalid('Ab123456')).to.be.true;
      expect(isPasswordvalid('a1234567')).to.be.false;
    });

    it('should contain at least one lowercase letter', function() {
      expect(isPasswordvalid('Ab123456')).to.be.true;
      expect(isPasswordvalid('A1234567')).to.be.false;
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
        expect(isPasswordvalid(badPassword)).to.be.false;
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
      'Aà1      ',
    ].forEach(function(validPassword) {
      it(`should return true if provided password is valid: ${validPassword}`, function() {
        expect(isPasswordvalid(validPassword)).to.be.true;
      });
    });
  });
});
