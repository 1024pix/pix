import {expect} from 'chai';
import {describe, it} from 'mocha';
import {setupTest} from 'ember-mocha';

describe('Unit | Service | EmailValidatorService', function () {

  setupTest('service:email-validator', {});
  let validator;
  beforeEach(function () {
    validator = this.subject();
  });

  it('exists', function () {
    expect(validator).to.be.ok;
  });

  describe('Test all case Invalid and then valid email', function () {
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
    ].forEach(function (badEmail) {
      it(`should return false when email is invalid: ${badEmail}`, function () {
        expect(validator.emailIsValid(badEmail)).to.be.false;
      });
    });

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
    ].forEach(function (validEmail) {
      it(`should return true if provided email is valid: ${validEmail}`, function () {
        expect(validator.emailIsValid(validEmail)).to.be.true;
      });
    });
  });


});
