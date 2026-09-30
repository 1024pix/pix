import { render } from '@1024pix/ember-testing-library';
import { fillIn } from '@ember/test-helpers';
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
    const screen = await render(
      <template><CampaignName @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // when
    await fillIn(screen.getByLabelText(t('pages.campaign-creation.name.label'), { exact: false }), 'Ma campagne');

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

  test('it displays a complementary information text', async function (assert) {
    // given
    // when
    const screen = await render(
      <template><CampaignName @campaign={{data.campaign}} @errors={{data.errors}} /></template>,
    );

    // then
    assert.dom(screen.getByLabelText(t('pages.campaign-creation.name.sub-label'), { exact: false })).exists();
  });
});
