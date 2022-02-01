import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import InputValidator from 'pix-orga/utils/input-validator';

module('Unit | Utils | input validator', function (hooks) {
  setupTest(hooks);

  test('should have error when validation fails', function (assert) {
    // given
    const validator = new InputValidator(Boolean, 'defaultMessage');

    // when
    validator.validate({ value: false });

    // then
    assert.true(validator.hasError);
  });

  test('should reset server message if resetServerMessage is true on validate', function (assert) {
    // given
    const validator = new InputValidator(Boolean, 'defaultMessage');
    validator.serverMessage = 'serverMessage';

    // when
    validator.validate({ value: false, resetServerMessage: true });

    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(validator.serverMessage, null);
  });

  test('should return server message rather than default message if it exists', function (assert) {
    // given
    const validator = new InputValidator(null, 'defaultMessage');

    // when
    validator.serverMessage = 'serverMessage';

    // then
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line qunit/no-assert-equal
    assert.equal(validator.message, 'serverMessage');
  });
});
