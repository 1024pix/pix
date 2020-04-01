import { expect } from 'chai';
import { describe, it } from 'mocha';
import isEmailValid from 'mon-pix/utils/email-validator';

describe('Unit | Utility | email validator', function() {
  describe('Invalid emails', function() {
    [
      '',
      ' ',
      null,
      'INVALID_EMAIL',
      'INVALID_EMAIL@',
      'INVALID_EMAIL@pix',
      'INVALID_EMAIL@pix.',
      '@pix.fr',
      '@pix'
    ].forEach(function(badEmail) {
      it(`should return false when email is invalid: ${badEmail}`, function() {
        expect(isEmailValid(badEmail)).to.be.false;
      });
    });
  });

  describe('Valid emails', function() {
    [
      'user@pix.fr',
      'user@pix.fr ',
      ' user@pix.fr',
      ' user@pix.fr ',
      ' user-beta@pix.fr ',
      ' user_beta@pix.fr ',
      'user+beta@pix.fr',
      'user+beta@pix.gouv.fr',
      'user+beta@pix.beta.gouv.fr'
    ].forEach(function(validEmail) {
      it(`should return true if provided email is valid: ${validEmail}`, function() {
        expect(isEmailValid(validEmail)).to.be.true;
      });
    });
  });
});
