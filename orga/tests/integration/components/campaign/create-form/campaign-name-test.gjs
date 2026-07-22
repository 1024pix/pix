import { fillByLabel, render } from '@1024pix/ember-testing-library';
import { t } from 'ember-intl/test-support';
import CampaignName from 'pix-orga/components/campaign/create-form/campaign-name';
import { module, test } from 'qunit';

import setupIntlRenderingTest from '../../../../helpers/setup-intl-rendering';

module('Integration | Component | Campaign::CreateForm::CampaignName', function (hooks) {
  setupIntlRenderingTest(hooks);

  const data = {};

  hooks.beforeEach(function () {
    const store = this.owner.lookup('service:store');
    data.campaign = store.createRecord('campaign');
    data.errors = {};
  });

  test("it displays campaign's name", async function (assert) {
    // given
    data.campaign.name = 'Campagne de test';

    // when
    const screen = await render(
      <template><CampaignName @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert
      .dom(screen.getByLabelText(t('pages.campaign-creation.name.label'), { exact: false }))
      .hasValue('Campagne de test');
  });

  test('it updates the campaign name on input', async function (assert) {
    // given
    await render(<template><CampaignName @campaign={{data.campaign}} @errors={{data.errors}} /></template>);

    // when
    await fillByLabel(`${t('pages.campaign-creation.name.label')} *`, 'Ma campagne');

    // then
    assert.strictEqual(data.campaign.name, 'Ma campagne');
  });

  test('it displays an error message when the name field is empty', async function (assert) {
    // given
    data.errors = { name: [{ message: 'CAMPAIGN_NAME_IS_REQUIRED' }] };

    // when
    const screen = await render(
      <template><CampaignName @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert.dom(screen.getByText(t('api-error-messages.campaign-creation.name-required'))).exists();
  });
});
