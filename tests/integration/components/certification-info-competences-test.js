import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | certification-info-competences', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    await render(hbs`{{certification-info-competences}}`);

    assert.dom('.certification-info-competences').exists();
  });

  test('it should display an entry per competence', async function(assert) {
    // Given
    this.set('competences', [{index:'1.1', score:'30', level:'3'}, {index:'2.1', score:'30', level:'3'}, {index:'5.2', score:'30', level:'3'}])
    assert.expect(3);

    // When
    await render(hbs`{{certification-info-competences competences=competences edition=false}}`);

    // Then
    assert.dom('.certification-info-competence-index').exists({count:3});
    assert.dom('.certification-info-competence-level').exists({count:3});
    assert.dom('.certification-info-competence-score').exists({count:3});
  });

  test('it should display competence index, score and level', async function(assert) {
    // Given
    this.set('competences', [{index:'1.1', score:'30', level:'3'}])
    assert.expect(3);

    // When
    await render(hbs`{{certification-info-competences competences=competences edition=false}}`);

    // Then
    assert.dom('.certification-info-competence-index').hasText('1.1');
    assert.dom('.certification-info-competence-level').hasText('Niveau : 3');
    assert.dom('.certification-info-competence-score').hasText('30 Pix');
  });
});
