import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { click, fillIn, render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/campaign | update-item', function(hooks) {

  setupRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.campaign = EmberObject.create({});
    this.set('updateCampaignSpy', (event) => event.preventDefault());
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaigns::UpdateItem @campaign={{this.campaign}} @update={{this.updateCampaignSpy}} @cancel={{this.cancelSpy}} />`);

    // then
    assert.dom('#campaign-title').exists();
    assert.dom('#campaign-custom-landing-page-text').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#campaign-title').hasAttribute('maxLength', '50');
    assert.dom('#campaign-custom-landing-page-text').hasAttribute('maxLength', '350');
  });

  test('it should send campaign update action when submitted', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaigns::UpdateItem @campaign={{this.campaign}} @update={{this.updateCampaignSpy}} @cancel={{this.cancelSpy}} />`);

    // then
    await fillIn('#campaign-title', 'New title');
    await click('button[type="submit"]');

    assert.deepEqual(this.campaign.title, 'New title');
  });
});
