import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import setupIntl from '../../helpers/setup-intl';

module('Unit | Service | Error messages', (hooks) => {
  setupTest(hooks);
  setupIntl(hooks);

  test('should return undefined when no error code', function(assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage(undefined);
    // Then
    assert.equal(message, undefined);
  });

  test('should return undefined when no error code not found in mapping', function(assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('UNKNOWN_ERROR_CODE');
    // Then
    assert.equal(message, undefined);
  });

  test('should return the message when error code is found', function(assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('CAMPAIGN_NAME_IS_REQUIRED');
    // Then
    assert.equal(message, 'Veuillez donner un nom à votre campagne.');
  });

  test('should return the message with parameters', function(assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('FIELD_MIN_LENGTH', { line: 1, field: 'Boo', limit: 2 });
    // Then
    assert.equal(message, 'Ligne 1 : Le champ “Boo” doit être d’au moins 2 caractères.');
  });

  test('should concatenate "valids" parameters', function(assert) {
    // Given
    const errorMessages = this.owner.lookup('service:errorMessages');
    // When
    const message = errorMessages.getErrorMessage('FIELD_BAD_VALUES', { line: 1, field: 'Boo', valids: ['A', 'B'] });
    // Then
    assert.equal(message, 'Ligne 1 : Le champ “Boo” doit être “A ou B”.');
  });
});
