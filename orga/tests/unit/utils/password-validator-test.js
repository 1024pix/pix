import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import isPasswordValid from 'pix-orga/utils/password-validator';

module('Unit | Utils | password validator', (hooks) => {
  setupTest(hooks);

  module('Validation rules', () => {

    test('should contain at least 8 characters:', function(assert) {
      assert.equal(isPasswordValid('Ab123456'), true);
      assert.equal(isPasswordValid('A1'), false);
    });

    test('should contain at least one digit', function(assert) {
      assert.equal(isPasswordValid('Ab123456'), true);
      assert.equal(isPasswordValid('ABCDEFGH'), false);
    });

    test('should contain at least one uppercase letter', function(assert) {
      assert.equal(isPasswordValid('Ab123456'), true);
      assert.equal(isPasswordValid('a1234567'), false);
    });

    test('should contain at least one lowercase letter', function(assert) {
      assert.equal(isPasswordValid('Ab123456'), true);
      assert.equal(isPasswordValid('A1234567'), false);
    });

  });

  module('Invalid password', () => {
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
      '+!@)-=`"#&1a',
    ].forEach((badPassword) => {
      test(`should return false when password is invalid: ${badPassword}`, function(assert) {
        assert.equal(isPasswordValid(badPassword), false);
      });
    });
  });

  module('Valid password', () => {
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
    ].forEach((validPassword) => {
      test(`should return true if provided password is valid: ${validPassword}`, function(assert) {
        assert.equal(isPasswordValid(validPassword), true);
      });
    });
  });
});
