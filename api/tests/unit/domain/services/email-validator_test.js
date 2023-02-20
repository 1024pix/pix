import { expect } from '../../../test-helper';
import service from '../../../../lib/domain/services/email-validator';

describe('Unit | Service | email-validator', function () {
  it('should return false when email is not provided', function () {
    expect(service.emailIsValid()).to.be.false;
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    '',
    ' ',
    null,
    'INVALID_EMAIL',
    'INVALID_EMAIL@',
    'INVALID_EMAIL@pix',
    'INVALID_EMAIL@pix.',
    '@pix.fr',
    '@pix',
  ].forEach(function (badEmail) {
    it(`should return false when email is invalid: ${badEmail}`, function () {
      expect(service.emailIsValid(badEmail)).to.be.false;
    });
  });

  // eslint-disable-next-line mocha/no-setup-in-describe
  [
    'follower@pix.fr',
    'follower@pix.fr ',
    ' follower@pix.fr',
    ' follower@pix.fr ',
    ' follower-beta@pix.fr ',
    ' follower_beta@pix.fr ',
    'follower+beta@pix.fr',
    'follower+beta@pix.gouv.fr',
    'follower+beta@pix.beta.gouv.fr',
  ].forEach(function (validEmail) {
    it(`should return true if provided email is valid: ${validEmail}`, function () {
      expect(service.emailIsValid(validEmail)).to.be.true;
    });
  });
});
