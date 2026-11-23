import { setupTest } from 'ember-qunit';
import { CSV_IMPORT_ERRORS } from 'pix-orga/services/error-messages';
import { module, test } from 'qunit';

import setupIntl, { setCurrentLocale, t } from '../../helpers/setup-intl';

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

  module('LAST_NAME_REQUIRED', function () {
    test('should return the message when error code is found', function (assert) {
      // Given
      const errorMessages = this.owner.lookup('service:errorMessages');
      const nationalStudentId = '1234';
      // When
      const message = errorMessages.getErrorMessage('LAST_NAME_REQUIRED', { nationalStudentId });
      // Then
      assert.strictEqual(message, t('api-error-messages.student-xml-import.last-name-required', { nationalStudentId }));
    });
  });

  module('FIRST_NAME_REQUIRED', function () {
    test('should return the message when error code is found', function (assert) {
      // Given
      const errorMessages = this.owner.lookup('service:errorMessages');
      const nationalStudentId = '1234';
      // When
      const message = errorMessages.getErrorMessage('FIRST_NAME_REQUIRED', { nationalStudentId });
      // Then
      assert.strictEqual(
        message,
        t('api-error-messages.student-xml-import.first-name-required', { nationalStudentId }),
      );
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

  module('csv format error', function () {
    [
      { errorKey: 'FIELD_BAD_VALUES', meta: { line: 1, field: 'Boo', valids: ['A', 'B'] } },
      {
        errorKey: 'FIELD_DATE_FORMAT',
        meta: {
          line: 2,
          field: 'toto',
          acceptedFormat: 'jj/mm/aaaa',
        },
      },
      { errorKey: 'ENCODING_NOT_SUPPORTED', meta: undefined },
      { errorKey: 'BAD_CSV_FORMAT', meta: undefined },
      { errorKey: 'HEADER_REQUIRED', meta: { line: 1, field: 'Boo', acceptedFormat: 2 } },
      { errorKey: 'HEADER_UNKNOWN', meta: { field: 'Boo' } },
      { errorKey: 'FIELD_MAX_LENGTH', meta: { line: 1, field: 'Boo', acceptedFormat: 2 } },
      { errorKey: 'FIELD_LENGTH', meta: { line: 1, field: 'Boo', acceptedFormat: 2 } },
      { errorKey: 'FIELD_STRING_MIN', meta: { line: 1, field: 'Boo', acceptedFormat: 2 } },
      { errorKey: 'FIELD_STRING_MAX', meta: { line: 1, field: 'Boo', acceptedFormat: 2 } },
      { errorKey: 'FIELD_STRING_LENGTH', meta: { line: 1, field: 'Boo', acceptedFormat: 2 } },
      { errorKey: 'FIELD_STRING_PATTERN', meta: { line: 1, field: 'Boo' } },
      { errorKey: 'FIELD_EMAIL_FORMAT', meta: { line: 1, field: 'Boo' } },
      { errorKey: 'FIELD_REQUIRED', meta: { line: 1, field: 'Boo' } },
    ].forEach(({ errorKey, meta }) => {
      test(`should return the message ${CSV_IMPORT_ERRORS[errorKey]} with parameters`, function (assert) {
        // Given
        const errorMessages = this.owner.lookup('service:errorMessages');
        // When
        const message = errorMessages.getErrorMessage(errorKey, meta);
        // Then
        assert.strictEqual(message, t(CSV_IMPORT_ERRORS[errorKey], meta));
      });
    });

    module('FIELD_DATE_FORMAT', function () {
      test('should return the en message when error code is found without acceptedFormat', async function (assert) {
        // Given
        await setCurrentLocale('en');
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
    });
  });
});
