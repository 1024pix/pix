import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import isEmailValid from 'pix-orga/utils/email-validator';

module('Unit | Utils | email validator', (hooks) => {
  setupTest(hooks);

  module('Invalid emails', () => {
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
    ].forEach((badEmail) => {
      test(`should return false when email is invalid: ${badEmail}`, function(assert) {
        assert.equal(isEmailValid(badEmail), false);
      });
    });
  });

  module('Valid emails', () => {
    [
      'user@pix.fr',
      'user@pix.fr ',
      ' user@pix.fr',
      ' user@pix.fr ',
      ' user-beta@pix.fr ',
      ' user_beta@pix.fr ',
      'user+beta@pix.fr',
      'user+beta@pix.gouv.fr',
      'user+beta@pix.beta.gouv.fr',
    ].forEach((validEmail) => {
      test(`should return true if provided email is valid: ${validEmail}`, function(assert) {
        assert.equal(isEmailValid(validEmail), true);
      });
    });
  });
});
