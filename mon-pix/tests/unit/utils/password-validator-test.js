import isPasswordvalid from 'mon-pix/utils/password-validator';
import { module, test } from 'qunit';

module('Unit | Utility | password validator', function () {
  module('Validation rules', function () {
    test('should contain at least 8 characters:', function (assert) {
      assert.true(isPasswordvalid('Ab123456'));
      assert.false(isPasswordvalid('A1'));
    });

    test('should contain at least one digit', function (assert) {
      assert.true(isPasswordvalid('Ab123456'));
      assert.false(isPasswordvalid('ABCDEFGH'));
    });

    test('should contain at least one uppercase letter', function (assert) {
      assert.true(isPasswordvalid('Ab123456'));
      assert.false(isPasswordvalid('a1234567'));
    });

    test('should contain at least one lowercase letter', function (assert) {
      assert.true(isPasswordvalid('Ab123456'));
      assert.false(isPasswordvalid('A1234567'));
    });
  });

  module('Invalid password', function () {
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
    ].forEach(function (badPassword) {
      test(`should return false when password is invalid: ${badPassword}`, function (assert) {
        assert.false(isPasswordvalid(badPassword));
      });
    });
  });

  module('Valid password', function () {
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
    ].forEach(function (validPassword) {
      test(`should return true if provided password is valid: ${validPassword}`, function (assert) {
        assert.true(isPasswordvalid(validPassword));
      });
    });
  });
});
