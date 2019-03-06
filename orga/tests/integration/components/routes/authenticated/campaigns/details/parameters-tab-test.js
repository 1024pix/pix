import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | parameters-tab', function(hooks) {
  setupRenderingTest(hooks);
  
  let store;

  hooks.beforeEach(function() {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display target profile related to campaign', async function(assert) {
    // given
    const targetProfile = run(() => store.createRecord('targetProfile', {
      id: 1,
      name: 'profil cible de la campagne 1',
    }));
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
      targetProfile
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/parameters-tab campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-content:first-child .campaign-details-content__text').hasText('profil cible de la campagne 1');
  });
});
