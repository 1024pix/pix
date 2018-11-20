import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | campaign-update', function(hooks) {
  setupRenderingTest(hooks);
  let campaign;

  hooks.beforeEach(function() {
    campaign = new EmberObject({});
    this.set('updateCampaignSpy', (updatedCampaign) => {
      campaign = updatedCampaign;
    });
  });

  test('it should contain an input and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaign-update update=(action updateCampaignSpy)}}`);

    // then
    assert.dom('#campaign-title').exists();
    assert.dom('#campaign-custom-landing-page-text').exists();
    assert.dom('.campaign-form__validation-button').exists();
  });

  test('it should send campaign update action when submitted', async function(assert) {
    // given
    this.set('model', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaign-update campaign=model update=(action updateCampaignSpy)}}`);

    // then
    await fillIn('#campaign-title', 'New title');
    await click('.campaign-form__validation-button');

    assert.deepEqual(campaign.get('title'), 'New title');
  });
});
