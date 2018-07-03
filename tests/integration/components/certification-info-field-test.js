import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-info-field', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{certification-info-field}}`);

    assert.dom('.certification-info-field').exists();
  });

  test('it renders label and field value', async function(assert) {
    // Given
    this.set('fieldValue', 'a field value');
    this.set('fieldLabel', 'a field label');
    assert.expect(2);

    // When
    await render(hbs`{{certification-info-field value=fieldValue label=fieldLabel edition=false}}`);

    // Then
    assert.dom('.certification-info-field .certification-info-label').hasText('a field label');
    assert.dom('.certification-info-field .certification-info-value').hasText('a field value');
  });

  test('it renders field value with suffix if provided', async function(assert) {
    // Given
    this.set('fieldValue', 'a field value');
    this.set('fieldLabel', 'a field label');
    this.set('fieldSuffix', ' SUFFIX');

    // When
    await render(hbs`{{certification-info-field value=fieldValue label=fieldLabel suffix=fieldSuffix edition=false}}`);

    // Then
    assert.dom('.certification-info-field .certification-info-value').hasText('a field value SUFFIX');
  });

});
