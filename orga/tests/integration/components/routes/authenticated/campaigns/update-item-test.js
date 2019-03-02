import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/campaign | update-item', function(hooks) {
  setupRenderingTest(hooks);
  let campaign;

  hooks.beforeEach(function() {
    campaign = EmberObject.create({});
    this.set('updateCampaignSpy', (updatedCampaign) => {
      campaign = updatedCampaign;
    });
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`{{routes/authenticated/campaigns/update-item update=(action updateCampaignSpy) cancel=(action cancelSpy)}}`);

    // then
    assert.dom('#campaign-title').exists();
    assert.dom('#campaign-custom-landing-page-text').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#campaign-title').hasAttribute('maxLength', "50");
    assert.dom('#campaign-custom-landing-page-text').hasAttribute('maxLength', "350");
  });

  test('it should send campaign update action when submitted', async function(assert) {
    // given
    this.set('model', campaign);

    // when
    await render(hbs`{{routes/authenticated/campaigns/update-item campaign=model update=(action updateCampaignSpy) cancel=(action cancelSpy)}}`);

    // then
    await fillIn('#campaign-title', 'New title');
    await click('button[type="submit"]');

    assert.deepEqual(campaign.get('title'), 'New title');
  });
});
