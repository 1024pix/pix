import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { setupIntl, t } from 'ember-intl/test-support';

module('Unit | Service | Error messages', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  test('should return undefined when no error code', function (assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage(undefined);
    // Then
    assert.strictEqual(message, undefined);
  });

  test('should return undefined when no error code not found in mapping', function (assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('UNKNOWN_ERROR_CODE');
    // Then
    assert.strictEqual(message, undefined);
  });

  test('should return the message when error code is found', function (assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('CAMPAIGN_NAME_IS_REQUIRED');
    // Then
    assert.strictEqual(message, t('api-error-messages.campaign-creation.name-required'));
  });

  module('SEX_CODE_REQUIRED', function () {
    test('should return the message when error code is found', function (assert) {
      // Given
      const errorMessages = this.owner.lookup('service:errorMessages');
      // When
      const message = errorMessages.getErrorMessage('SEX_CODE_REQUIRED');
      // Then
      assert.strictEqual(message, t('api-error-messages.student-xml-import.sex-code-required'));
    });
  });

  module('BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT', function () {
    test('should return the message when error code is found', function (assert) {
      // Given
      const errorMessages = this.owner.lookup('service:errorMessages');
      // When
      const message = errorMessages.getErrorMessage('BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT');
      // Then
      assert.strictEqual(
        message,
        t('api-error-messages.student-xml-import.birth-city-code-required-for-french-student')
      );
    });
  });

  test('should return the message with parameters', function (assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('FIELD_MIN_LENGTH', { line: 1, field: 'Boo', limit: 2 });
    // Then
    assert.strictEqual(
      message,
      t('api-error-messages.student-csv-import.field-min-length', { line: 1, field: 'Boo', limit: 2 })
    );
  });

  test('should concatenate "valids" parameters', function (assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('FIELD_BAD_VALUES', { line: 1, field: 'Boo', valids: ['A', 'B'] });
    // Then
    assert.strictEqual(
      message,
      t('api-error-messages.student-csv-import.field-bad-values', {
        line: 1,
        field: 'Boo',
        valids: `A${t('api-error-messages.or-separator')}B`,
      })
    );
  });
});
