import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign | details-item', function(hooks) {
  setupRenderingTest(hooks);

  test('it should display campaign details', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-header__title').hasText('campagne 1');
  });

  test('it should display target profile related to campaign', async function(assert) {
    // given
    let store = this.owner.lookup('service:store');
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
    await render(hbs`{{routes/authenticated/campaigns/details-item campaign=campaign}}`);

    // then
    assert.dom('.campaign-details-content:first-child .campaign-details-content__text').hasText('profil cible de la campagne 1');
  });
});
