import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | TargetProfiles::Category', function (hooks) {
  setupRenderingTest(hooks);

  test('it should display the tag for type COMPETENCES', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::Category @category="COMPETENCES"/>`);

    // then
    assert.contains('Compétences Pix');
  });

  test('it should display the tag for type SUBJECT', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::Category @category="SUBJECT"/>`);

    // then
    assert.contains('Thématique');
  });

  test('it should display the tag for type DISCIPLINE', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::Category @category="DISCIPLINE"/>`);

    // then
    assert.contains('Disciplinaire');
  });

  test('it should display the tag for type CUSTOM', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::Category @category="CUSTOM"/>`);

    // then
    assert.contains('Sur-mesure');
  });

  test('it should display the tag for type PREDEFINED', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::Category @category="PREDEFINED"/>`);

    // then
    assert.contains('Prédéfinie');
  });

  test('it should display the tag for type OTHER', async function (assert) {
    // when
    await render(hbs`<TargetProfiles::Category @category="OTHER"/>`);

    // then
    assert.contains('Autre');
  });
});
