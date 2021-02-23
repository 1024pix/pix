import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/target-profiles/target-profile | badges', function(hooks) {

  setupRenderingTest(hooks);

  test('it should display the badges title and an empty list', async function(assert) {
    // when
    await render(hbs`<TargetProfiles::Badges/>`);

    // then
    assert.contains('Résultats thématiques');
    assert.contains('Aucun résultat thématique associé');
  });
});
