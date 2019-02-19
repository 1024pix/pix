import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { run } from '@ember/runloop';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | routes/authenticated/campaign/details | participants-tab', function (hooks) {
  setupRenderingTest(hooks);

  let store;

  hooks.beforeEach(function () {
    run(() => {
      store = this.owner.lookup('service:store');
    });
  });

  test('it should display the participant list of the campaign', async function (assert) {
    // given
    const campaign = run(() => store.createRecord('campaign', {
      id: 1,
      name: 'campagne 1',
    }));

    this.set('campaign', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/details/participants-tab campaign=campaign}}`);

    // then
    assert.dom('.participant-list__header').hasText('Liste des participants');
  });
});
