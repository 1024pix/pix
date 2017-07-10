import { expect } from 'chai';
import { describe, it } from 'mocha';
import isEmailValid from 'pix-live/utils/email-validator';

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
      'follower@pix.fr',
      'follower@pix.fr ',
      ' follower@pix.fr',
      ' follower@pix.fr ',
      ' follower-beta@pix.fr ',
      ' follower_beta@pix.fr ',
      'follower+beta@pix.fr',
      'follower+beta@pix.gouv.fr',
      'follower+beta@pix.beta.gouv.fr'
    ].forEach(function(validEmail) {
      it(`should return true if provided email is valid: ${validEmail}`, function() {
        expect(isEmailValid(validEmail)).to.be.true;
      });
    });
  });
});
