import { module, test } from 'qunit';
import setupIntlRenderingTest from '../../../../../helpers/setup-intl-rendering';
import { render } from '@ember/test-helpers';
import fillInByLabel from '../../../../../helpers/extended-ember-test-helpers/fill-in-by-label';
import clickByLabel from '../../../../../helpers/extended-ember-test-helpers/click-by-label';
import hbs from 'htmlbars-inline-precompile';
import EmberObject from '@ember/object';

module('Integration | Component | routes/authenticated/campaign/update', (hooks) => {

  setupIntlRenderingTest(hooks);

  hooks.beforeEach(function() {
    this.campaign = EmberObject.create({ isTypeAssessment: true });
    this.set('updateCampaignSpy', (event) => event.preventDefault());
    this.set('cancelSpy', () => {});
  });

  test('it should contain inputs, attributes and validation button', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaign::Update @campaign={{this.campaign}} @update={{this.updateCampaignSpy}} @cancel={{this.cancelSpy}} />`);

    // then
    assert.dom('#campaign-custom-landing-page-text').exists();
    assert.dom('button[type="submit"]').exists();
    assert.dom('#campaign-custom-landing-page-text').hasAttribute('maxLength', '350');
  });

  test('it should send campaign update action when submitted', async function(assert) {
    // when
    await render(hbs`<Routes::Authenticated::Campaign::Update @campaign={{this.campaign}} @update={{this.updateCampaignSpy}} @cancel={{this.cancelSpy}} />`);

    // then
    await fillInByLabel('Titre du parcours', 'New title');
    await clickByLabel('Modifier');

    assert.deepEqual(this.campaign.title, 'New title');
  });

  module('When campaign type is ASSESSMENT', () => {
    test('it should display campaign title input', async function(assert) {
      this.campaign = EmberObject.create({ isTypeAssessment: true });

      await render(hbs`<Routes::Authenticated::Campaign::Update @campaign={{this.campaign}} @update={{this.updateCampaignSpy}} @cancel={{this.cancelSpy}} />`);

      assert.dom('input#campaign-title').exists();
      assert.dom('#campaign-title').hasAttribute('maxLength', '50');
    });
  });

  module('When campaign type is not ASSESSMENT', () => {
    test('it should not display campaign title input', async function(assert) {
      this.campaign = EmberObject.create({ isTypeAssessment: false });

      await render(hbs`<Routes::Authenticated::Campaign::Update @campaign={{this.campaign}} @update={{this.updateCampaignSpy}} @cancel={{this.cancelSpy}} />`);

      assert.dom('input#campaign-title').doesNotExist();
    });
  });
});
