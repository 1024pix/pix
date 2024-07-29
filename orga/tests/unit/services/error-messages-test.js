import { setLocale, t } from 'ember-intl/test-support';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import setupIntl from '../../helpers/setup-intl';

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
      const nationalStudentId = '1234';
      // When
      const message = errorMessages.getErrorMessage('SEX_CODE_REQUIRED', { nationalStudentId });
      // Then
      assert.strictEqual(message, t('api-error-messages.student-xml-import.sex-code-required', { nationalStudentId }));
    });
  });

  module('BIRTHDATE_REQUIRED', function () {
    test('should return the message when error code is found', function (assert) {
      // Given
      const errorMessages = this.owner.lookup('service:errorMessages');
      const nationalStudentId = '1234';
      // When
      const message = errorMessages.getErrorMessage('BIRTHDATE_REQUIRED', { nationalStudentId });
      // Then
      assert.strictEqual(message, t('api-error-messages.student-xml-import.birthdate-required', { nationalStudentId }));
    });
  });

  module('INVALID_BIRTHDATE_FORMAT', function () {
    test('should return the message when error code is found', function (assert) {
      // Given
      const errorMessages = this.owner.lookup('service:errorMessages');
      const nationalStudentId = '1234';
      // When
      const message = errorMessages.getErrorMessage('INVALID_BIRTHDATE_FORMAT', { nationalStudentId });
      // Then
      assert.strictEqual(
        message,
        t('api-error-messages.student-xml-import.invalid-birthdate-format', { nationalStudentId }),
      );
    });
  });

  module('BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT', function () {
    test('should return the message when error code is found', function (assert) {
      // Given
      const errorMessages = this.owner.lookup('service:errorMessages');
      const nationalStudentId = '1234';
      // When
      const message = errorMessages.getErrorMessage('BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT', { nationalStudentId });
      // Then
      assert.strictEqual(
        message,
        t('api-error-messages.student-xml-import.birth-city-code-required-for-french-student', {
          nationalStudentId,
        }),
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
      t('api-error-messages.student-csv-import.field-min-length', { line: 1, field: 'Boo', limit: 2 }),
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
      }),
    );
  });

  module('csv format error', function () {
    module('FIELD_DATE_FORMAT', function () {
      test('should return the message when error code is found without acceptedFormat', function (assert) {
        // Given
        const errorMessages = this.owner.lookup('service:errorMessages');

        // When
        const message = errorMessages.getErrorMessage('FIELD_DATE_FORMAT', { line: 2, field: 'toto' });
        // Then
        assert.strictEqual(
          message,
          t('api-error-messages.student-csv-import.field-date-format', {
            line: 2,
            field: 'toto',
            acceptedFormat: 'jj/mm/aaaa',
          }),
        );
      });

      test('should return the en message when error code is found without acceptedFormat', function (assert) {
        // Given
        setLocale(['en']);
        const errorMessages = this.owner.lookup('service:errorMessages');

        // When
        const message = errorMessages.getErrorMessage('FIELD_DATE_FORMAT', { line: 2, field: 'toto' });
        // Then
        assert.strictEqual(
          message,
          t('api-error-messages.student-csv-import.field-date-format', {
            line: 2,
            field: 'toto',
            acceptedFormat: 'dd/mm/yyyy',
          }),
        );
      });

      test('should return the message when error code is found given acceptedFormat', function (assert) {
        // Given
        const errorMessages = this.owner.lookup('service:errorMessages');

        // When
        const message = errorMessages.getErrorMessage('FIELD_DATE_FORMAT', {
          line: 2,
          field: 'toto',
          acceptedFormat: 'withthisformat',
        });
        // Then
        assert.strictEqual(
          message,
          t('api-error-messages.student-csv-import.field-date-format', {
            line: 2,
            field: 'toto',
            acceptedFormat: 'withthisformat',
          }),
        );
      });
    });
  });
});
