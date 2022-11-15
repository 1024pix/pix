import { module, test } from 'qunit';
import isPasswordvalid from 'mon-pix/utils/password-validator';

module('Unit | Utility | password validator', function () {
  module('Validation rules', function () {
    test('should contain at least 8 characters:', function (assert) {
      assert.equal(isPasswordvalid('Ab123456'), true);
      assert.equal(isPasswordvalid('A1'), false);
    });

    test('should contain at least one digit', function (assert) {
      assert.equal(isPasswordvalid('Ab123456'), true);
      assert.equal(isPasswordvalid('ABCDEFGH'), false);
    });

    test('should contain at least one uppercase letter', function (assert) {
      assert.equal(isPasswordvalid('Ab123456'), true);
      assert.equal(isPasswordvalid('a1234567'), false);
    });

    test('should contain at least one lowercase letter', function (assert) {
      assert.equal(isPasswordvalid('Ab123456'), true);
      assert.equal(isPasswordvalid('A1234567'), false);
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
        assert.equal(isPasswordvalid(badPassword), false);
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
        assert.equal(isPasswordvalid(validPassword), true);
      });
    });
  });
});
