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
    assert.contains('Clés de lecture');
    assert.contains('Aucune clé de lecture associée');
  });
});
